import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import TeamBuilder from "./pages/TeamBuilder";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/team-builder" element={<TeamBuilder />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;