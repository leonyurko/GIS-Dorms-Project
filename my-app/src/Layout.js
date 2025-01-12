import React from 'react';
import './styles/Layout.css';

function Layout({ children }) {
  return (
    <div className="layout-container">
      {/* Header */}

      {/* Main Content */}
      <main className="layout-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="layout-footer">
        <p>&copy; 2024 Dorm Finder. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default Layout;
