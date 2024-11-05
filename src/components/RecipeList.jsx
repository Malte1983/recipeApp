import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase'; // Ihr Firebase Auth Import-Pfad
import { toast } from 'react-toastify';
import RecipeDetails from './RecipeDetails';
import RecipeEditor from './RecipeEditor';
import { fetchRecipes, fetchFavorites, addFavorite, removeFavorite } from './FirebaseUtilities';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

function RecipeList() {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [editing, setEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [user] = useAuthState(auth);

    useEffect(() => {
        const loadFavoritesAndRecipes = async () => {
            try {
                const loadedRecipes = await fetchRecipes();
                let favorites = [];
                if (user) {
                    favorites = await fetchFavorites(user.uid);
                    setFavoriteRecipes(favorites);
                }
                const sortedRecipes = loadedRecipes.sort((a, b) =>
                    favorites.includes(b.id) - favorites.includes(a.id)
                );
                setRecipes(sortedRecipes);
            } catch (error) {
                toast.error('Fehler beim Laden: ' + error.message);
            }
        };
        loadFavoritesAndRecipes();
    }, [user]);

    const handleFavoriteClick = async (recipeId) => {
        if (favoriteRecipes.includes(recipeId)) {
            await removeFavorite(user.uid, recipeId);
            setFavoriteRecipes(favoriteRecipes.filter(id => id !== recipeId));
        } else {
            await addFavorite(user.uid, recipeId);
            setFavoriteRecipes([...favoriteRecipes, recipeId]);
        }
        setRecipes(prevRecipes => prevRecipes
            .slice().sort((a, b) =>
                (favoriteRecipes.includes(b.id) ? 1 : 0) - (favoriteRecipes.includes(a.id) ? 1 : 0)
            )
        );
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='container mx-auto p-4'>
            <input
                type="text"
                placeholder="Rezept suchen..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="border p-2 w-full mb-4"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.map((recipe) => (
                    <div key={recipe.id} className="bg-white rounded-lg shadow-md p-4 cursor-pointer">
                        <h2 className="text-xl font-bold" onClick={() => setSelectedRecipe(recipe)}>
                            {recipe.title}
                        </h2>
                        {recipe.imageUrl && (
                            <img
                                src={recipe.imageUrl}
                                alt={recipe.title}
                                className="w-full h-64 object-cover rounded-lg"
                                onClick={() => setSelectedRecipe(recipe)}
                            />
                        )}
                        <p className="text-gray-700" onClick={() => setSelectedRecipe(recipe)}>
                            {recipe.description}
                        </p>
                        <div onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteClick(recipe.id);
                        }}>
                            {favoriteRecipes.includes(recipe.id) ? (
                                <FaHeart color="red" />
                            ) : (
                                <FaRegHeart />
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {selectedRecipe && !editing && (
                <RecipeDetails
                    recipe={selectedRecipe}
                    onBack={() => setSelectedRecipe(null)}
                    onEdit={() => setEditing(true)}
                    onDelete={() => {
                        setRecipes(recipes.filter(r => r.id !== selectedRecipe.id));
                        setSelectedRecipe(null);
                    }}
                />
            )}
            {editing && (
                <RecipeEditor
                    recipe={selectedRecipe}
                    onSave={(updatedRecipe) => {
                        setRecipes(recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
                        setSelectedRecipe(updatedRecipe);
                        setEditing(false);
                    }}
                    onCancel={() => setEditing(false)}
                />
            )}
        </div>
    );
}

export default RecipeList;
