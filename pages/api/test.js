import admin from "../../lib/firebaseAdmin";

// Protected test endpoint to verify Admin SDK can write to Firestore in deployed env.
// Usage: set env var DEBUG_TEST_TOKEN on the server, then call with header `x-debug-token: <token>`.
export default async function handler(req, res) {
  const token = process.env.DEBUG_TEST_TOKEN;
  const supplied = req.headers['x-debug-token'];
  if (!token || !supplied || supplied !== token) {
    return res.status(403).json({ error: 'Forbidden. Missing or invalid debug token.' });
  }

  try {
    const db = admin.firestore();
    const ref = await db.collection("orders").add({
      debugTest: true,
      env: process.env.NEXT_PUBLIC_VERCEL_ENV || null,
      time: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, id: ref.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
