import React from 'react';

const Recipe = ({ recipe, onBack }) => {
    return (
        <div className='bg-white rounded-lg shadow-md p-4'>
            <h2 className='text-2xl font-bold mb-2'>{recipe.title}</h2>
            <p>{recipe.description}</p>
            <button onClick={onBack} className='bg-gray-500 text-white p-2 rounded'>Zurück</button>
        </div>
    );
};

export default Recipe;
