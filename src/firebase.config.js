
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDXIWRyL2nwYEWtCnoLA8NxLbSP6q9zq_4",
  authDomain: "cook-book-cc54a.firebaseapp.com",
  projectId: "cook-book-cc54a",
  storageBucket: "cook-book-cc54a.appspot.com",
  messagingSenderId: "862368538990",
  appId: "1:862368538990:web:dd870409ae9f068214217f"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

export { db }