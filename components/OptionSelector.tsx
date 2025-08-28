import React from 'react';

interface OptionSelectorProps {
    title: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    isMultiSelect?: boolean;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({ title, options, selected, onChange, isMultiSelect = false }) => {
    
    const handleSelect = (option: string) => {
        if (isMultiSelect) {
            const newSelected = selected.includes(option)
                ? selected.filter(item => item !== option)
                : [...selected, option];
            onChange(newSelected);
        } else {
            onChange([option]);
        }
    };
    
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
            <div className="flex flex-wrap gap-2">
                {options.map(option => {
                    const isSelected = selected.includes(option);
                    return (
                        <button
                            key={option}
                            onClick={() => handleSelect(option)}
                            className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors duration-200 ${
                                isSelected
                                    ? 'bg-yellow-500 text-white border-yellow-500'
                                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                            }`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};