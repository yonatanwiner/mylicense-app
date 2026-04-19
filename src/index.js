import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './firebase'; // חשוב! מאתחל את Firebase ואת window.storage
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
