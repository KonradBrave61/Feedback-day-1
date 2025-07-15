import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MainPage from "./pages/MainPage";
import TeamBuilder from "./pages/TeamBuilder";
import CharactersPage from "./pages/CharactersPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import Dashboard from "./pages/Dashboard";
import CommunityHub from "./pages/CommunityHub";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <div className="App">
      <DndProvider backend={HTML5Backend}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/team-builder" element={<TeamBuilder />} />
              <Route path="/characters" element={<CharactersPage />} />
              <Route path="/community" element={<CommunityHub />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </DndProvider>
    </div>
  );
}

export default App;