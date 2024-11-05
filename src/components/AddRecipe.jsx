import { addDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa'; // Importiere FaTimes
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { db, storage } from '../firebase';
import unitOptions from '../unitOptions';

function AddRecipe() {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [image, setImage] = useState(null);
	const [ingredients, setIngredients] = useState([]);
	const [steps, setSteps] = useState([]);
	const [currentIngredient, setCurrentIngredient] = useState({
		name: '',
		amount: '',
		unit: '',
	});
	const [currentStep, setCurrentStep] = useState('');
	const [imagePreview, setImagePreview] = useState(null);
	const [portions, setPortions] = useState(4);
	const navigate = useNavigate();

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const validFormats = [
				'image/jpeg',
				'image/jpg',
				'image/png',
				'image/bmp',
			];
			const maxSize = 5 * 1024 * 1024;

			if (!validFormats.includes(file.type)) {
				toast.error(
					'Bitte laden Sie nur Bilder im JPEG, JPG, PNG oder BMP Format hoch.'
				);
				e.target.value = '';
				setImage(null);
				setImagePreview(null);
				return;
			}

			if (file.size > maxSize) {
				toast.error('Die Datei darf maximal 5 MB groß sein.');
				e.target.value = '';
				setImage(null);
				setImagePreview(null);
				return;
			}

			setImage(file);
			setImagePreview(URL.createObjectURL(file));
		}
	};

	const addIngredient = () => {
		if (currentIngredient.name && currentIngredient.amount) {
			setIngredients([
				...ingredients,
				{ ...currentIngredient, amount: currentIngredient.amount.toString() },
			]);
			setCurrentIngredient({ name: '', amount: '', unit: 'g' });
		} else {
			toast.error('Bitte geben Sie sowohl die Menge als auch die Zutat ein.');
		}
	};

	const removeIngredient = (index) => {
		const newIngredients = ingredients.filter((_, i) => i !== index);
		setIngredients(newIngredients);
	};

	const addStep = () => {
		if (currentStep) {
			setSteps([...steps, currentStep]);
			setCurrentStep('');
		} else {
			toast.error('Bitte geben Sie einen Arbeitsschritt ein.');
		}
	};

	const removeStep = (index) => {
		const newSteps = steps.filter((_, i) => i !== index);
		setSteps(newSteps);
	};

	const validateForm = () => {
		if (
			!title ||
			!description ||
			ingredients.length === 0 ||
			ingredients.some((ing) => !ing.name || !ing.amount) ||
			steps.length === 0 ||
			steps.some((step) => !step.trim())
		) {
			toast.error('Bitte füllen Sie alle erforderlichen Felder aus.');
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			let imageUrl = '';
			if (image) {
				const imageRef = ref(storage, `images/${image.name}`);
				await uploadBytes(imageRef, image);
				imageUrl = await getDownloadURL(imageRef);
			}

			await addDoc(collection(db, 'recipes'), {
				title,
				description,
				portions,
				imageUrl,
				ingredients,
				steps,
			});
			setTitle('');
			setDescription('');
			setPortions(4);
			setIngredients([]);
			setSteps([]);
			setImagePreview(null);
			toast.success('Rezept erfolgreich hinzugefügt!');
			navigate('/');
		} catch (error) {
			console.error('Fehler beim Hinzufügen des Rezepts: ', error);
			toast.error('Fehler beim Hinzufügen des Rezepts.');
		}
	};

	const handleCancel = () => {
		navigate('/');
	};

	return (
		<div className='flex flex-col items-center p-6 max-w-md mx-auto lg:max-w-[800px] bg-white rounded-lg shadow-md'>
			<h2 className='text-2xl font-semibold mb-4'>Neues Rezept hinzufügen</h2>
			<form onSubmit={handleSubmit} className='w-full'>
				<input
					type='text'
					placeholder='Titel'
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className='w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
				/>
				<textarea
					placeholder='Beschreibung'
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className='w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
				/>

				<h3 className='text-lg font-medium mb-2'>Bild</h3>
				<input
					type='file'
					id='imageInput'
					onChange={handleImageChange}
					className='mb-4 border rounded-md p-2'
				/>
				{imagePreview && (
					<div className='relative mb-4'>
						<img src={imagePreview} alt='Preview' className='w-32 h-auto' />
						<button
							onClick={() => {
								setImage(null);
								setImagePreview(null);
								document.getElementById('imageInput').value = '';
							}}
							className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 border border-gray-400 hover:bg-red-600 transition'
							style={{ zIndex: 10 }}
						>
							<FaTimes />
						</button>
					</div>
				)}
				<div className='mb-4'>
					<label className='font-semibold mr-2'>Portionen:</label>
					<input
						type='number'
						value={portions}
						min='1'
						className='border p-1 w-14 text-center'
					/>
				</div>

				<h3 className='text-lg font-medium mb-2'>Zutaten</h3>
				<div className='mb-4'>
					<div className='flex flex-col sm:flex-row mb-4'>
						<div className='flex-grow mb-2 sm:mb-0 sm:mr-2'>
							<input
								type='number'
								placeholder='Menge'
								value={currentIngredient.amount}
								onChange={(e) =>
									setCurrentIngredient({
										...currentIngredient,
										amount: e.target.value,
									})
								}
								className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
							/>
						</div>
						<div className='flex-grow mb-2 sm:mb-0 sm:mr-2'>
							<select
								value={currentIngredient.unit}
								onChange={(e) =>
									setCurrentIngredient({
										...currentIngredient,
										unit: e.target.value,
									})
								}
								className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
							>
								{unitOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
						<div className='flex-grow mb-2 sm:mb-0 sm:mr-2'>
							<input
								type='text'
								placeholder='Zutat'
								value={currentIngredient.name}
								onChange={(e) =>
									setCurrentIngredient({
										...currentIngredient,
										name: e.target.value,
									})
								}
								className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
							/>
							{/* Der Button zum Hinzufügen der Zutat */}
						</div>
						<div>
							<button
								className='flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none'
								type='button'
								onClick={addIngredient}
							>
								<FaPlus />
							</button>
						</div>
					</div>
					{ingredients.map((ingredient, index) => (
						<div
							key={index}
							className='flex justify-between items-center p-2 border-b'
						>
							<div></div>
							<div className='flex items-center'>
								<div>
									{' '}
									{ingredient.amount} {ingredient.unit} - {ingredient.name}{' '}
								</div>
								<button
									className='ml-2 text-red-500'
									onClick={() => removeIngredient(index)}
								>
									<FaTimes />
								</button>
							</div>
						</div>
					))}
				</div>

				<h3 className='text-lg font-medium mb-2'>Arbeitsschritte</h3>
				<div className='mb-4'>
					<div className='flex flex-col sm:flex-row mb-4'>
						<div className='flex-grow mb-2 sm:mb-0 sm:mr-2'>
							<input
								type='text'
								placeholder='Schritt'
								value={currentStep}
								onChange={(e) => setCurrentStep(e.target.value)}
								className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
							/>
						</div>
						<div>
							<button
								className='flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none'
								type='button'
								onClick={addStep}
							>
								<FaPlus />
							</button>
						</div>
					</div>
					{steps.map((step, index) => (
						<div
							key={index}
							className='flex justify-between items-center p-2 border-b'
						>
							<div>{step}</div>
							<button
								className='ml-2 text-red-500'
								onClick={() => removeStep(index)}
							>
								<FaTimes />
							</button>
						</div>
					))}
				</div>

				<div className='flex justify-between'>
					<button
						type='button'
						onClick={handleCancel}
						className='bg-gray-400 text-white p-2 rounded-md hover:bg-gray-500'
					>
						Abbrechen
					</button>
					<button
						type='submit'
						className='bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600'
					>
						Rezept hinzufügen
					</button>
				</div>
			</form>
		</div>
	);
}

export default AddRecipe;
