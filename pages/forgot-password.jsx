import React, { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Send a Firebase password-reset email. This uses Firebase's built-in
  // password reset flow which sends a secure link to the user's email.
  const handleSendReset = async (e) => {
    e.preventDefault();
    setMessage("Sending password reset email...");

    try {
      const actionCodeSettings = {
        // After clicking the reset link, user will be returned to this URL.
        url: `${window.location.origin}/login`,
        // Whether to open the link in the app (not required for web)
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setMessage(
        'Password reset email sent. Please check your inbox (and spam folder). Follow the link to reset your password.'
      );
    } catch (error) {
      // Friendly error message for common mistakes
      console.error('sendPasswordResetEmail error:', error);
      if (error.code === 'auth/user-not-found') setMessage('No account found with that email.');
      else if (error.code === 'auth/invalid-email') setMessage('Please enter a valid email address.');
      else setMessage(error.message || 'Failed to send password reset email.');
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
