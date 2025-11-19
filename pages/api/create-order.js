import Razorpay from 'razorpay'

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { amount } = req.body // expected in rupees (e.g., 499)
  if (!amount) return res.status(400).json({ error: 'Missing amount' })

  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) return res.status(500).json({ error: 'Razorpay keys not configured in env' })

  try{
    const instance = new Razorpay({ key_id, key_secret })
    const amountPaise = Math.round(Number(amount) * 100)
    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
    }
    const order = await instance.orders.create(options)
    return res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency, key: key_id })
  }catch(err){
    console.error('create-order err', err)
    const payload = { error: 'Failed to create order' }
    if (process.env.NODE_ENV !== 'production' && err && err.message) payload.details = err.message
    return res.status(500).json(payload)
  }
}
