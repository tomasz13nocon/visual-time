import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyASJVLtr4DZQS6ibuh5gn7-dZUfId-zSfw",
  authDomain: "time-tracker-6e872.firebaseapp.com",
  projectId: "time-tracker-6e872",
  storageBucket: "time-tracker-6e872.appspot.com",
  messagingSenderId: "901789866165",
  appId: "1:901789866165:web:ab8e893f75fd4d4f65c6fc",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
