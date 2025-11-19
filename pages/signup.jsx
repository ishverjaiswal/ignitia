import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup, signInWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(email, password, name);
      router.push("/home");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      router.push("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#0f0f10] p-7 rounded-xl border border-[#27272f] shadow-[0_0_35px_rgba(255,215,130,0.12)]">

        <h2 className="text-3xl font-bold text-center text-[#ffd678] mb-6 tracking-wide">
          Create an Account
        </h2>

        {error && (
          <p className="text-red-400 text-center mb-3 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="text-sm text-gray-300">Full name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-3 rounded bg-black border border-[#ffd678] text-white focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="Enter full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 rounded bg-black border border-[#ffd678] text-white focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="Enter email address"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 rounded bg-black border border-[#ffd678] text-white focus:ring-2 focus:ring-yellow-500 outline-none"
              placeholder="Create password"
            />
          </div>

          {/* Signup Button */}
          <button
            disabled={loading}
            className="w-full py-3 bg-[#ffd678] text-black font-bold rounded-lg hover:bg-yellow-300 transition-all shadow-[0_0_18px_rgba(255,215,130,0.45)]"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Google Sign in */}
        <div className="mt-5">
          <button
            onClick={handleGoogle}
            className="w-full py-3 rounded-lg border border-[#ffd678] text-[#ffd678] hover:bg-[#1b1b1f] transition"
          >
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-[#ffd678] hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
