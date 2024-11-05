// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Deine Firebase-Konfiguration
const firebaseConfig = {
	apiKey: 'AIzaSyAsAMhHNLz4eb-Mi-m6B7stgu51xRyUJPw',
	authDomain: 'nixtox-8cd66.firebaseapp.com',
	projectId: 'nixtox-8cd66',
	storageBucket: 'nixtox-8cd66.appspot.com',
	messagingSenderId: '743749358270',
	appId: '1:743749358270:web:be958554cceda60ce2c4ef',
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
