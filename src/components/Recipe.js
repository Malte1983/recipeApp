import React from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

const Recipe = ({ recipe, onBack, onEdit, onDelete }) => {
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
            <h4 className='font-semibold'>Zutaten:</h4>
            <ul>
                {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient.amount} {ingredient.unit} {ingredient.name}</li>
                ))}
            </ul>
            <h4 className='font-semibold mt-4'>Schritte:</h4>
            <ol>
                {recipe.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                ))}
            </ol>
            <div className='flex justify-between mt-4'>
                <button onClick={onBack} className='bg-gray-500 text-white p-2 rounded'>Zurück</button>
                <div>
                    <button onClick={() => onEdit(recipe)} className='bg-blue-500 text-white p-2 rounded mr-2'>
                        <FaPencilAlt />
                    </button>
                    <button onClick={() => onDelete(recipe.id)} className='bg-red-500 text-white p-2 rounded'>
                        <FaTrash />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Recipe;
