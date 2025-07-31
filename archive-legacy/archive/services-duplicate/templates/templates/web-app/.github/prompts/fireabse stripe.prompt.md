---
mode: agent
---

Here is the firebase config. Use this for local and Vercel preview testing: //
Your web app's Firebase configuration // For Firebase JS SDK v7.20.0 and later,
measurementId is optional const firebaseConfig = { apiKey:
"AIzaSyAjHY7ljjphYfWq-AlyD4-rxTc5_qNkhb8", authDomain:
"metu-template.firebaseapp.com", projectId: "metu-template", storageBucket:
"metu-template.firebasestorage.app", messagingSenderId: "199667098018", appId:
"1:199667098018:web:1de2ec9fd5e749272192fb", measurementId: "G-J4BJY0T9WV" };

Authentication is enabled for emai/password, phone (with test phone number
"+40723456123" and verification code "123456"), google.

Also installed the "Run Payments with Stripe" Firebase Extension
https://extensions.dev/extensions/invertase/firestore-stripe-payments and
configured for a Stripe Sandbox. You can use my library stripe-firebase
(https://www.npmjs.com/package/stripe-firebase) to interact with firebase
extension cloud run functions.

All The webhook events will be sent to the cloud run events handler, part of
them handled already by the firebase extension but many others are missing I
believe like invoices, etc that I also want this template to have.

Think, plan, remember, start implementing
