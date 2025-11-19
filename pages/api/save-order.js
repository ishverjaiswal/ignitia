import admin from '../../lib/firebaseAdmin'

// POST /api/save-order
// Body: { idToken, order: { itemId, itemName, amountPaid, transactionId, paymentStatus, userName?, userEmail? }, paymentProvider?, paymentData? }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { idToken, order, paymentProvider = null, paymentData = null } = req.body || {}


    if (!order || !order.itemId || !order.amountPaid || !order.transactionId) {
      return res.status(400).json({ error: 'Missing required order fields' })
    }

    if (!idToken) {
      return res.status(401).json({ error: 'Missing idToken' })
    }

    // Verify Firebase ID token to authenticate the user server-side
    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    // Build order document (serverTimestamp for createdAt)
    const orderDoc = {
      userId: uid,
      userName: order.userName || decoded.name || null,
      userEmail: order.userEmail || decoded.email || null,
      itemId: order.itemId,
      itemName: order.itemName || null,
      amountPaid: Number(order.amountPaid),
      transactionId: order.transactionId,
      paymentStatus: order.paymentStatus || 'success',
      paymentProvider,
      paymentData: paymentData || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    // Use a unique idempotency key if provided (so retries don't create duplicates)
    // e.g. paymentData?.order_id or transactionId
    const idempotencyKey = order.transactionId || (paymentData && paymentData.id) || null

    const db = admin.firestore()

    if (idempotencyKey) {
      // Write using a deterministically-named document to make saves idempotent
      const docRef = db.collection('orders').doc(idempotencyKey)
      // If document exists, we won't overwrite useful existing data; instead merge
      await docRef.set(orderDoc, { merge: true })
      return res.status(201).json({ id: docRef.id })
    }

    const ref = await db.collection('orders').add(orderDoc)
    return res.status(201).json({ id: ref.id })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('save-order error', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
