import React, { useState } from 'react';
import type { Recipe } from '../types';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { convertIngredient, convertInstruction } from '../utils/conversions';

interface RecipeDisplayProps {
    recipe: Recipe;
    imageUrl: string;
    onSave: () => void;
    isSaved: boolean;
}

export const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, imageUrl, onSave, isSaved }) => {
    const [unitSystem, setUnitSystem] = useState<'us' | 'metric'>('us');
    const [tempUnit, setTempUnit] = useState<'f' | 'c'>('f');

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg ring-1 ring-white/10 overflow-hidden animate-fade-in">
            <div className="relative">
                {imageUrl ? (
                    <img src={imageUrl} alt={recipe.recipeName} className="w-full h-64 lg:h-80 object-cover" />
                ) : (
                    <div className="w-full h-64 lg:h-80 bg-gray-700 animate-pulse flex items-center justify-center">
                        <p className="text-gray-400">Generating image...</p>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                    <div className="flex justify-between items-end">
                        <h2 className="text-3xl md:text-4xl font-bold text-white flex-1 pr-4 drop-shadow-lg">{recipe.recipeName}</h2>
                        <button 
                            onClick={onSave}
                            disabled={isSaved}
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 backdrop-blur-sm ${
                                isSaved
                                    ? 'bg-yellow-400/20 text-yellow-300 cursor-default border border-yellow-400/30'
                                    : 'bg-black/20 border border-white/20 text-white hover:bg-black/40'
                            }`}
                        >
                            <BookmarkIcon className={`w-5 h-5 ${isSaved ? 'text-yellow-400' : ''}`} fill={isSaved ? 'currentColor': 'none'} />
                            {isSaved ? 'Recipe Saved' : 'Save Recipe'}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="p-6 md:p-8">
                <p className="text-gray-400 mb-6 italic">{recipe.description}</p>

                {/* Unit Conversion Controls */}
                <div className="flex justify-end items-center gap-6 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-400">Units:</span>
                        <div className="flex rounded-lg border border-gray-600 p-0.5 bg-gray-900">
                            <button
                                onClick={() => setUnitSystem('us')}
                                className={`px-3 py-1 rounded-md transition-colors ${unitSystem === 'us' ? 'bg-yellow-500 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-700'}`}
                            >
                                US
                            </button>
                            <button
                                onClick={() => setUnitSystem('metric')}
                                className={`px-3 py-1 rounded-md transition-colors ${unitSystem === 'metric' ? 'bg-yellow-500 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-700'}`}
                            >
                                Metric
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-400">Temp:</span>
                         <div className="flex rounded-lg border border-gray-600 p-0.5 bg-gray-900">
                            <button
                                onClick={() => setTempUnit('f')}
                                className={`px-3 py-1 rounded-md transition-colors ${tempUnit === 'f' ? 'bg-yellow-500 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-700'}`}
                            >
                                °F
                            </button>
                            <button
                                onClick={() => setTempUnit('c')}
                                className={`px-3 py-1 rounded-md transition-colors ${tempUnit === 'c' ? 'bg-yellow-500 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-700'}`}
                            >
                                °C
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8 border-y border-gray-700 py-4">
                    <div>
                        <p className="text-sm text-gray-400 uppercase font-semibold">Cook Time</p>
                        <p className="text-lg font-bold text-yellow-400">{recipe.cookTime}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 uppercase font-semibold">Servings</p>
                        <p className="text-lg font-bold text-yellow-400">{recipe.servings}</p>
                    </div>
                    {recipe.nutrition && (
                        <>
                             <div>
                                <p className="text-sm text-gray-400 uppercase font-semibold">Calories</p>
                                <p className="text-lg font-bold text-yellow-400">{recipe.nutrition.calories}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 uppercase font-semibold">Protein</p>
                                <p className="text-lg font-bold text-yellow-400">{recipe.nutrition.protein}</p>
                            </div>
                            <div className="col-start-2 md:col-start-auto">
                                <p className="text-sm text-gray-400 uppercase font-semibold">Carbs</p>
                                <p className="text-lg font-bold text-yellow-400">{recipe.nutrition.carbs}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 uppercase font-semibold">Fat</p>
                                <p className="text-lg font-bold text-yellow-400">{recipe.nutrition.fat}</p>
                            </div>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-200 border-b border-gray-700 pb-2">Ingredients</h3>
                        <div className="space-y-4">
                             <div>
                                <h4 className="font-semibold text-gray-300">What You Have</h4>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
                                    {recipe.ingredients.provided.map((ing, i) => <li key={`prov-${i}`}>{convertIngredient(ing, unitSystem)}</li>)}
                                </ul>
                            </div>
                            {recipe.ingredients.needed.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-300">What You'll Need</h4>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
                                        {recipe.ingredients.needed.map((ing, i) => <li key={`need-${i}`}>{convertIngredient(ing, unitSystem)}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-200 border-b border-gray-700 pb-2">Chef's Tips</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                            {recipe.tips && recipe.tips.map((tip, i) => <li key={`tip-${i}`}>{tip}</li>)}
                        </ul>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-700 pb-2">Instructions</h3>
                    <ol className="space-y-4">
                        {recipe.instructions.map((step, index) => (
                            <li key={index} className="flex items-start">
                                <span className="flex-shrink-0 bg-yellow-500 text-gray-900 font-bold w-8 h-8 rounded-full flex items-center justify-center mr-4">{index + 1}</span>
                                <p className="text-gray-300 pt-1">{convertInstruction(step, tempUnit)}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
};