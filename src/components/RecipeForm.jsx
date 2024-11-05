import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { updateDoc, doc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const RecipeForm = ({ recipe, onSave, onCancel }) => {
    const [editedTitle, setEditedTitle] = useState(recipe.title);
    const [editedDescription, setEditedDescription] = useState(recipe.description);
    const [editedIngredients, setEditedIngredients] = useState(recipe.ingredients);
    const [editedSteps, setEditedSteps] = useState(recipe.steps);
    const [editedImage, setEditedImage] = useState(null);

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const imageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(imageRef);
        setEditedImage(imageUrl);
    };

    const saveChanges = async () => {
        if (!editedTitle || !editedDescription || !editedIngredients.length || !editedSteps.length) {
            toast.error('Bitte füllen Sie alle erforderlichen Felder aus.');
            return;
        }

        try {
            const recipeRef = doc(db, 'recipes', recipe.id);
            await updateDoc(recipeRef, {
                title: editedTitle,
                description: editedDescription,
                ingredients: editedIngredients,
                steps: editedSteps,
                imageUrl: editedImage || recipe.imageUrl
            });
            onSave({ ...recipe, editedTitle, editedDescription, editedIngredients, editedSteps, imageUrl: editedImage || recipe.imageUrl });
        } catch (error) {
            toast.error('Fehler beim Speichern der Änderungen: ' + error.message);
        }
    };

    return (
        <div>
            {/* Formular für die Bearbeitung der Rezeptdetails */}
            {/* Weitere Logik für das Bearbeiten von Zutaten und Schritten */}
        </div>
    );
};

export default RecipeForm;
