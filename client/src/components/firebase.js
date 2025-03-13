// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, get } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyA5TTBXxO_WuJSUZNN2Yck7fWgD8yFxwZs",
  authDomain: "mmfb-eebf1.firebaseapp.com",
  databaseURL: "https://mmfb-eebf1-default-rtdb.firebaseio.com",
  projectId: "mmfb-eebf1",
  storageBucket: "mmfb-eebf1.firebasestorage.app",
  messagingSenderId: "636395933168",
  appId: "1:636395933168:web:e25eb456500ddd40e02135",
  measurementId: "G-KKHTE4T29Y"
};

// Initialize Firebase
const cong = initializeApp(firebaseConfig);
const database = getDatabase(cong);
export { database, ref, set, push, get };
export default cong;