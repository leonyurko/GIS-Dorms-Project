import React from 'react';
import './styles/Layout.css';

function Layout({ children }) {
  return (
    <div className="layout-container">
      <header className="layout-header">
        <h1>Dorm Finder</h1>
      </header>
      <main className="layout-content">
        {children}
      </main>
      <footer className="layout-footer">
        <p>&copy; 2024 Dorm Finder. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default Layout;
