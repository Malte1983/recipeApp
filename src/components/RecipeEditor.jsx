import React, { useState } from 'react';
import { updateRecipe, uploadImage } from './FirebaseUtilities';
import { toast } from 'react-toastify';
import unitOptions from '../unitOptions'; // Stellen Sie sicher, dass der Pfad zu den Einheitsoptionen korrekt ist.

const RecipeEditor = ({ recipe, onSave, onCancel }) => {
    const [editedTitle, setEditedTitle] = useState(recipe.title);
    const [editedDescription, setEditedDescription] = useState(recipe.description);
    const [editedIngredients, setEditedIngredients] = useState(recipe.ingredients);
    const [editedSteps, setEditedSteps] = useState(recipe.steps);
    const [editedImage, setEditedImage] = useState(null);

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...editedIngredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setEditedIngredients(newIngredients);
    };

    const handleStepChange = (index, value) => {
        const newSteps = [...editedSteps];
        newSteps[index] = value;
        setEditedSteps(newSteps);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditedImage(file); // Speichern Sie das Bild vorläufig im lokalen Zustand
        }
    };

    const saveChanges = async () => {
        if (!editedTitle || !editedDescription || editedIngredients.some(ing => !ing.name || !ing.amount) || editedSteps.some(step => !step.trim())) {
            toast.error('Bitte füllen Sie alle erforderlichen Felder aus.');
            return;
        }

        let imageUrl = recipe.imageUrl;
        if (editedImage) {
            imageUrl = await uploadImage(editedImage);
        }

        const updatedData = {
            title: editedTitle,
            description: editedDescription,
            ingredients: editedIngredients,
            steps: editedSteps,
            imageUrl: imageUrl
        };

        try {
            await updateRecipe(recipe.id, updatedData);
            toast.success('Änderungen erfolgreich gespeichert!');
            onSave({
                ...recipe,
                ...updatedData
            });
        } catch (error) {
            toast.error('Fehler beim Speichern der Änderungen: ' + error.message);
        }
    };

    const addIngredient = () => {
        setEditedIngredients([
            ...editedIngredients,
            { name: '', amount: '', unit: 'g' }
        ]);
    };

    const addStep = () => {
        setEditedSteps([...editedSteps, '']);
    };

    return (
        <div>
            <h2 className='text-2xl font-bold mb-4'>Rezept bearbeiten</h2>
            <input
                type='text'
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className='border p-2 w-full mb-4'
                placeholder='Rezeptname'
            />
            <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className='border p-2 w-full mb-4'
                placeholder='Beschreibung'
            />
            <input
                type='file'
                onChange={handleImageChange}
                className='mb-4'
            />
            <h4 className='font-semibold mb-2'>Zutaten</h4>
            {editedIngredients.map((ingredient, index) => (
                <div key={index} className='flex mb-2'>
                    <input
                        type='text'
                        value={ingredient.name}
                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        className='border p-2 w-1/3 mr-2'
                        placeholder='Zutat'
                    />
                    <input
                        type='text'
                        value={ingredient.amount}
                        onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                        className='border p-2 w-1/4 mr-2'
                        placeholder='Menge'
                    />
                    <select
                        value={ingredient.unit}
                        onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                        className='border p-2 w-1/4'
                    >
                        {unitOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            ))}
            <button onClick={addIngredient} className='bg-blue-500 text-white p-2 rounded'>
                Zutat hinzufügen
            </button>
            <h4 className='font-semibold mb-2'>Schritte</h4>
            {editedSteps.map((step, index) => (
                <div key={index} className='mb-2'>
                    <input
                        type='text'
                        value={step}
                        onChange={(e) => handleStepChange(index, e.target.value)}
                        className='border p-2 w-full'
                        placeholder={`Schritt ${index + 1}`}
                    />
                </div>
            ))}
            <button onClick={addStep} className='bg-blue-500 text-white p-2 rounded'>
                Schritt hinzufügen
            </button>
            <div className='mt-4'>
                <button onClick={saveChanges} className='bg-green-500 text-white p-2 rounded mr-2'>
                    Änderungen speichern
                </button>
                <button onClick={onCancel} className='bg-red-500 text-white p-2 rounded'>
                    Abbrechen
                </button>
            </div>
        </div>
    );
};

export default RecipeEditor;
