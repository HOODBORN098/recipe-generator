import React from 'react';

interface TabsProps {
    activeTab: 'generate' | 'explore';
    setActiveTab: (tab: 'generate' | 'explore') => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
    const commonClasses = "w-1/2 py-3 text-center font-semibold rounded-lg transition-colors duration-300";
    const activeClasses = "bg-gray-700 text-white";
    const inactiveClasses = "text-gray-400 hover:bg-gray-800";

    return (
        <div className="w-full max-w-md mx-auto bg-gray-800/80 rounded-xl p-1 flex ring-1 ring-white/10">
            <button
                onClick={() => setActiveTab('generate')}
                className={`${commonClasses} ${activeTab === 'generate' ? activeClasses : inactiveClasses}`}
            >
                Generate
            </button>
            <button
                onClick={() => setActiveTab('explore')}
                className={`${commonClasses} ${activeTab === 'explore' ? activeClasses : inactiveClasses}`}
            >
                Explore
            </button>
        </div>
    );
};
