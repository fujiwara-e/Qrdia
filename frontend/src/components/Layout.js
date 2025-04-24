import React from 'react';

function Layout({ children }) {
    return (
        <div className="app-container">
            <header className="app-header">
                <h1>DPS デモアプリケーション</h1>
            </header>
            <main className="app-main">
                {children}
            </main>
            <footer className="app-footer">
                <p>© 2025 DPS Demo</p>
            </footer>
        </div>
    );
}

export default Layout;
