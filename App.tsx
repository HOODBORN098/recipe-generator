import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { IngredientInput } from './components/IngredientInput';
import { OptionSelector } from './components/OptionSelector';
import { RecipeDisplay } from './components/RecipeDisplay';
import { LoadingState } from './components/LoadingState';
import { generateRecipe, generateRecipeImage, createChat } from './services/geminiService';
import type { Recipe, SavedRecipe, ChatMessage } from './types';
import { DIETARY_OPTIONS, MEAL_TYPE_OPTIONS, DIFFICULTY_OPTIONS } from './constants';
import { ErrorDisplay } from './components/ErrorDisplay';
import { IntroState } from './components/IntroState';
import { SavedRecipesModal } from './components/SavedRecipesModal';
import { Chatbot } from './components/Chatbot';
import { ChatbotFab } from './components/ChatbotFab';
import { Tabs } from './components/Tabs';
import { ExploreView } from './components/ExploreView';
import type { Chat } from '@google/genai';


const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'generate' | 'explore'>('generate');

    const [ingredients, setIngredients] = useState<string[]>(['3 chicken breasts', '1 cup rice', 'broccoli']);
    const [dietary, setDietary] = useState<string[]>([]);
    const [mealType, setMealType] = useState<string>('Dinner');
    const [cuisine, setCuisine] = useState<string>('');
    const [difficulty, setDifficulty] = useState<string>('Medium');

    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [recipeImage, setRecipeImage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');

    const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
    const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);

    // Chatbot state
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        try {
            const storedRecipes = localStorage.getItem('savedRecipes');
            if (storedRecipes) {
                setSavedRecipes(JSON.parse(storedRecipes));
            }
        } catch (error) {
            console.error("Failed to load saved recipes from localStorage:", error);
            localStorage.removeItem('savedRecipes');
        }

        // Initialize chat session
        chatRef.current = createChat();
        setChatHistory([{
             role: 'model',
             text: "Hello! I'm Mnoma, your culinary assistant. Ask me anything about cooking, ingredients, or recipes!"
        }]);

    }, []);

    const handleGenerateRecipe = useCallback(async () => {
        if (ingredients.length === 0) {
            setError('Please add at least one ingredient.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setRecipe(null);
        setRecipeImage('');
        
        try {
            setLoadingMessage('Crafting the perfect recipe for you...');
            const generatedRecipe = await generateRecipe(ingredients, dietary, mealType, cuisine, difficulty);
            setRecipe(generatedRecipe);
            
            setLoadingMessage('Generating a mouth-watering image...');
            const imageUrl = await generateRecipeImage(generatedRecipe.recipeName, generatedRecipe.description);
            setRecipeImage(imageUrl);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [ingredients, dietary, mealType, cuisine, difficulty]);

    const handleSaveRecipe = () => {
        if (!recipe || !recipeImage) return;

        const isAlreadySaved = savedRecipes.some(r => r.recipeName === recipe.recipeName);
        if (isAlreadySaved) return;

        const newSavedRecipe: SavedRecipe = {
            ...recipe,
            id: Date.now().toString(),
            imageUrl: recipeImage,
        };

        const updatedRecipes = [...savedRecipes, newSavedRecipe];
        setSavedRecipes(updatedRecipes);
        localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
    };
    
    const handleDeleteRecipe = (id: string) => {
        const updatedRecipes = savedRecipes.filter(r => r.id !== id);
        setSavedRecipes(updatedRecipes);
        localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
    };

    const handleUpdateRecipe = (updatedRecipe: SavedRecipe) => {
        const updatedRecipes = savedRecipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r);
        setSavedRecipes(updatedRecipes);
        localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
    };


    const handleViewSavedRecipe = (savedRecipe: SavedRecipe) => {
        const { id, imageUrl, ...recipeData } = savedRecipe;
        setRecipe(recipeData);
        setRecipeImage(imageUrl);
        setIsSavedModalOpen(false);
        setActiveTab('generate');
    };

    const handleSendMessage = async (message: string) => {
        if (!chatRef.current || isChatLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: message };
        setChatHistory(prev => [...prev, userMessage]);
        setIsChatLoading(true);

        try {
            const response = await chatRef.current.sendMessage({ message });
            const modelMessage: ChatMessage = { role: 'model', text: response.text };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (err) {
            console.error("Chat error:", err);
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having a little trouble connecting. Please try again in a moment." };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
    };


    const isCurrentRecipeSaved = recipe ? savedRecipes.some(r => r.recipeName === recipe.recipeName) : false;

    return (
        <div className="min-h-screen bg-gray-900 font-sans text-gray-200">
            <Header onShowSaved={() => setIsSavedModalOpen(true)} savedCount={savedRecipes.length} />
            <main className="container mx-auto p-4 lg:p-8">
                <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                
                {activeTab === 'generate' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                        {/* Control Panel */}
                        <aside className="lg:col-span-4 bg-gray-800/50 p-6 rounded-2xl shadow-lg ring-1 ring-white/10 h-fit">
                            <div className="space-y-6">
                                <IngredientInput ingredients={ingredients} setIngredients={setIngredients} />
                                <OptionSelector
                                    title="Dietary Preferences"
                                    options={DIETARY_OPTIONS}
                                    selected={dietary}
                                    onChange={setDietary}
                                    isMultiSelect={true}
                                />
                                <OptionSelector
                                    title="Meal Type"
                                    options={MEAL_TYPE_OPTIONS}
                                    selected={[mealType]}
                                    onChange={(selected) => setMealType(selected[0] || '')}
                                    isMultiSelect={false}
                                />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Cuisine (Optional)</h3>
                                    <input
                                        type="text"
                                        value={cuisine}
                                        onChange={(e) => setCuisine(e.target.value)}
                                        placeholder="e.g., Italian, Mexican, Thai"
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition text-gray-200"
                                    />
                                </div>
                                <OptionSelector
                                    title="Difficulty"
                                    options={DIFFICULTY_OPTIONS}
                                    selected={[difficulty]}
                                    onChange={(selected) => setDifficulty(selected[0] || '')}
                                    isMultiSelect={false}
                                />
                                <button
                                    onClick={handleGenerateRecipe}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    )}
                                    Generate Recipe
                                </button>
                            </div>
                        </aside>

                        {/* Display Area */}
                        <div className="lg:col-span-8">
                            {error && <ErrorDisplay message={error} />}
                            {isLoading && <LoadingState message={loadingMessage} />}
                            {!isLoading && !error && recipe && <RecipeDisplay recipe={recipe} imageUrl={recipeImage} onSave={handleSaveRecipe} isSaved={isCurrentRecipeSaved} />}
                            {!isLoading && !error && !recipe && <IntroState />}
                        </div>
                    </div>
                )}
                {activeTab === 'explore' && <ExploreView />}

            </main>
            <SavedRecipesModal 
                isOpen={isSavedModalOpen}
                onClose={() => setIsSavedModalOpen(false)}
                recipes={savedRecipes}
                onView={handleViewSavedRecipe}
                onDelete={handleDeleteRecipe}
                onUpdate={handleUpdateRecipe}
            />
            <ChatbotFab onClick={() => setIsChatOpen(true)} />
            <Chatbot 
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                history={chatHistory}
                onSendMessage={handleSendMessage}
                isLoading={isChatLoading}
            />
        </div>
    );
};

export default App;