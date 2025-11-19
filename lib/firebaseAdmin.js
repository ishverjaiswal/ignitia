import admin from 'firebase-admin'

// Initialize Firebase Admin SDK safely in server environments.
// Provide a JSON service account via the environment variable
// `FIREBASE_SERVICE_ACCOUNT` (stringified JSON) or rely on
// application default credentials in production (recommended on Vercel/GCP).
if (!admin.apps || admin.apps.length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT || null
  try {
    if (serviceAccount) {
      const creds = JSON.parse(serviceAccount)
      admin.initializeApp({
        credential: admin.credential.cert(creds),
      })
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      })
    }
  } catch (e) {
    // If initialization fails, throw so errors are visible during build/deploy.
    // This helps to ensure env vars are configured correctly.
    // In production, prefer applicationDefault() and set the service account
    // in the hosting environment as recommended by Firebase.
    // eslint-disable-next-line no-console
    console.error('Firebase admin initialization error', e)
    throw e
  }
}

export default admin
