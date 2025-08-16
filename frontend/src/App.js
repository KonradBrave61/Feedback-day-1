import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MainPage from "./pages/MainPage";
import TeamBuilder from "./pages/TeamBuilder";
import CharactersPage from "./pages/CharactersPage";
import ConstellationsPage from "./pages/ConstellationsPage";
import ItemsPage from "./pages/ItemsPage";
import TechniquesPage from "./pages/TechniquesPage";
import HelperPage from "./pages/HelperPage";
import SupportPage from "./pages/SupportPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

import CommunityHub from "./pages/CommunityHub";
import ChatPage from "./pages/ChatPage";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import Notification from "./components/Notification";
import ChatBubble from "./components/ChatBubble";

function App() {
  return (
    <div className="App">
      <DndProvider backend={HTML5Backend}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainPage />} />
              
              <Route path="/team-builder" element={<TeamBuilder />} />
              <Route path="/characters" element={<CharactersPage />} />
              <Route path="/constellations" element={<ConstellationsPage />} />
              <Route path="/items" element={<ItemsPage />} />
              <Route path="/techniques" element={<TechniquesPage />} />
              <Route path="/helper" element={<HelperPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/community" element={<CommunityHub />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
            {/* Global overlays */}
            <ChatBubble />
            <Notification />
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </DndProvider>
    </div>
  );
}

export default App;