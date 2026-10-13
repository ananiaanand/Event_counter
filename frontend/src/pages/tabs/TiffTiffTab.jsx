import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { MessageHeartIcon, PlusIcon, TrashIcon, CheckIcon, HeartIcon } from '../../components/Icons';

const TiffTiffTab = () => {
  const { room, effectiveRole, user } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [howIFelt, setHowIFelt] = useState('');
  const [whatWouldHelp, setWhatWouldHelp] = useState('');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = async () => {
    try {
      const res = await axiosInstance.get('tiff/');
      setEntries(res.data);
    } catch (err) {
      console.error('Failed to fetch tiff entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosInstance.post('tiff/', {
        title: title || 'Heart to Heart',
        what_happened: whatHappened,
        how_i_felt: howIFelt,
        what_would_help: whatWouldHelp
      });
      setTitle('');
      setWhatHappened('');
      setHowIFelt('');
      setWhatWouldHelp('');
      setShowModal(false);
      await fetchEntries();
    } catch (err) {
      console.error('Failed to create tiff entry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (entryId) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await axiosInstance.patch(`tiff/${entryId}/`, {
        partner_reply: replyText
      });
      setReplyText('');
      setReplyingTo(null);
      await fetchEntries();
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (entry) => {
    try {
      const updated = !entry.is_resolved;
      await axiosInstance.patch(`tiff/${entry.id}/`, {
        is_resolved: updated
      });
      setEntries(entries.map(e => e.id === entry.id ? { ...e, is_resolved: updated } : e));
    } catch (err) {
      console.error('Failed to update resolution status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await axiosInstance.delete(`tiff/${id}/`);
      setEntries(entries.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete tiff entry:', err);
    }
  };

  return (
    <div>
      {/* Shortened Compact TiffTiff Widget */}
      <div className="tifftiff-compact-widget">
        <div className="tifftiff-widget-left">
          <div className="tifftiff-title-row">
            <h2 className="tifftiff-title">TiffTiff Sanctuary</h2>
            <span className="tifftiff-badge">Heart to Heart</span>
          </div>
          <p className="tifftiff-subtitle">
            A safe space to express feelings calmly, listen with love, and reconcile
          </p>
        </div>
        <button 
          type="button" 
          className="btn btn-primary btn-sm"
          onClick={() => setShowModal(true)}
        >
          <PlusIcon size={14} /> Express Feelings
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading entries...</p>
      ) : entries.length === 0 ? (
        <div className="empty-state-cartoon" style={{ padding: '1.5rem 1.25rem' }}>
          <MessageHeartIcon size={32} className="icon" />
          <h3 style={{ marginTop: '0.5rem', fontSize: '1.25rem' }}>No TiffTiff Entries Right Now</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '400px', margin: '0.25rem auto 1rem auto' }}>
            Everything is peaceful right now. If a quarrel happens, either of you can write here to clear the air lovingly.
          </p>
          <button type="button" className="btn btn-yellow btn-sm" onClick={() => setShowModal(true)}>
            <PlusIcon size={13} /> Write Thoughts
          </button>
        </div>
      ) : (
        <div>
          {entries.map((item) => (
            <div key={item.id} className={`tiff-card ${item.is_resolved ? 'resolved' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.04em',
                    padding: '0.15rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    background: item.is_resolved ? '#DCFCE7' : '#FEF3C7',
                    color: item.is_resolved ? '#166534' : '#92400E',
                    marginRight: '0.45rem'
                  }}>
                    {item.is_resolved ? 'Resolved With Love' : 'Needs Hug'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Written by {item.author_pet_name || item.author_username}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleResolve(item)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                  >
                    <CheckIcon size={11} /> {item.is_resolved ? 'Reopen' : 'Mark Resolved'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleDelete(item.id)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    title="Delete"
                  >
                    <TrashIcon size={13} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{item.title}</h3>

              {item.what_happened && (
                <div style={{ marginBottom: '0.45rem' }}>
                  <span className="tiff-section-label">What Happened</span>
                  <p className="tiff-section-text">{item.what_happened}</p>
                </div>
              )}

              {item.how_i_felt && (
                <div style={{ marginBottom: '0.45rem' }}>
                  <span className="tiff-section-label">How I Felt</span>
                  <p className="tiff-section-text">{item.how_i_felt}</p>
                </div>
              )}

              {item.what_would_help && (
                <div style={{ marginBottom: '0.45rem' }}>
                  <span className="tiff-section-label">What Would Help</span>
                  <p className="tiff-section-text">{item.what_would_help}</p>
                </div>
              )}

              {/* Partner Response */}
              {item.partner_reply ? (
                <div className="reply-box">
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.25rem', color: '#166534' }}>
                    Partner's Heartfelt Response:
                  </div>
                  <p>{item.partner_reply}</p>
                </div>
              ) : (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                  {replyingTo === item.id ? (
                    <div>
                      <textarea
                        className="form-textarea"
                        placeholder="Write a calm, caring reply or apology to your partner..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        style={{ minHeight: '80px', marginBottom: '0.5rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSendReply(item.id)}
                          disabled={submitting}
                        >
                          Send Loving Reply
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setReplyingTo(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => { setReplyingTo(item.id); setReplyText(''); }}
                    >
                      <HeartIcon size={14} /> Write Heartfelt Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write Tiff Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Express Your Thoughts</h3>
              <button type="button" className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleCreateEntry}>
              <div className="form-group">
                <label className="form-label">Subject / Topic</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Feeling hurt about earlier, What felt misunderstood"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">What Happened</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe the situation calmly from your point of view..."
                  value={whatHappened}
                  onChange={(e) => setWhatHappened(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">How It Made Me Feel</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. I felt unheard, a little lonely, insecure..."
                  value={howIFelt}
                  onChange={(e) => setHowIFelt(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">What Would Help Me Right Now</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. A long hug without talking, some quiet time, reassuring words..."
                  value={whatWouldHelp}
                  onChange={(e) => setWhatWouldHelp(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Post to TiffTiff Sanctuary'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiffTiffTab;
