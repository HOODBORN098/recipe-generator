import React from 'react';

export const IntroState: React.FC = () => {
    return (
        <div className="relative flex flex-col items-center justify-center h-full min-h-[600px] bg-gray-800 p-8 rounded-2xl shadow-lg ring-1 ring-white/10 text-center overflow-hidden">
             <img 
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop" 
                alt="A beautiful dish"
                className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
            <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white drop-shadow-lg">Welcome to Culinary Canvas</h2>
                <p className="text-gray-300 mt-3 max-w-md mx-auto text-lg">
                    Ready to turn your ingredients into a masterpiece? Add what you have, select your preferences, and let our AI chef create a unique recipe just for you.
                </p>
            </div>
        </div>
    );
};