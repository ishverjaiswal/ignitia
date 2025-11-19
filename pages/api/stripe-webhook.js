import admin from '../../lib/firebaseAdmin'
import Stripe from 'stripe'

// Stripe webhook handler — use raw body and verify signature
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper to read raw body into a Buffer
async function getRawBody(req) {
  return await new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', (err) => reject(err))
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed')

  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeSecret || !webhookSecret) {
    console.error('Stripe secrets not configured')
    return res.status(500).end('Stripe secrets not configured')
  }

  const stripe = new Stripe(stripeSecret)
  let event
  try {
    const raw = await getRawBody(req)
    const sig = req.headers['stripe-signature']
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook construct failed', err)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object
      const metadata = pi.metadata || {}

      const orderDoc = {
        userId: metadata.uid || null,
        userName: metadata.userName || null,
        userEmail: metadata.userEmail || pi.receipt_email || null,
        itemId: metadata.itemId || null,
        itemName: metadata.itemName || null,
        // Stripe amounts are in cents by default; choose consistent unit
        amountPaid: (pi.amount_received != null) ? Number(pi.amount_received) / 100 : null,
        transactionId: pi.id,
        paymentStatus: 'success',
        paymentProvider: 'stripe',
        paymentData: pi,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }

      const db = admin.firestore()
      await db.collection('orders').doc(pi.id).set(orderDoc, { merge: true })
      // You can additionally create a separate record in reconciliations or user docs
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Stripe webhook handling error', err)
    res.status(500).end()
  }
}
