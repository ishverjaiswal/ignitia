import nodemailer from "nodemailer";

let otpStore = {}; // Temporary OTP storage

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Invalid Method" });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP (expires in 5 min)
  otpStore[email] = otp;
  setTimeout(() => delete otpStore[email], 5 * 60 * 1000);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "IGNITIA Password Reset OTP",
      html: `
        <h2>Your Password Reset OTP</h2>
        <p style="font-size: 22px; font-weight: bold;">${otp}</p>
        <p>OTP expires in 5 minutes.</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("MAIL ERROR:", err);
    res.status(500).json({ success: false, error: "Email sending failed" });
  }
}

export { otpStore };
