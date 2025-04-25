import React from 'react';

function Layout({ children }) {
    return (
        <div className="app-container">
            <header className="app-header">
                <h2>dpp-demo</h2>
            </header>
            <main className="app-main">
                {children}
            </main>
        </div>
    );
}

export default Layout;
