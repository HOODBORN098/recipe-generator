import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { COMMON_INGREDIENTS } from '../constants';

interface IngredientInputProps {
    ingredients: string[];
    setIngredients: React.Dispatch<React.SetStateAction<string[]>>;
}

// FIX: Define a minimal interface for a SpeechRecognition instance.
// This is to provide types for the feature, as it's not a standard part of TypeScript's DOM library.
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

// FIX: Access non-standard browser APIs `SpeechRecognition` and `webkitSpeechRecognition` by casting window to `any`.
// Renamed the variable to `SpeechRecognitionAPI` to avoid a name collision with the `SpeechRecognition` interface.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognitionAPI;

export const IngredientInput: React.FC<IngredientInputProps> = ({ ingredients, setIngredients }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isListening, setIsListening] = useState(false);
    // FIX: Use the custom `SpeechRecognition` interface for the ref's type.
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isSpeechRecognitionSupported) {
            console.warn("Speech recognition not supported by this browser.");
            return;
        }

        // FIX: Use the renamed variable to create a new SpeechRecognition instance.
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            if (transcript && !ingredients.includes(transcript)) {
                setIngredients(prev => [...prev, transcript]);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognitionRef.current = recognition;

    }, [ingredients, setIngredients]);

    const handleToggleListening = () => {
        if (!recognitionRef.current) return;
        
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleAddIngredient = () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue && !ingredients.includes(trimmedValue)) {
            setIngredients([...ingredients, trimmedValue]);
            setInputValue('');
            setSuggestions([]);
        }
    };

    const handleRemoveIngredient = (ingredientToRemove: string) => {
        setIngredients(ingredients.filter(ing => ing !== ingredientToRemove));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        if (value) {
            const filteredSuggestions = COMMON_INGREDIENTS.filter(item =>
                item.toLowerCase().startsWith(value.toLowerCase())
            ).slice(0, 5); // Limit to 5 suggestions
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        setSuggestions([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddIngredient();
        }
    };

    return (
        <div ref={containerRef}>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Your Ingredients</h3>
            <div className="relative">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={isListening ? "Listening..." : "e.g., 2 chicken thighs"}
                        className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition text-gray-200"
                        disabled={isListening}
                        autoComplete="off"
                    />
                    {isSpeechRecognitionSupported && (
                        <button
                            onClick={handleToggleListening}
                            className={`p-2.5 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-600 text-gray-200 hover:bg-gray-500'}`}
                            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                        >
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={handleAddIngredient}
                        className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                        Add
                    </button>
                </div>
                {suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                        {suggestions.map(s => (
                            <li 
                                key={s} 
                                onClick={() => handleSuggestionClick(s)} 
                                className="px-4 py-2 cursor-pointer hover:bg-gray-600"
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
                {ingredients.map((ingredient) => (
                    <span key={ingredient} className="flex items-center bg-yellow-400/20 text-yellow-300 text-sm font-medium px-3 py-1 rounded-full">
                        {ingredient}
                        <button onClick={() => handleRemoveIngredient(ingredient)} className="ml-2 text-yellow-400 hover:text-yellow-200">
                           <CloseIcon className="w-4 h-4" />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};