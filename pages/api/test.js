import admin from "../../lib/firebaseAdmin";

export default async function handler(req, res) {
  try {
    const db = admin.firestore();
    const ref = await db.collection("orders").add({
      test: true,
      time: new Date(),
    });

    return res.json({ success: true, id: ref.id });
  } catch (e) {
    return res.json({ error: e.message });
  }
}
