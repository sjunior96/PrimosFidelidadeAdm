import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

// Your web app's Firebase configuration
let config = {
    apiKey: "AIzaSyAZEfNZVPOlU0jPB2T-FfTg8SRtxHceL1M",
    authDomain: "primosfidelidade-fa3da.firebaseapp.com",
    databaseURL: "https://primosfidelidade-fa3da.firebaseio.com",
    projectId: "primosfidelidade-fa3da",
    storageBucket: "primosfidelidade-fa3da.appspot.com",
    messagingSenderId: "608134031274",
    appId: "1:608134031274:web:97ac70092164a2d8e7add3",
    measurementId: "G-TH0WDCV9MT"
};

// Initialize Firebase
firebase.initializeApp(config);

export default firebase;