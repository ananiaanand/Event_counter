import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { MailIcon, LockIcon, UnlockIcon, PlusIcon, TrashIcon, CalendarIcon, SparklesIcon } from '../../components/Icons';

const FutureLettersTab = () => {
  const { room, effectiveRole, user } = useContext(AuthContext);
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [hint, setHint] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLetters = async () => {
    try {
      const res = await axiosInstance.get('future-letters/');
      setLetters(res.data);
    } catch (err) {
      console.error('Failed to fetch future letters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleCreateLetter = async (e) => {
    e.preventDefault();
    if (!unlockDate) {
      alert('Please select a date when this letter can be unlocked.');
      return;
    }
    setSubmitting(true);
    try {
      await axiosInstance.post('future-letters/', {
        title,
        content,
        unlock_date: unlockDate,
        hint: hint || 'A sealed time capsule letter for our future'
      });
      setTitle('');
      setContent('');
      setUnlockDate('');
      setHint('');
      setShowModal(false);
      await fetchLetters();
    } catch (err) {
      console.error('Failed to create letter:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this letter time capsule?')) return;
    try {
      await axiosInstance.delete(`future-letters/${id}/`);
      setLetters(letters.filter(l => l.id !== id));
      if (selectedLetter?.id === id) setSelectedLetter(null);
    } catch (err) {
      console.error('Failed to delete letter:', err);
    }
  };

  // Check tomorrow's minimum date for future unlock
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <div>
      <div className="section-header-bar">
        <div className="section-title-group">
          <h2>Letters to the Future</h2>
          <p>Digital time capsule letters sealed with a promise, unlocking only on their set date</p>
        </div>
        <button 
          type="button" 
          className="btn btn-primary btn-sm"
          onClick={() => setShowModal(true)}
        >
          <PlusIcon size={14} /> Seal a Future Letter
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading time capsules...</p>
      ) : letters.length === 0 ? (
        <div className="empty-state-cartoon" style={{ padding: '2rem 1.5rem' }}>
          <MailIcon size={36} className="icon" />
          <h3 style={{ marginTop: '0.75rem', fontSize: '1.35rem' }}>No Future Letters Sealed Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '420px', margin: '0.35rem auto 1.25rem auto' }}>
            Write a heartfelt message to be read on your next anniversary, a milestone birthday, or a year from today. It stays strictly locked until that exact date!
          </p>
          <button type="button" className="btn btn-yellow btn-sm" onClick={() => setShowModal(true)}>
            <PlusIcon size={14} /> Write Time Capsule Letter
          </button>
        </div>
      ) : (
        <div className="future-grid">
          {letters.map((letter) => {
            const isLocked = letter.is_locked;

            return (
              <div 
                key={letter.id} 
                className={`future-letter-card ${isLocked ? 'locked' : ''}`}
                onClick={() => setSelectedLetter(letter)}
                style={{ cursor: 'pointer' }}
              >
                {isLocked ? (
                  <div className="lock-seal-stamp" title="Locked until unlock date">
                    <LockIcon size={18} />
                  </div>
                ) : (
                  <div className="unlock-stamp" title="Unlocked and ready to read!">
                    <UnlockIcon size={18} />
                  </div>
                )}

                <h3 style={{ fontSize: '1.1rem', textAlign: 'center', marginBottom: '0.25rem' }}>
                  {letter.title}
                </h3>

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                  From: {letter.author_pet_name || (letter.author_gender === 'boy' ? 'Him' : letter.author_gender === 'girl' ? 'Her' : 'Partner')}
                </p>

                {isLocked ? (
                  <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="countdown-pill">
                      <CalendarIcon size={14} />
                      <span>Opens in {letter.days_until_unlock} {letter.days_until_unlock === 1 ? 'day' : 'days'}</span>
                    </div>

                    <div style={{ 
                      background: '#FFFFFF', 
                      borderRadius: 'var(--radius-md)', 
                      padding: '1rem', 
                      border: '1px solid var(--border-light)',
                      marginTop: '0.75rem',
                      fontStyle: 'italic',
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)'
                    }}>
                      "{letter.hint || 'A secret love letter waiting for the right moment.'}"
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                      Sealed strictly until {letter.unlock_date}
                    </p>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ 
                      textAlign: 'center', 
                      margin: '0.5rem 0',
                      color: '#16A34A',
                      fontWeight: 700,
                      fontSize: '0.85rem' 
                    }}>
                      <SparklesIcon size={14} /> Time Capsule Unlocked!
                    </div>

                    <p style={{ 
                      fontSize: '0.92rem', 
                      color: 'var(--text-main)', 
                      lineHeight: 1.7, 
                      whiteSpace: 'pre-wrap',
                      background: 'var(--bg-main)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      margin: '0.5rem 0'
                    }}>
                      {letter.content}
                    </p>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'auto', textAlign: 'right' }}>
                      Unlocked on: {letter.unlock_date}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={(e) => handleDelete(letter.id, e)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    title="Delete time capsule"
                  >
                    <TrashIcon size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Seal Letter Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Seal a Letter to the Future</h3>
              <button type="button" className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleCreateLetter}>
              <div className="form-group">
                <label className="form-label">Letter Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Read on our 2nd Anniversary, On Your 25th Birthday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unlock Date (Strictly Enforced)</label>
                <input
                  type="date"
                  className="form-input"
                  value={unlockDate}
                  min={tomorrowStr}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  This letter cannot be opened or viewed before this exact date arrives.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Teaser / Hint for Partner</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. A promise I made to you on our winter road trip..."
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Heartfelt Letter Content</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '160px' }}
                  placeholder="Pour your heart into this letter. Speak about your hopes, your gratitude, and what you want to remind them of on that special future day..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={submitting}
              >
                {submitting ? 'Sealing Capsule...' : 'Seal with Lock & Promise'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Selected letter detail modal */}
      {selectedLetter && (
        <div className="modal-overlay" onClick={() => setSelectedLetter(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3>{selectedLetter.title}</h3>
              <button type="button" className="close-btn" onClick={() => setSelectedLetter(null)}>&times;</button>
            </div>

            {selectedLetter.is_locked ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div className="lock-seal-stamp">
                  <LockIcon size={28} />
                </div>
                <h4 style={{ fontSize: '1.2rem', margin: '0.75rem 0' }}>This Letter is Sealed</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Unlocks strictly on <strong>{selectedLetter.unlock_date}</strong>.
                </p>
                <div className="countdown-pill" style={{ marginTop: '0.75rem' }}>
                  Opens in {selectedLetter.days_until_unlock} days
                </div>
                {selectedLetter.hint && (
                  <p style={{ marginTop: '1.25rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    "{selectedLetter.hint}"
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Written by {selectedLetter.author_pet_name || (selectedLetter.author_gender === 'boy' ? 'Him' : selectedLetter.author_gender === 'girl' ? 'Her' : 'Partner')} &bull; Unlocked {selectedLetter.unlock_date}
                </p>
                <div style={{ 
                  background: 'var(--bg-main)', 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius-md)', 
                  lineHeight: 1.8, 
                  fontSize: '1rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedLetter.content}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FutureLettersTab;
