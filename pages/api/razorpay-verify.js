import crypto from 'crypto'
import admin from '../../lib/firebaseAdmin'

// POST /api/razorpay-verify
// body: { idToken, paymentData: { razorpay_payment_id, razorpay_order_id, razorpay_signature }, order: { itemId, itemName, amountPaid, userName?, userEmail? } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { idToken, paymentData, order } = req.body || {}
    
    if (!idToken || !paymentData || !order) return res.status(400).json({ error: 'Missing required fields' })

    const { razorpay_payment_id: payment_id, razorpay_order_id: order_id, razorpay_signature: signature } = paymentData
    if (!payment_id || !order_id || !signature) return res.status(400).json({ error: 'Invalid payment data' })

    // Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    // Verify Razorpay signature server-side
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) return res.status(500).json({ error: 'Razorpay secret not configured' })
    const payload = `${order_id}|${payment_id}`
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    if (expected !== signature) {
      return res.status(400).json({ error: 'Invalid signature' })
    }

    // Build order document
    const orderDoc = {
      userId: uid,
      userName: order.userName || decoded.name || null,
      userEmail: order.userEmail || decoded.email || null,
      itemId: order.itemId,
      itemName: order.itemName || null,
      amountPaid: Number(order.amountPaid),
      transactionId: payment_id,
      paymentStatus: 'success',
      paymentProvider: 'razorpay',
      paymentData: paymentData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const db = admin.firestore()
    // Idempotent save using payment_id as document id
    await db.collection('orders').doc(payment_id).set(orderDoc, { merge: true })

    return res.status(201).json({ id: payment_id })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('razorpay-verify error', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
