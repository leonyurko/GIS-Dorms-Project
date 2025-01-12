import React from 'react';
import Layout from './Layout';

function MainScreen() {
  return (
    <Layout>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome to the Dorm Finder App</h1>
        <p>Discover the best dormitories near your workplace or school.</p>
      </div>
    </Layout>
  );
}

export default MainScreen;
