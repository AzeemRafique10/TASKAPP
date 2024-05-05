import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyC29SoemLtkyJ5j9eKfgpKcYIphq8Pragw",
  authDomain: "task-f4c2d.firebaseapp.com",
  projectId: "task-f4c2d",
  storageBucket: "task-f4c2d.appspot.com",
  messagingSenderId: "372405608745",
  appId: "1:372405608745:web:0c5c219a9bd53673501738",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
