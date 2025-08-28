import React from 'react';

interface LoadingStateProps {
    message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-gray-800/50 p-8 rounded-2xl shadow-lg ring-1 ring-white/10 text-center">
            <svg className="animate-spin h-12 w-12 text-yellow-500 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-2xl font-semibold text-gray-200">Just a moment...</h2>
            <p className="text-gray-400 mt-2">{message}</p>
        </div>
    );
};