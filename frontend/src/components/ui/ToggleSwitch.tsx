import React from 'react';

type ToggleSwitchProps = {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked = false, onChange, disabled = false }) => {
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        onChange?.(e.target.checked);
    };

    return (
        <label className={`flex select-none items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleCheckboxChange}
                    className="sr-only"
                    disabled={disabled}
                />
                <div
                    className={`box block h-8 w-14 rounded-full ${checked ? (disabled ? 'bg-black' : 'bg-black') : 'bg-gray-300'}`}
                ></div>
                <div
                    className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition ${checked ? 'translate-x-full' : ''}`}
                ></div>
            </div>
        </label>
    );
};

export default ToggleSwitch;
