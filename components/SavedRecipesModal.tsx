import React, { useState } from 'react';
import type { SavedRecipe } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';

interface SavedRecipesModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipes: SavedRecipe[];
    onView: (recipe: SavedRecipe) => void;
    onDelete: (id: string) => void;
    onUpdate: (recipe: SavedRecipe) => void;
}

const EditForm: React.FC<{
    recipe: SavedRecipe;
    onSave: (updatedRecipe: SavedRecipe) => void;
    onCancel: () => void;
}> = ({ recipe, onSave, onCancel }) => {
    const [editedRecipe, setEditedRecipe] = useState(recipe);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedRecipe(prev => ({ ...prev, [name]: value }));
    };
    
    const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedRecipe(prev => ({ ...prev, [name]: value.split('\n').filter(line => line.trim()) }));
    };

    const handleIngredientChange = (type: 'provided' | 'needed', value: string) => {
        setEditedRecipe(prev => ({
            ...prev,
            ingredients: {
                ...prev.ingredients,
                [type]: value.split('\n').filter(line => line.trim())
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedRecipe);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 flex flex-col gap-4">
             <div>
                <label htmlFor="recipeName" className="block text-sm font-medium text-gray-300">Recipe Name</label>
                <input
                    type="text"
                    name="recipeName"
                    id="recipeName"
                    value={editedRecipe.recipeName}
                    onChange={handleTextChange}
                    className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-white"
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                    name="description"
                    id="description"
                    value={editedRecipe.description}
                    onChange={handleTextChange}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-white"
                />
            </div>
             <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-300">Instructions (one per line)</label>
                <textarea
                    name="instructions"
                    id="instructions"
                    value={editedRecipe.instructions.join('\n')}
                    onChange={handleArrayChange}
                    rows={6}
                    className="mt-1 block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm text-white"
                />
            </div>
            <div className="flex items-center justify-end gap-2 mt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-500 border border-gray-400 text-sm font-semibold rounded-lg hover:bg-gray-400 transition text-white">
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 transition">
                    Save Changes
                </button>
            </div>
        </form>
    );
};


export const SavedRecipesModal: React.FC<SavedRecipesModalProps> = ({ isOpen, onClose, recipes, onView, onDelete, onUpdate }) => {
    const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSave = (updatedRecipe: SavedRecipe) => {
        onUpdate(updatedRecipe);
        setEditingRecipeId(null);
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 transition-opacity"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col m-4 ring-1 ring-white/10">
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-100">Your Saved Recipes</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6" />
                        <span className="sr-only">Close modal</span>
                    </button>
                </header>
                
                <main className="p-6 overflow-y-auto">
                    {recipes.length > 0 ? (
                        <ul className="space-y-4">
                            {recipes.map(recipe => (
                                <li key={recipe.id}>
                                    {editingRecipeId === recipe.id ? (
                                        <EditForm 
                                            recipe={recipe}
                                            onSave={handleSave}
                                            onCancel={() => setEditingRecipeId(null)}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                            <img 
                                                src={recipe.imageUrl} 
                                                alt={recipe.recipeName}
                                                className="w-24 h-24 object-cover rounded-md flex-shrink-0" 
                                            />
                                            <div className="flex-grow">
                                                <h3 className="font-semibold text-lg text-gray-200">{recipe.recipeName}</h3>
                                                <p className="text-sm text-gray-400 line-clamp-2">{recipe.description}</p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                                                 <button 
                                                    onClick={() => onView(recipe)} 
                                                    className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 transition"
                                                >
                                                    View
                                                </button>
                                                <button 
                                                    onClick={() => setEditingRecipeId(recipe.id)}
                                                    className="p-2 text-blue-400 rounded-lg hover:bg-blue-500/20 transition"
                                                    aria-label={`Edit ${recipe.recipeName}`}
                                                >
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => onDelete(recipe.id)}
                                                    className="p-2 text-red-400 rounded-lg hover:bg-red-500/20 transition"
                                                    aria-label={`Delete ${recipe.recipeName}`}
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-12">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <h3 className="mt-2 text-xl font-semibold text-gray-200">No Saved Recipes</h3>
                            <p className="mt-1 text-gray-500">Generate a recipe and save it to start your collection!</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};