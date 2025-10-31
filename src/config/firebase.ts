// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCk9XLNFswHNjcaJAriSlsNRFaAwbQF0xc",
  authDomain: "rent-a-car-user.firebaseapp.com",
  projectId: "rent-a-car-user",
  storageBucket: "rent-a-car-user.appspot.com", // corrected bucket for Firebase Storage
  messagingSenderId: "984381096489",
  appId: "1:984381096489:web:4b4043dcdddaab4f4ad238",
  measurementId: "G-VF05GV61XH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, analytics, db, storage };
export default app;
