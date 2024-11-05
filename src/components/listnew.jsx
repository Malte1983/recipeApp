import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';
import { auth, db } from '../firebase';
import Recipe from './Recipe';
import RecipeForm from './RecipeForm';

function RecipeList() {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [editing, setEditing] = useState(null);
    const [user] = useAuthState(auth);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const recipeCollection = collection(db, 'recipes');
                const recipeSnapshot = await getDocs(recipeCollection);
                const recipeList = recipeSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setRecipes(recipeList);
            } catch (error) {
                toast.error('Fehler beim Abrufen der Rezepte: ' + error.message);
            }
        };
        fetchRecipes();
    }, []);

    const filteredRecipes = recipes.filter(
        (recipe) =>
            recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='container mx-auto p-4'>
            {editing ? (
                // Statt direkt hier zu rendern, würden wir die RecipeForm Komponente verwenden
                <RecipeForm
                    recipe={recipes.find((r) => r.id === editing)}
                    onSave={(updatedRecipe) => {
                        setRecipes(recipes.map((r) => (r.id === editing ? updatedRecipe : r)));
                        setEditing(null);
                    }}
                    onCancel={() => setEditing(null)}
                />
            ) : selectedRecipe ? (
                // Details für ein ausgewähltes Rezept anzeigen
                <Recipe
                    recipe={selectedRecipe}
                    onBack={() => setSelectedRecipe(null)}
                    onEdit={() => setEditing(selectedRecipe.id)}
                />
            ) : (
                <div>
                    <input
                        type='text'
                        placeholder='Rezept suchen...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='border p-2 w-full mb-4'
                    />
                    <h1 className='text-2xl font-bold mb-4'>Rezepte</h1>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {filteredRecipes.map((recipe) => (
                            <div
                                key={recipe.id}
                                className='bg-white rounded-lg shadow-md p-4 cursor-pointer'
                                onClick={() => setSelectedRecipe(recipe)}
                            >
                                <h2 className='text-xl font-bold'>{recipe.title}</h2>
                                <p className='text-gray-700'>{recipe.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default RecipeList;
