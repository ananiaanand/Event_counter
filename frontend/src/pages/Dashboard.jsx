import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import HomeTab from './tabs/HomeTab';
import HabitsTab from './tabs/HabitsTab';
import MemoriesTab from './tabs/MemoriesTab';
import WishlistTab from './tabs/WishlistTab';
import TiffTiffTab from './tabs/TiffTiffTab';
import FutureLettersTab from './tabs/FutureLettersTab';
import { HeartIcon } from '../components/Icons';

const Dashboard = () => {
  const { room, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('home');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Entering your sanctuary...</p>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'habits' && <HabitsTab />}
        {activeTab === 'memories' && <MemoriesTab />}
        {activeTab === 'wishlist' && <WishlistTab />}
        {activeTab === 'tifftiff' && <TiffTiffTab />}
        {activeTab === 'letters' && <FutureLettersTab />}
      </main>

      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem 1rem', 
        borderTop: '1px solid var(--border-light)', 
        fontSize: '0.82rem', 
        color: 'var(--text-muted)' 
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
          <span>lub.</span>
          <span>&bull;</span>
          <span>Our Private Synchronized Couple Space</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
