# JeevanSetu - Auth Module (Next.js + Firebase)

This workspace contains a minimal authentication module for a Next.js app using Firebase (modular SDK v10) and Tailwind CSS.

Features implemented:
- Email/password signup
- Email/password login
- Google login
- Logout
- Forgot password (email reset)
- Firestore `users` collection with: uid, name, email, role, createdAt
- Persistent auth state with context
- Protected route wrapper
- Tailwind CSS styles

Important setup steps:
1. Install dependencies:

   npm install

2. Configure Firebase:
   - Open `firebase.js` and replace the `firebaseConfig` placeholder values with your Firebase project config.
   - Enable Email/Password and Google sign-in in Firebase Console.

3. Start the dev server:

   npm run dev

Pages:
- `/signup` - Signup
- `/login` - Login
- `/forgot-password` - Password reset
- `/dashboard` - Protected dashboard

Notes & next steps:
- This is intentionally minimal to be easy to integrate. Add form validation, error handling UX, and tests as needed.
- If your Next.js project uses the App Router, you can adapt these files into the `/app` folder.

Firestore security rules
To fix permission-denied errors when reading `users/{uid}` documents, add and deploy the following secure Firestore rules (they allow each authenticated user to access only their own user document):

```text
rules_version = '2';

service cloud.firestore {
   match /databases/{database}/documents {
      match /users/{userId} {
         allow create: if request.auth != null && request.auth.uid == userId;
         allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      }

      match /{document=**} {
         allow read, write: if false;
      }
   }
}
```

How to deploy these rules:
## Razorpay setup

To enable online payments with Razorpay you must:

1. Install the Razorpay Node SDK in your project:

```powershell
npm install razorpay
```

2. Configure environment variables (e.g., in `.env.local`):

```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

3. The app includes two API endpoints:
- `POST /api/create-order` - creates an order with Razorpay (server uses `RAZORPAY_KEY_ID/SECRET`).
- `POST /api/verify-payment` - verifies the payment signature using HMAC SHA256.

4. After setting env vars, restart the dev server. Use the Events page and the cart "Proceed to Pay" button to create an order and open the Razorpay checkout.

Note: For production use, secure your keys and store order/payment records in your database.

1. Install and login with Firebase CLI (if not already done):

```powershell
npm i -g firebase-tools
firebase login
```

2. Create a `firestore.rules` file in your project (this repo already contains one at the project root).

3. Initialize (if not already):

```powershell
firebase init firestore
```

When prompted, choose the existing Firebase project and point the rules file to `firestore.rules`.

4. Deploy rules:

```powershell
firebase deploy --only firestore:rules
```

Testing locally (optional):

```powershell
firebase emulators:start --only firestore
```

If you want, I can attempt to deploy the rules for you from this workspace — tell me if your Firebase project is already configured here (a `firebase.json` file) and if you're logged in. Otherwise, follow the steps above in your terminal.

