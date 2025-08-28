import React, { useState, useCallback } from 'react';
import { findRecipesFromWeb, generateRecipeImage } from '../services/geminiService';
import type { FoundRecipe, GroundingSource } from '../types';
import { LoadingState } from './LoadingState';
import { ErrorDisplay } from './ErrorDisplay';
import { SearchIcon } from './icons/SearchIcon';
import { CloseIcon } from './icons/CloseIcon';

const RecipeCard: React.FC<{ recipe: FoundRecipe; imageUrl: string; onSelect: () => void }> = ({ recipe, imageUrl, onSelect }) => (
    <div 
        className="bg-gray-800 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10 cursor-pointer transform hover:-translate-y-1 transition-transform duration-300"
        onClick={onSelect}
    >
        <img src={imageUrl} alt={recipe.recipeName} className="w-full h-48 object-cover" />
        <div className="p-4">
            <h3 className="font-bold text-lg text-gray-200 truncate">{recipe.recipeName}</h3>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{recipe.description}</p>
        </div>
    </div>
);

const RecipeDetailModal: React.FC<{ recipe: FoundRecipe; sources: GroundingSource[]; onClose: () => void }> = ({ recipe, sources, onClose }) => (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
        onClick={onClose}
    >
        <div 
            className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4 ring-1 ring-white/10"
            onClick={e => e.stopPropagation()}
        >
            <header className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-gray-100">{recipe.recipeName}</h2>
                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </header>
            <main className="p-6 overflow-y-auto space-y-6">
                 <div>
                    <h3 className="text-xl font-semibold text-yellow-400 mb-2">Description</h3>
                    <p className="text-gray-300">{recipe.description}</p>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-yellow-400 mb-2">Ingredients</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                        {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-yellow-400 mb-2">Instructions</h3>
                    <ol className="space-y-3">
                       {recipe.instructions.map((step, index) => (
                            <li key={index} className="flex items-start">
                                <span className="flex-shrink-0 bg-yellow-500 text-gray-900 font-bold w-8 h-8 rounded-full flex items-center justify-center mr-4">{index + 1}</span>
                                <p className="text-gray-300 pt-1">{step}</p>
                            </li>
                        ))}
                    </ol>
                </div>
                {sources.length > 0 && (
                     <div>
                        <h3 className="text-xl font-semibold text-yellow-400 mb-2">Sources</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                            {/* FIX: Since source.web can be undefined, we must check for its existence before accessing its properties. */}
                            {sources.map((source, i) => (
                                source.web && source.web.uri && (
                                    <li key={i}>
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                            {source.web.title || source.web.uri}
                                        </a>
                                    </li>
                                )
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    </div>
);


export const ExploreView: React.FC = () => {
    const [query, setQuery] = useState('African Jollof Rice');
    const [results, setResults] = useState<{ recipe: FoundRecipe, imageUrl: string }[]>([]);
    const [sources, setSources] = useState<GroundingSource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<FoundRecipe | null>(null);

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setResults([]);
        setSources([]);

        try {
            const { recipes, sources } = await findRecipesFromWeb(query);
            
            const imagePromises = recipes.map(recipe => 
                generateRecipeImage(recipe.recipeName, recipe.description)
            );
            const imageUrls = await Promise.all(imagePromises);

            const combinedResults = recipes.map((recipe, index) => ({
                recipe,
                imageUrl: imageUrls[index]
            }));

            setResults(combinedResults);
            setSources(sources);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [query]);
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };


    return (
        <div className="mt-6 animate-fade-in">
            <div className="flex items-center gap-2 max-w-2xl mx-auto">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for any recipe... e.g., 'Moroccan Tagine'"
                    className="flex-grow px-5 py-3 bg-gray-700 border border-gray-600 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition text-gray-200 text-lg"
                />
                <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold p-3.5 rounded-full hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                >
                    <SearchIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="mt-8">
                {isLoading && <LoadingState message={`Searching for "${query}"...`} />}
                {error && <ErrorDisplay message={error} />}
                {!isLoading && !error && results.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map(({ recipe, imageUrl }, index) => (
                           <RecipeCard 
                                key={`${recipe.recipeName}-${index}`}
                                recipe={recipe} 
                                imageUrl={imageUrl}
                                onSelect={() => setSelectedRecipe(recipe)}
                           />
                        ))}
                    </div>
                )}
                {!isLoading && !error && results.length === 0 && (
                     <div className="text-center py-16">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="mt-2 text-xl font-semibold text-gray-200">Discover New Flavors</h3>
                        <p className="mt-1 text-gray-500">Search for a dish to find recipes from around the world.</p>
                    </div>
                )}
            </div>

            {selectedRecipe && (
                <RecipeDetailModal 
                    recipe={selectedRecipe} 
                    sources={sources}
                    onClose={() => setSelectedRecipe(null)} 
                />
            )}
        </div>
    );
};