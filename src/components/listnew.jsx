import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import Recipe from './Recipe';

function RecipeList() {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [user] = useAuthState(auth);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const recipeCollection = collection(db, 'recipes');
                const recipeSnapshot = await getDocs(recipeCollection);
                const recipeList = recipeSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setRecipes(recipeList);
            } catch (error) {
                console.error('Fehler beim Abrufen der Rezepte: ', error);
            }
        };
        fetchRecipes();
    }, []);

    const showRecipeDetails = (recipe) => {
        setSelectedRecipe(recipe);
    };

    const filteredRecipes = recipes.filter(
        recipe => recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='container mx-auto p-4'>
            {!selectedRecipe && (
                <input
                    type='text'
                    placeholder='Rezept suchen...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='border p-2 w-full mb-4'
                />
            )}
            {selectedRecipe ? (
                <Recipe recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />
            ) : (
                <div>
                    <h1 className='text-2xl font-bold mb-4'>Rezepte</h1>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {filteredRecipes.map(recipe => (
                            <div
                                key={recipe.id}
                                className='bg-white rounded-lg shadow-md p-4 cursor-pointer'
                                onClick={() => showRecipeDetails(recipe)}
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
