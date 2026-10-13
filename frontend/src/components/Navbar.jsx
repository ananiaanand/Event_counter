import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  HeartIcon, CalendarIcon, ImageIcon, GiftIcon, 
  MessageHeartIcon, MailIcon, CopyIcon, CheckIcon, 
  LogOutIcon, FrogRatLogo, ActivityIcon, TrashIcon
} from './Icons';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { 
    room, 
    logout,
    deleteAccount
  } = useContext(AuthContext);

  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <nav className="navbar-couples">
      <div className="navbar-inner">
        {/* Brand with Frog and Rat Emoji Logo */}
        <div className="brand-wrapper" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
          <FrogRatLogo size="medium" />
          <span className="brand-text">
            <span className="brand-name-part">lub</span>
            <span className="brand-dot-part">.</span>
          </span>
        </div>

        {/* Navigation Tabs */}
        <ul className="nav-links">
          <li>
            <button 
              type="button" 
              className={`nav-link-btn ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <HeartIcon size={16} /> Home
            </button>
          </li>
          <li>
            <button 
              type="button" 
              className={`nav-link-btn ${activeTab === 'habits' ? 'active' : ''}`}
              onClick={() => setActiveTab('habits')}
            >
              <ActivityIcon size={16} /> Habits
            </button>
          </li>
          <li>
            <button 
              type="button" 
              className={`nav-link-btn ${activeTab === 'memories' ? 'active' : ''}`}
              onClick={() => setActiveTab('memories')}
            >
              <ImageIcon size={16} /> Memories
            </button>
          </li>
          <li>
            <button 
              type="button" 
              className={`nav-link-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <GiftIcon size={16} /> Wishlist
            </button>
          </li>
          <li>
            <button 
              type="button" 
              className={`nav-link-btn ${activeTab === 'tifftiff' ? 'active' : ''}`}
              onClick={() => setActiveTab('tifftiff')}
            >
              <MessageHeartIcon size={15} /> TiffTiff
            </button>
          </li>
          <li>
            <button 
              type="button" 
              className={`nav-link-btn ${activeTab === 'letters' ? 'active' : ''}`}
              onClick={() => setActiveTab('letters')}
            >
              <MailIcon size={15} /> Future Letter
            </button>
          </li>
        </ul>

        {/* Actions (Only Room Code & Logout - avatars and view toggle removed!) */}
        <div className="nav-actions">
          {room?.code && (
            <button 
              type="button" 
              className="code-copy-pill"
              onClick={handleCopyCode}
              title="Click to copy your secret room code"
            >
              {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
              <span>{room.code}</span>
            </button>
          )}

          <button 
            type="button" 
            className="btn btn-yellow btn-sm"
            onClick={logout}
            title="Sign out"
          >
            <LogOutIcon size={14} /> LOGOUT
          </button>

          <button 
            type="button" 
            className="btn btn-delete-account btn-sm"
            onClick={() => setShowDeleteModal(true)}
            title="Permanently delete account and room"
          >
            <TrashIcon size={13} /> Delete Acc
          </button>
        </div>
      </div>

      {/* Delete Account & Room Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal-content modal-minimal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              background: '#FEE2E2', 
              color: '#DC2626', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1rem auto',
              border: '2px solid var(--cartoon-border-color)',
              boxShadow: '2px 2px 0px var(--cartoon-border-color)'
            }}>
              <TrashIcon size={26} />
            </div>

            <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: "'Chewy', cursive", fontSize: '1.5rem', color: 'var(--cartoon-border-color)' }}>
              Delete Your Account &amp; Room?
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 1.25rem 0', lineHeight: 1.45 }}>
              Are you sure? This will permanently delete your account, secret room code (<strong>{room?.code}</strong>), and all shared memories, habits, love letters, and milestones. <strong>This action cannot be undone.</strong>
            </p>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger btn-sm" 
                onClick={handleConfirmDeleteAccount}
                disabled={deleting}
                style={{ 
                  flex: 1.3,
                  background: '#EF4444',
                  color: '#FFFFFF',
                  borderColor: 'var(--cartoon-border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <TrashIcon size={14} />
                {deleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

