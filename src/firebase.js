import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';

const config = {
  apiKey: "AIzaSyBDoNKIfs3ncUgWQ_B2tgBLUk7fB4Pqvzk",
  authDomain: "react-rjh.firebaseapp.com",
  databaseURL: "https://react-rjh.firebaseio.com",
  projectId: "react-rjh",
  storageBucket: "react-rjh.appspot.com",
  messagingSenderId: "338402334247"
};
firebase.initializeApp(config);
firebase.firestore().settings({
  timestampsInSnapshots: true,
});

firebase.firestore().enablePersistence()
  .catch((err) => {
    console.log(`Could not enable persistence: ${err.code}`)
  });

export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();

export default firebase;