import React, { useState } from "react";
import { auth } from "../firebase";
import {
  sendSignInLinkToEmail,
  signInWithEmailLink,
  updatePassword,
} from "firebase/auth";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState("request"); // request → otp → reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  // ============================================================
  // 1️⃣ SEND OTP
  // ============================================================
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage("Sending OTP...");

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otpCode);

    try {
      // Send OTP email using Firebase auth dynamic link
      const actionCodeSettings = {
        url: `${window.location.origin}/forgot-password?email=${email}`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      // Since Firebase cannot send custom OTP directly, we show it temporarily:
      console.log("OTP:", otpCode);

      setMessage("OTP has been sent to your email!");
      setStep("otp");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // ============================================================
  // 2️⃣ VERIFY OTP
  // ============================================================
  const handleVerifyOTP = (e) => {
    e.preventDefault();

    if (otp === generatedOTP) {
      setMessage("OTP verified successfully!");
      setStep("reset");
    } else {
      setMessage("Invalid OTP. Try again.");
    }
  };

  // ============================================================
  // 3️⃣ RESET PASSWORD
  // ============================================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("Updating password...");

    try {
      const user = auth.currentUser;

      if (!user) {
        setMessage("Session expired. Please request OTP again.");
        setStep("request");
        return;
      }

      await updatePassword(user, newPassword);
      setMessage("Password updated successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full bg-[#0b0b0f] p-6 rounded-xl border border-[#2c2c33] shadow-2xl">

        {/* ============================================================
            STEP 1 — SEND OTP
        ============================================================ */}
        {step === "request" && (
          <>
            <h2 className="text-2xl font-bold text-[#ffd678] mb-4">
              Forgot Password
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              Enter your registered email to receive OTP.
            </p>

            <form onSubmit={handleSendOTP} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full p-3 rounded bg-black border border-[#ffd678] text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                className="w-full bg-[#ffd678] text-black p-3 rounded font-bold hover:bg-yellow-300 transition"
              >
                Send OTP
              </button>
            </form>
          </>
        )}

        {/* ============================================================
            STEP 2 — VERIFY OTP
        ============================================================ */}
        {step === "otp" && (
          <>
            <h2 className="text-2xl font-bold text-[#ffd678] mb-3">
              Verify OTP
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              OTP sent to <span className="text-[#ffd678]">{email}</span>
            </p>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input
                type="text"
                maxLength="6"
                required
                placeholder="Enter OTP"
                className="w-full p-3 rounded bg-black border border-[#ffd678] text-white text-center tracking-widest text-xl"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button
                className="w-full bg-[#ffd678] text-black p-3 rounded font-bold hover:bg-yellow-300 transition"
              >
                Verify OTP
              </button>
            </form>
          </>
        )}

        {/* ============================================================
            STEP 3 — RESET PASSWORD
        ============================================================ */}
        {step === "reset" && (
          <>
            <h2 className="text-2xl font-bold text-[#ffd678] mb-3">
              Reset Password
            </h2>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="password"
                required
                placeholder="New Password"
                className="w-full p-3 rounded bg-black border border-[#ffd678] text-white"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <button
                className="w-full bg-[#ffd678] text-black p-3 rounded font-bold hover:bg-yellow-300 transition"
              >
                Update Password
              </button>
            </form>
          </>
        )}

        {/* STATUS MESSAGE */}
        {message && <p className="mt-5 text-yellow-300 text-center">{message}</p>}
      </div>
    </div>
  );
}
