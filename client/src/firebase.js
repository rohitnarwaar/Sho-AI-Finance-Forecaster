import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgZowLQxRQ-x8B0DvWngn20hjEd0DBnGU",
  authDomain: "sho-finance-forecaster.firebaseapp.com",
  projectId: "sho-finance-forecaster",
  storageBucket: "sho-finance-forecaster.firebasestorage.app",
  messagingSenderId: "855537220906",
  appId: "1:855537220906:web:fd99b990a9beb7792b7253"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
