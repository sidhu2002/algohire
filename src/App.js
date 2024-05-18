// src/App.js
import React from 'react';
import CommentsSection from './CommentsSection';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Comments Section</h1>
      </header>
      <main>
        <CommentsSection />
      </main>
    </div>
  );
}

export default App;

