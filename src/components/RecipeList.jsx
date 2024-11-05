import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';
import { auth } from '../firebase'; // Ihr Firebase Auth Import-Pfad
import { fetchFavorites, fetchRecipes } from '../FirebaseUtilities';
import RecipeDetails from './RecipeDetails';
import RecipeEditor from './RecipeEditor';

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
				setRecipes(loadedRecipes);
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

	const handleSelectRecipe = (recipe) => {
		setSelectedRecipe(recipe);
		setEditing(false);
	};

	const handleEditRecipe = () => {
		setEditing(true);
	};

	const handleSaveEdit = (updatedRecipe) => {
		const updatedRecipes = recipes.map((recipe) =>
			recipe.id === updatedRecipe.id ? updatedRecipe : recipe
		);
		setRecipes(updatedRecipes);
		setSelectedRecipe(updatedRecipe);
		setEditing(false);
	};

	const handleCancelEdit = () => {
		setEditing(false);
	};

	const handleDeleteRecipe = (recipeId) => {
		setRecipes(recipes.filter((recipe) => recipe.id !== recipeId));
		setSelectedRecipe(null);
	};

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value);
	};

	const filteredRecipes = recipes.filter(
		(recipe) =>
			recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className='container mx-auto p-4'>
			{!selectedRecipe ? (
				<>
					<input
						type='text'
						placeholder='Rezept suchen...'
						value={searchTerm}
						onChange={handleSearchChange}
						className='border p-2 w-full mb-4'
					/>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
						{filteredRecipes.map((recipe) => (
							<div
								key={recipe.id}
								className='bg-white rounded-lg shadow-md p-4 cursor-pointer'
								onClick={() => handleSelectRecipe(recipe)}
							>
								<h2 className='text-xl font-bold'>{recipe.title}</h2>
								<p className='text-gray-700'>{recipe.description}</p>
							</div>
						))}
					</div>
				</>
			) : editing ? (
				<RecipeEditor
					recipe={selectedRecipe}
					onSave={handleSaveEdit}
					onCancel={handleCancelEdit}
				/>
			) : (
				<RecipeDetails
					recipe={selectedRecipe}
					onBack={() => setSelectedRecipe(null)}
					onEdit={handleEditRecipe}
					onDelete={handleDeleteRecipe}
					isFavorite={(recipeId) => favoriteRecipes.includes(recipeId)}
					user={user}
				/>
			)}
		</div>
	);
}

export default RecipeList;
