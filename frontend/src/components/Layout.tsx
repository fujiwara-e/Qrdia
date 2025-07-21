import React from "react";

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center min-h-screen mx-2">
            <header className="bg-black text-white text-center text-sm rounded w-full py-1">
                DPS Demo
            </header>
            <main className="flex-1 p-4 bg-gray-50">
                {children}
            </main>
        </div>
    );
}