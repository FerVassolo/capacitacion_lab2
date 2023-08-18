// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import BrowserRouter
import './App.css';
import HomePage from './pages/HomePage.js';
import PokemonInfoPage from "./pages/PokemonInfoPage";
import ResponsiveGrid from './pages/MUItest'
function App() {
    return (
        <Router>
            <Routes>
                <Route path={'/'} element={<HomePage />} />
                <Route path={'/test'} element={<ResponsiveGrid />} />
                <Route path={'/pokemon/:name'} element={<PokemonInfoPage />} />
            </Routes>
        </Router>
    );
}

export default App;
