import React from 'react';
import { ChatIcon } from './icons/ChatIcon';

interface ChatbotFabProps {
    onClick: () => void;
}

export const ChatbotFab: React.FC<ChatbotFabProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-8 right-8 z-30 bg-gradient-to-r from-yellow-500 to-orange-500 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
            aria-label="Open culinary assistant"
        >
            <ChatIcon className="w-8 h-8" />
        </button>
    );
};