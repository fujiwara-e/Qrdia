import React from 'react';

function Layout({ children }) {
    return (
        <div className="app-container">
            <header className="app-header" style={{ padding: '0.5rem 1rem', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{ margin: '0', fontSize: '1.2rem' }}>dps-demo</h2>
            </header>
            <main className="app-main">
                {children}
            </main>
        </div>
    );
}

export default Layout;
