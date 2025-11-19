import crypto from 'crypto'

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_secret) return res.status(500).json({ error: 'Razorpay key secret not configured' })

  try{
    const generated = crypto.createHmac('sha256', key_secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    const success = generated === razorpay_signature
    if (success) {
      // TODO: persist payment record to DB if needed
      return res.status(200).json({ ok: true })
    }
    return res.status(400).json({ ok: false, error: 'Invalid signature' })
  }catch(err){
    console.error('verify-payment err', err)
    const payload = { error: 'Verification failed' }
    if (process.env.NODE_ENV !== 'production' && err && err.message) payload.details = err.message
    return res.status(500).json(payload)
  }
}
