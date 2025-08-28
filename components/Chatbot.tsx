import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    history: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, history, onSendMessage, isLoading }) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if(isOpen) {
            scrollToBottom();
        }
    }, [history, isOpen, isLoading]);
    
    const handleSend = () => {
        const trimmedMessage = inputValue.trim();
        if (trimmedMessage) {
            onSendMessage(trimmedMessage);
            setInputValue('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-40"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chatbot-title"
        >
            <div className="flex flex-col w-[calc(100vw-2rem)] h-[70vh] max-w-md bg-gray-800 rounded-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/50 flex-shrink-0">
                    <h2 id="chatbot-title" className="text-xl font-bold text-gray-100">Mnoma</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6" />
                        <span className="sr-only">Close chat</span>
                    </button>
                </header>

                <main className="flex-grow p-4 overflow-y-auto bg-gray-800">
                    <div className="space-y-4">
                        {history.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                    <p className="text-sm break-words">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-xs md:max-w-sm px-4 py-2 rounded-2xl bg-gray-700 text-gray-200">
                                    <div className="flex items-center space-x-1">
                                        <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </main>

                <footer className="p-3 border-t border-gray-700 bg-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a cooking question..."
                            className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-full focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition text-gray-200"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !inputValue.trim()}
                            className="bg-yellow-500 text-white p-2.5 rounded-full hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                            aria-label="Send message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};