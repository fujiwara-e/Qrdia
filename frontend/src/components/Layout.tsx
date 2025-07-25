import React from "react";

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center min-h-screen mx-2">
            <header className="bg-white text-white text-sm w-full py-1">
                <div className="mx-4">
                    <span
                        className="text-black text-3xl font-bold px-4 py-2 rounded"
                        style={{ fontFamily: "'Michroma', sans-serif" }}
                    >
                        Qrdia
                    </span>
                </div>
            </header>
            <div className="border-t border-gray-300 w-full" />
            <main className="flex-1 p-4 bg-gray-50 w-full">
                {children}
            </main>
        </div>
    );
}