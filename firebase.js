// Firebase for cacheing and storing info
import {initializeApp} from 'firebase/app'
import {getFirestore} from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyB6IqX2hABW8hESMo66dhzcPwOo_IQiPDI",
    authDomain: "twitter-chirp-2022.firebaseapp.com",
    projectId: "twitter-chirp-2022",
    storageBucket: "twitter-chirp-2022.appspot.com",
    messagingSenderId: "417595683190",
    appId: "1:417595683190:web:1a0a87ecfaf8b97de74a57"
};

// Init firebase
const app = initializeApp(firebaseConfig);
const firestoreDatabase = getFirestore(app);


export default firestoreDatabase;