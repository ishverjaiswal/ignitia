import React, { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendReset = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const actionCodeSettings = {
        url: typeof window !== "undefined" ? `${window.location.origin}/login` : "/",
        handleCodeInApp: false,
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setMessage(
        "Password reset email sent. Please check your inbox (and spam folder)."
      );
    } catch (error) {
      console.error("sendPasswordResetEmail error:", error);
      if (error.code === "auth/user-not-found") setMessage("No account found with that email.");
      else if (error.code === "auth/invalid-email") setMessage("Please enter a valid email address.");
      else setMessage(error.message || "Failed to send password reset email.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full bg-[#0b0b0f] p-6 rounded-xl border border-[#2c2c33] shadow-2xl">
        <h2 className="text-2xl font-bold text-[#ffd678] mb-4">Forgot Password</h2>
        <p className="text-gray-300 text-sm mb-4">Enter your registered email to receive a password reset link.</p>

        <form onSubmit={handleSendReset} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="w-full p-3 rounded bg-black border border-[#ffd678] text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ffd678] text-black p-3 rounded font-bold hover:bg-yellow-300 transition"
          >
            {loading ? "Sending…" : "Send reset email"}
          </button>
        </form>

        {message && <p className="mt-5 text-yellow-300 text-center">{message}</p>}
      </div>
    </div>
  );
}
