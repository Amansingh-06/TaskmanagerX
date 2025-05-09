import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TodoApp from './component/TodoApp';
import NavBar from './component/Navbar';
import LoginFlow from './component/LoginFlow';
import InstallPrompt from './component/InstallBanner';

const App = ({
  isInstallable,
  onInstallClick,
  showInstallBanner,
  handleCancelClick,
}) => {


  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-100 flex flex-col">
        {/* ✅ Navigation Bar */}
        <NavBar />

        {/* ✅ Routes */}
        <div className="py-4 flex flex-col gap-3">
          <Routes>
            <Route path="/login" element={<LoginFlow />} />
            <Route path="/" element={<TodoApp />} />
          </Routes>
        </div>

        {/* ✅ Install Prompt for Mobile */}
        {showInstallBanner && (
          <InstallPrompt onInstallClick={onInstallClick} handleCancelClick={handleCancelClick} />
        )}
      </div>
    </Router>
  );
};

export default App;
