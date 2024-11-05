import {
	arrayRemove,
	arrayUnion,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
	FaHeart,
	FaHeartBroken,
	FaMinusCircle,
	FaPencilAlt,
	FaPlusCircle,
	FaTrash,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { auth, db, storage } from '../firebase';
import unitOptions from '../unitOptions';

const categoryOptions = [
	{ value: 'dessert', label: 'Dessert' },
	{ value: 'main_course', label: 'Hauptgericht' },
	{ value: 'appetizer', label: 'Vorspeise' },
	{ value: 'snack', label: 'Snack' },
	// Weitere Kategorien können hinzugefügt werden
];

function RecipeList() {
	const [recipes, setRecipes] = useState([]);
	const [editing, setEditing] = useState(null);
	const [selectedRecipe, setSelectedRecipe] = useState(null);
	const [editedTitle, setEditedTitle] = useState('');
	const [editedDescription, setEditedDescription] = useState('');
	const [editedIngredients, setEditedIngredients] = useState([]);
	const [editedCategory, setEditedCategory] = useState('');
	const [editedSteps, setEditedSteps] = useState([]);
	const [editedImage, setEditedImage] = useState(null);
	const [user] = useAuthState(auth);
	const [favoriteRecipes, setFavoriteRecipes] = useState([]);
	const [portions, setPortions] = useState(4);
	const [ingredients, setIngredients] = useState([]);
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
				console.error('Fehler beim Abrufen der Rezepte: ', error);
			}
		};
		fetchRecipes();
	}, []);

	useEffect(() => {
		const fetchFavorites = async () => {
			if (user) {
				const favoritesRef = doc(db, 'favorites', user.uid);
				const favoritesDoc = await getDoc(favoritesRef);
				if (favoritesDoc.exists()) {
					setFavoriteRecipes(favoritesDoc.data().favoriteRecipes || []);
				}
			}
		};
		fetchFavorites();
	}, [user]);

	const startEditing = (recipe) => {
		setEditing(recipe.id);
		setEditedTitle(recipe.title);
		setEditedCategory(recipe.category);
		setEditedDescription(recipe.description);
		setEditedIngredients(recipe.ingredients || []);
		setEditedSteps(recipe.steps || []);
	};

	const vibrate = () => {
		if (navigator.vibrate) {
			navigator.vibrate(100);
		}
	};

	const saveChanges = async (id) => {
		// Validierung
		if (
			!editedTitle ||
			!editedDescription ||
			editedIngredients.length === 0 ||
			editedIngredients.some((ing) => !ing.name || !ing.amount) ||
			editedSteps.length === 0 ||
			editedSteps.some((step) => !step.trim()) ||
			!editedCategory
		) {
			toast.error('Bitte füllen Sie alle erforderlichen Felder aus.');
			return;
		}

		try {
			let imageUrl = selectedRecipe.imageUrl;

			if (editedImage) {
				imageUrl = await uploadImage(editedImage);
			}

			const recipeRef = doc(db, 'recipes', id);
			await updateDoc(recipeRef, {
				title: editedTitle,
				description: editedDescription,
				ingredients: editedIngredients,
				steps: editedSteps,
				imageUrl: imageUrl,
				category: editedCategory,
			});

			toast.success('Änderungen erfolgreich gespeichert!');

			setRecipes((prevRecipes) =>
				prevRecipes.map((recipe) =>
					recipe.id === id
						? {
								...recipe,
								title: editedTitle,
								description: editedDescription,
								ingredients: editedIngredients,
								steps: editedSteps,
								imageUrl: imageUrl,
								category: editedCategory,
						  }
						: recipe
				)
			);

			setSelectedRecipe({
				id: id,
				title: editedTitle,
				description: editedDescription,
				ingredients: editedIngredients,
				steps: editedSteps,
				imageUrl: imageUrl,
				category: editedCategory,
			});

			setEditing(null);
		} catch (error) {
			console.error('Fehler beim Speichern der Änderungen: ', error);
		}
	};

	const deleteRecipe = async (id) => {
		if (
			window.confirm('Sind Sie sicher, dass Sie dieses Rezept löschen möchten?')
		) {
			try {
				const recipeRef = doc(db, 'recipes', id);
				await deleteDoc(recipeRef);
				toast.success('Rezept erfolgreich gelöscht!');

				setRecipes((prevRecipes) =>
					prevRecipes.filter((recipe) => recipe.id !== id)
				);
			} catch (error) {
				console.error('Fehler beim Löschen des Rezepts: ', error);
				toast.error('Fehler beim Löschen des Rezepts.');
			}
		}
	};

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
			const validFormats = [
				'image/jpeg',
				'image/jpg',
				'image/png',
				'image/bmp',
			];
			const maxSize = 5 * 1024 * 1024; // 5 MB in Bytes

			if (!validFormats.includes(file.type)) {
				toast.error(
					'Bitte laden Sie nur Bilder im JPEG, JPG, PNG oder BMP Format hoch.'
				);
				e.target.value = '';
				setEditedImage(null);
				return;
			}

			if (file.size > maxSize) {
				toast.error('Die Datei darf maximal 5 MB groß sein.'); //
				e.target.value = '';
				setEditedImage(null);
				return;
			}

			setEditedImage(file);
		}
	};

	const uploadImage = async (imageFile) => {
		if (imageFile) {
			const imageRef = ref(storage, `images/${imageFile.name}`);
			await uploadBytes(imageRef, imageFile);
			return await getDownloadURL(imageRef);
		}
		return '';
	};

	const addIngredient = () => {
		setEditedIngredients([
			...editedIngredients,
			{ name: '', amount: '', unit: 'g' },
		]);
	};

	const addStep = () => {
		setEditedSteps([...editedSteps, '']);
	};

	const showRecipeDetails = (recipe) => {
		setSelectedRecipe(recipe);
	};

	const goBack = () => {
		setSelectedRecipe(null);
		setEditing(null);
		setEditedTitle('');
		setEditedDescription('');
		setEditedIngredients([]);
		setEditedSteps([]);
		setEditedImage(null);
		setEditedCategory('');
	};

	const addFavorite = async (recipeId) => {
		const favoritesRef = doc(db, 'favorites', user.uid);
		const favoritesDoc = await getDoc(favoritesRef);

		if (favoritesDoc.exists()) {
			await updateDoc(favoritesRef, {
				favoriteRecipes: arrayUnion(recipeId),
			});
			setFavoriteRecipes((prevFavorites) => [...prevFavorites, recipeId]);
		} else {
			await setDoc(favoritesRef, {
				userId: user.uid,
				favoriteRecipes: [recipeId],
			});
			setFavoriteRecipes([recipeId]); // Setze den Zustand
		}
		toast.success('Rezept als Favorit gespeichert!');
	};

	const removeFavorite = async (recipeId) => {
		const favoritesRef = doc(db, 'favorites', user.uid);
		const favoritesDoc = await getDoc(favoritesRef);

		if (favoritesDoc.exists()) {
			await updateDoc(favoritesRef, {
				favoriteRecipes: arrayRemove(recipeId),
			});
			setFavoriteRecipes((prevFavorites) =>
				prevFavorites.filter((id) => id !== recipeId)
			);
			toast.success('Rezept aus Favoriten entfernt!');
		} else {
			toast.error('Favoriten-Dokument existiert nicht.');
		}
	};

	const isFavorite = (recipeId) => {
		return favoriteRecipes.includes(recipeId);
	};

	const scaleIngredients = (ingredients, basePortions, newPortions) => {
		return ingredients.map((ingredient) => {
			const scaledAmount =
				ingredient.amount && !isNaN(ingredient.amount)
					? (parseFloat(ingredient.amount) / basePortions) * newPortions
					: ingredient.amount;

			const roundedAmount =
				typeof scaledAmount === 'number'
					? Math.round(scaledAmount * 100) / 100
					: scaledAmount;

			return { ...ingredient, amount: roundedAmount };
		});
	};

	const formatAmount = (amount) => {
		if (amount === 'nach Bedarf') {
			return amount;
		}
		const numericAmount = parseFloat(amount);
		return Number.isNaN(numericAmount)
			? amount // Falls amount nicht in eine Zahl umgewandelt werden kann, gib es unverändert zurück
			: Number.isInteger(numericAmount)
			? numericAmount
			: numericAmount.toFixed(2);
	};

	const handlePortionChange = (newPortions) => {
		if (!isNaN(newPortions) && newPortions > 0) {
			setPortions(newPortions);

			const scaledIngredients = scaleIngredients(ingredients, 4, newPortions);
			setIngredients(scaledIngredients);
		}
	};

	const filteredRecipes = recipes.filter(
		(recipe) =>
			recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
	);
	return (
		<div className='container mx-auto p-4'>
			{!selectedRecipe && (
				<input
					type='text'
					placeholder='Rezept suchen...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='border p-2 w-full mb-4'
				/>
			)}
			{selectedRecipe ? (
				<div className='bg-white rounded-lg shadow-md p-4 relative'>
					{editing === selectedRecipe.id ? (
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
							<select
								value={editedCategory}
								onChange={(e) => setEditedCategory(e.target.value)}
								className='border p-2 w-full mb-4'
							>
								<option value='' disabled>
									Wählen Sie eine Kategorie
								</option>
								{categoryOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>

							<h4 className='font-semibold mb-2'>Zutaten</h4>
							<div className='mb-4'>
								{editedIngredients.map((ingredient, index) => (
									<div key={index} className='flex mb-2'>
										<input
											type='text'
											value={ingredient.name}
											onChange={(e) =>
												handleIngredientChange(index, 'name', e.target.value)
											}
											className='border p-2 w-1/2 mr-2'
											placeholder='Zutat'
										/>
										<input
											type='text'
											value={ingredient.amount}
											onChange={(e) =>
												handleIngredientChange(index, 'amount', e.target.value)
											}
											className='border p-2 w-1/4 mr-2'
											placeholder='Menge'
										/>
										<select
											value={ingredient.unit}
											onChange={(e) =>
												handleIngredientChange(index, 'unit', e.target.value)
											}
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
								<button
									onClick={addIngredient}
									className='bg-blue-500 text-white p-2 rounded'
								>
									Zutat hinzufügen
								</button>
							</div>

							<h4 className='font-semibold mb-2'>Schritte</h4>
							<div className='mb-4'>
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
								<button
									onClick={addStep}
									className='bg-blue-500 text-white p-2 rounded'
								>
									Schritt hinzufügen
								</button>
							</div>

							<button
								onClick={() => saveChanges(selectedRecipe.id)}
								className='bg-green-500 text-white p-2 rounded mr-2'
							>
								Änderungen speichern
							</button>
							<button
								onClick={goBack}
								className='danger bg-red-500 text-white p-2 rounded'
							>
								Abbrechen
							</button>
						</div>
					) : (
						<div>
							<h2 className='text-2xl font-bold mb-2'>
								{selectedRecipe.title}
							</h2>

							<img
								loading='lazy'
								src={selectedRecipe.imageUrl}
								alt={selectedRecipe.title}
								className='w-full h-64 object-cover mb-4 rounded-lg'
							/>
							<p className='mb-2'>{selectedRecipe.description}</p>
							<div className='flex'>
								<label className='flex items-center mb-2 italic'>
									Kategorie:{' '}
								</label>
								<p className='mb-2 ml-2 border-2 rounded-md p-1 bg-orange-500 text-white'>
									{categoryOptions.find(
										(option) => option.value === selectedRecipe.category
									)?.label || 'Keine'}
								</p>
							</div>

							{/* Portionenauswahl */}
							<div className='mb-4'>
								<label className='font-semibold mr-2 '>Portionen:</label>
								<div className='flex items-center'>
									<button
										onClick={() => handlePortionChange(portions - 1)}
										className='border p-1 mt-4'
										disabled={portions <= 1}
									>
										<FaMinusCircle
											onClick={() => {
												vibrate();
											}}
											size={22}
											color='#002147'
											className='font-bold'
										/>
									</button>
									<div className='mt-4'>
										<input
											type='tel'
											value={portions}
											onChange={(e) => {
												const value = e.target.value;
												if (/^\d*$/.test(value)) {
													handlePortionChange(
														value === '' ? '' : Number(value)
													);
												}
											}}
											className='border p-1 w-14 h-8 text-center mx-1'
											placeholder='Anzahl'
										/>
									</div>
									<button
										onClick={() => handlePortionChange(portions + 1)}
										className='border p-1 mt-4'
									>
										<FaPlusCircle
											onClick={() => {
												vibrate();
											}}
											size={22}
											color='#002147'
										/>
									</button>
								</div>
							</div>
							<h4 className='font-semibold'>Zutaten:</h4>
							<ul className='list-disc'>
								{scaleIngredients(selectedRecipe.ingredients, 4, portions).map(
									(ingredient, index) => (
										<li
											key={index}
											className='flex justify-between mb-2 border-b border-gray-300 pb-2'
										>
											<span>
												<strong>{formatAmount(ingredient.amount)}</strong>{' '}
												<strong>{ingredient.unit}</strong>
											</span>
											<span>{ingredient.name}</span>
										</li>
									)
								)}
							</ul>
							<h4 className='font-semibold pb-2 pt-2 '>Schritte:</h4>
							<ol className='pl-2 pb-2 list-none'>
								{selectedRecipe.steps.map((step, index) => (
									<li className='mt-2 text-sm' key={index}>
										<div className='flex items-start'>
											<span className='font-bold mr-2'>{index + 1}.</span>{' '}
											<span className='flex-1'>
												{step.split('\n').map((line, lineIndex) => (
													<span key={lineIndex} className='block'>
														{line}
													</span>
												))}
											</span>
										</div>
									</li>
								))}
							</ol>
							<div className='mt-4 flex'>
								{user && (
									<>
										<button
											onClick={() => startEditing(selectedRecipe)}
											className='bg-blue-500 text-white p-2 rounded mr-2'
										>
											<FaPencilAlt />
										</button>
										<button
											onClick={() => deleteRecipe(selectedRecipe.id)}
											className='bg-red-500 text-white p-2 rounded mr-2'
										>
											<FaTrash />
										</button>
										{/* Favoriten-Button */}
										{isFavorite(selectedRecipe.id) ? (
											<button
												onClick={() => {
													vibrate(); // Vibration auslösen
													removeFavorite(selectedRecipe.id); // Rezept aus Favoriten entfernen
												}}
												className='bg-red-500 text-white p-2 rounded'
											>
												<FaHeartBroken />
											</button>
										) : (
											<button
												onClick={() => {
													vibrate(); // Vibration auslösen
													addFavorite(selectedRecipe.id); // Rezept zu Favoriten hinzufügen
												}}
												className='bg-blue-500 text-white p-2 rounded'
											>
												<FaHeart />
											</button>
										)}
									</>
								)}
								<button
									onClick={goBack}
									className='bg-gray-500 text-white p-2 rounded ml-auto'
								>
									Zurück
								</button>
							</div>
						</div>
					)}
				</div>
			) : (
				<div>
					<h1 className='text-2xl font-bold mb-4'>Rezepte</h1>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
						{filteredRecipes
							.sort((a, b) => {
								const isAFavorite = isFavorite(a.id);
								const isBFavorite = isFavorite(b.id);
								return isAFavorite === isBFavorite ? 0 : isAFavorite ? -1 : 1;
							})
							.map((recipe) => (
								<div
									key={recipe.id}
									className='bg-white rounded-lg shadow-md p-4 cursor-pointer'
									onClick={() => showRecipeDetails(recipe)}
								>
									<div className='relative mb-4'>
										<img
											src={recipe.imageUrl}
											alt={recipe.title}
											className='w-full h-48 object-cover'
										/>
										{user && (
											<button
												onClick={(e) => {
													e.stopPropagation();
													isFavorite(recipe.id)
														? removeFavorite(recipe.id)
														: addFavorite(recipe.id);
												}}
												className={`absolute top-2 right-2 p-2 rounded ${
													isFavorite(recipe.id) ? 'bg-red-500' : 'bg-blue-500'
												} text-white`}
											>
												{isFavorite(recipe.id) ? (
													<FaHeartBroken />
												) : (
													<FaHeart />
												)}
											</button>
										)}
									</div>
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
