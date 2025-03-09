import React from 'react';
import Layout from './Layout';
import './styles/MainScreen.css';

function MainScreen() {
  return (
    <Layout>
      <div className="main-screen">
        <h1>Welcome to the Dorm Finder App</h1>
        <p>Discover the best dormitories near your workplace or school.</p>
      </div>
    </Layout>
  );
}

export default MainScreen;
