import React, { useState } from 'react';

type ToggleSwitchProps = {
    disabled?: boolean;
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ disabled = false }) => {
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = () => {
        if (disabled) return;
        setIsChecked(!isChecked);
    };

    return (
        <label className={`flex select-none items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    className="sr-only"
                    disabled={disabled}
                />
                <div
                    className={`box block h-8 w-14 rounded-full ${isChecked ? (disabled ? 'bg-blue-300' : 'bg-blue-600') : 'bg-gray-300'}`}
                ></div>
                <div
                    className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition ${isChecked ? 'translate-x-full' : ''}`}
                ></div>
            </div>
        </label>
    );
};

export default ToggleSwitch;
