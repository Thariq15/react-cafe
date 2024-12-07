// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getAuth} from 'firebase/auth'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmXlgOT41xwPDyHeQW3UI8KpUV_LyrqXw",
  authDomain: "fp-project-efcaf.firebaseapp.com",
  projectId: "fp-project-efcaf",
  storageBucket: "fp-project-efcaf.firebasestorage.app",
  messagingSenderId: "985508236323",
  appId: "1:985508236323:web:4756a2299977ff24d43596",
  measurementId: "G-C7E8XW09KN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export { db };