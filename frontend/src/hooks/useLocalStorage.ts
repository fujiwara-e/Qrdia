'use client';

import { use, useEffect, useState } from 'react';
import { storage } from '@/lib/utils';

export function useLocalStorage<T>(key: string, defaultValue: T) {
    const [value, setValue] = useState<T>(defaultValue);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const storedValue = storage.get<T>(key, defaultValue);
        setValue(storedValue);
        setIsLoaded(true);
    }, [key]);

    const setStoredValue = (newValue: T | ((prev: T) => T)) => {
        const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
        setValue(valueToStore);
        storage.set(key, valueToStore);
    };

    return [value, setStoredValue, isLoaded] as const;
}