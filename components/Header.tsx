import React from 'react';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface HeaderProps {
    onShowSaved: () => void;
    savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onShowSaved, savedCount }) => {
    return (
        <header className="bg-gray-900/70 backdrop-blur-lg shadow-lg sticky top-0 z-20 ring-1 ring-white/10">
            <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        Culinary Canvas
                    </h1>
                    <p className="text-gray-400 mt-1">Your ingredients, reimagined.</p>
                </div>
                <button 
                    onClick={onShowSaved}
                    className="relative flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 font-semibold hover:bg-gray-700 transition-colors"
                >
                    <BookmarkIcon className="w-5 h-5 text-yellow-400" />
                    <span>Saved Recipes</span>
                    {savedCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
                            {savedCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
};