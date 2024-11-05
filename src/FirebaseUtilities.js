import {
	collection,
	getDocs,
	doc,
	getDoc,
	setDoc,
	updateDoc,
	deleteDoc,
	arrayUnion,
	arrayRemove,
	ref,
	uploadBytes,
	getDownloadURL
} from 'firebase/firestore';
import { storage, db } from './firebase'; // Stellen Sie sicher, dass diese Pfade korrekt sind.

// Rezepte abrufen
export const fetchRecipes = async () => {
	try {
		const recipeCollection = collection(db, 'recipes');
		const recipeSnapshot = await getDocs(recipeCollection);
		return recipeSnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		}));
	} catch (error) {
		console.error('Error fetching recipes: ', error);
		throw error;
	}
};

// Favoriten eines Benutzers abrufen
export const fetchFavorites = async (userId) => {
	try {
		const favoritesRef = doc(db, 'favorites', userId);
		const favoritesDoc = await getDoc(favoritesRef);
		if (favoritesDoc.exists()) {
			return favoritesDoc.data().favoriteRecipes || [];
		}
		return [];
	} catch (error) {
		console.error('Error fetching favorites: ', error);
		throw error;
	}
};

// Rezept aktualisieren
export const updateRecipe = async (id, updatedData) => {
	try {
		const recipeRef = doc(db, 'recipes', id);
		await updateDoc(recipeRef, updatedData);
	} catch (error) {
		console.error('Error updating recipe: ', error);
		throw error;
	}
};

// Rezept löschen
export const deleteRecipe = async (id) => {
	try {
		const recipeRef = doc(db, 'recipes', id);
		await deleteDoc(recipeRef);
	} catch (error) {
		console.error('Error deleting recipe: ', error);
		throw error;
	}
};

// Bild hochladen
export const uploadImage = async (imageFile) => {
	try {
		const imageRef = ref(storage, `images/${imageFile.name}`);
		const snapshot = await uploadBytes(imageRef, imageFile);
		return await getDownloadURL(snapshot.ref);
	} catch (error) {
		console.error('Error uploading image: ', error);
		throw error;
	}
};

// Favorit hinzufügen
export const addFavorite = async (userId, recipeId) => {
	try {
		const favoritesRef = doc(db, 'favorites', userId);
		await updateDoc(favoritesRef, {
			favoriteRecipes: arrayUnion(recipeId),
		});
	} catch (error) {
		console.error('Error adding favorite: ', error);
		throw error;
	}
};

// Favorit entfernen
export const removeFavorite = async (userId, recipeId) => {
	try {
		const favoritesRef = doc(db, 'favorites', userId);
		await updateDoc(favoritesRef, {
			favoriteRecipes: arrayRemove(recipeId),
		});
	} catch (error) {
		console.error('Error removing favorite: ', error);
		throw error;
	}
};
