import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase'; // Ihr Firebase Auth Import-Pfad
import { toast } from 'react-toastify';
import RecipeDetails from './RecipeDetails';
import RecipeEditor from './RecipeEditor';
import { fetchRecipes, fetchFavorites } from './FirebaseUtilities';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

function RecipeList() {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [editing, setEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [user] = useAuthState(auth);

    useEffect(() => {
        const loadRecipes = async () => {
            try {
                const loadedRecipes = await fetchRecipes();
                const sortedRecipes = loadedRecipes.sort((a, b) => favoriteRecipes.includes(b.id) - favoriteRecipes.includes(a.id));
                setRecipes(sortedRecipes);
            } catch (error) {
                toast.error('Fehler beim Laden der Rezepte: ' + error.message);
            }
        };

        const loadFavorites = async () => {
            if (user) {
                try {
                    const favorites = await fetchFavorites(user.uid);
                    setFavoriteRecipes(favorites);
                } catch (error) {
                    toast.error('Fehler beim Laden der Favoriten: ' + error.message);
                }
            }
        };

        loadRecipes();
        loadFavorites();
    }, [user]);

    return (
        <div className='container mx-auto p-4'>
            <input
                type="text"
                placeholder="Rezept suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-2 w-full mb-4"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipes.map((recipe) => (
                    <div key={recipe.id} className="bg-white rounded-lg shadow-md p-4 cursor-pointer" onClick={() => setSelectedRecipe(recipe)}>
                        <h2 className="text-xl font-bold">{recipe.title}</h2>
                        {recipe.imageUrl && <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-64 object-cover rounded-lg" />}
                        <p className="text-gray-700">{recipe.description}</p>
                        <div onClick={(e) => e.stopPropagation()}>
                            {favoriteRecipes.includes(recipe.id) ? <FaHeart color="red" /> : <FaRegHeart />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecipeList;
