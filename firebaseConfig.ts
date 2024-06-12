import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5GA9_VByGjAzkI7yvxuMh7MsZPlSVr90",
  authDomain: "stock-tracker-c386c.firebaseapp.com",
  projectId: "stock-tracker-c386c",
  storageBucket: "stock-tracker-c386c.appspot.com",
  messagingSenderId: "484019630242",
  appId: "1:484019630242:web:150d8adb01bbe2a5ebe7fb",
  measurementId: "G-DYYDVHQLR5",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

export {auth, db};
export default firebase;
