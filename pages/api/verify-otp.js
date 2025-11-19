import { otpStore } from "./send-otp";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Invalid Method" });

  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ error: "Missing fields" });

  if (otpStore[email] === otp) {
    delete otpStore[email];
    return res.status(200).json({ success: true });
  }

  return res.status(200).json({ success: false });
}
