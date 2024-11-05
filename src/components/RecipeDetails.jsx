import React from 'react';
import { FaHeart, FaHeartBroken, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
	addFavorite,
	deleteRecipe,
	removeFavorite,
} from '../FirebaseUtilities';
import { formatAmount, scaleIngredients } from '../RecipeUtilities';

const RecipeDetails = ({ recipe, onBack, onEdit, isFavorite, user }) => {
	const handleDelete = async (recipeId) => {
		if (
			window.confirm('Sind Sie sicher, dass Sie dieses Rezept löschen möchten?')
		) {
			try {
				await deleteRecipe(recipeId);
				toast.success('Rezept erfolgreich gelöscht!');
				onBack(); // Gehe zurück zur Rezeptliste
			} catch (error) {
				toast.error('Fehler beim Löschen des Rezepts: ' + error.message);
			}
		}
	};

	const toggleFavorite = async () => {
		try {
			if (isFavorite(recipe.id)) {
				await removeFavorite(user.uid, recipe.id);
				toast.success('Rezept aus Favoriten entfernt!');
			} else {
				await addFavorite(user.uid, recipe.id);
				toast.success('Rezept zu Favoriten hinzugefügt!');
			}
		} catch (error) {
			toast.error('Fehler beim Aktualisieren der Favoriten: ' + error.message);
		}
	};

	return (
		<div className='bg-white rounded-lg shadow-md p-4'>
			<h2 className='text-2xl font-bold mb-2'>{recipe.title}</h2>
			{recipe.imageUrl && (
				<img
					src={recipe.imageUrl}
					alt={recipe.title}
					className='w-full h-64 object-cover mb-4 rounded-lg'
				/>
			)}
			<p className='mb-2'>{recipe.description}</p>
			<div className='mb-4'>
				<h4 className='font-semibold'>Zutaten:</h4>
				<ul>
					{scaleIngredients(recipe.ingredients, 4, 4).map(
						(ingredient, index) => (
							<li key={index}>
								{formatAmount(ingredient.amount)} {ingredient.unit}{' '}
								{ingredient.name}
							</li>
						)
					)}
				</ul>
			</div>
			<div className='mb-4'>
				<h4 className='font-semibold'>Schritte:</h4>
				<ol>
					{recipe.steps.map((step, index) => (
						<li key={index}>{step}</li>
					))}
				</ol>
			</div>
			<div className='flex justify-between'>
				<button onClick={onBack} className='bg-gray-500 text-white p-2 rounded'>
					Zurück
				</button>
				{user && (
					<div>
						<button
							onClick={() => onEdit(recipe)}
							className='bg-blue-500 text-white p-2 rounded mr-2'
						>
							<FaPencilAlt />
						</button>
						<button
							onClick={() => handleDelete(recipe.id)}
							className='bg-red-500 text-white p-2 rounded mr-2'
						>
							<FaTrash />
						</button>
						<button
							onClick={toggleFavorite}
							className={`bg-${
								isFavorite(recipe.id) ? 'red' : 'blue'
							}-500 text-white p-2 rounded`}
						>
							{isFavorite(recipe.id) ? <FaHeartBroken /> : <FaHeart />}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default RecipeDetails;
