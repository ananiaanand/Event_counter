import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { CalendarIcon, PlusIcon, TrashIcon, PinIcon } from '../../components/Icons';

const DatesTab = () => {
  const { room, effectiveRole } = useContext(AuthContext);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [dateVal, setDateVal] = useState('');
  const [category, setCategory] = useState('Milestone');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDates = async () => {
    try {
      const res = await axiosInstance.get('dates/');
      setDates(res.data);
    } catch (err) {
      console.error('Failed to fetch dates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDates();
  }, []);

  const handleAddDate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosInstance.post('dates/', {
        title,
        date: dateVal,
        category,
        description
      });
      setTitle('');
      setDateVal('');
      setDescription('');
      setShowModal(false);
      await fetchDates();
    } catch (err) {
      console.error('Failed to create date:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this important date?')) return;
    try {
      await axiosInstance.delete(`dates/${id}/`);
      setDates(dates.filter(d => d.id !== id));
    } catch (err) {
      console.error('Failed to delete date:', err);
    }
  };

  const getCountdownText = (daysUntil) => {
    if (daysUntil === 0) return 'Today!';
    if (daysUntil > 0) return `In ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`;
    const pastDays = Math.abs(daysUntil);
    return `${pastDays} ${pastDays === 1 ? 'day' : 'days'} ago`;
  };

  const getAuthorBadgeStyle = (gender) => {
    if (gender === 'boy') {
      return { background: 'var(--baby-blue-subtle)', color: 'var(--baby-blue-text)', border: '1px solid var(--baby-blue-border)' };
    }
    if (gender === 'girl') {
      return { background: 'var(--baby-pink-subtle)', color: 'var(--baby-pink-text)', border: '1px solid var(--baby-pink-border)' };
    }
    return { background: 'var(--baby-yellow-subtle)', color: 'var(--baby-yellow-text)', border: '1px solid var(--baby-yellow-border)' };
  };

  return (
    <div>
      <div className="section-header-bar">
        <div className="section-title-group">
          <h2>Important Dates &amp; Milestones</h2>
          <p>Every moment that shaped our story, tracked together in one place</p>
        </div>
        <button 
          type="button" 
          className="btn btn-primary btn-sm"
          onClick={() => setShowModal(true)}
        >
          <PlusIcon size={14} /> Add Important Date
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading milestones...</p>
      ) : dates.length === 0 ? (
        <div className="empty-state-cartoon">
          <CalendarIcon size={48} className="icon" />
          <h3 style={{ marginTop: '1rem', fontSize: '1.8rem' }}>No Important Dates Added Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '440px', margin: '0.5rem auto 1.5rem auto' }}>
            He or she can add anniversaries, first trips, birthdays, or future plans!
          </p>
          <button type="button" className="btn btn-yellow" onClick={() => setShowModal(true)}>
            <PlusIcon size={16} /> Add First Date
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {dates.map((item) => (
            <div key={item.id} className="milestone-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ 
                  fontSize: '0.88rem', 
                  fontFamily: "'Chewy', cursive",
                  letterSpacing: '0.5px',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: '#FEF08A',
                  border: '2px solid var(--cartoon-border-color)',
                  boxShadow: '2px 2px 0px var(--cartoon-border-color)'
                }}>
                  {item.category}
                </span>

                <button 
                  type="button" 
                  onClick={() => handleDelete(item.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  title="Remove milestone"
                >
                  <TrashIcon size={14} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>{item.title}</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                <CalendarIcon size={15} />
                <span>{item.date}</span>
                <span style={{ 
                  marginLeft: 'auto', 
                  fontWeight: 700, 
                  fontSize: '0.8rem',
                  color: item.days_until === 0 ? 'var(--baby-pink-text)' : 'var(--text-main)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  background: item.days_until >= 0 ? '#ECFDF5' : '#F3F4F6'
                }}>
                  {getCountdownText(item.days_until)}
                </span>
              </div>

              {item.description && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1 }}>
                  {item.description}
                </p>
              )}

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Added by:</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: 'var(--radius-full)',
                  ...getAuthorBadgeStyle(item.creator_gender)
                }}>
                  {item.creator_username}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Date Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Important Date</h3>
              <button type="button" className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleAddDate}>
              <div className="form-group">
                <label className="form-label">Event / Milestone Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Our First Trip Together, When He Proposed, Her Birthday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateVal}
                  onChange={(e) => setDateVal(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Anniversary">Anniversary</option>
                  <option value="Milestone">Milestone</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Travel & Date">Travel &amp; Date</option>
                  <option value="Promise">Promise</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes / Description (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Write a sweet note about this date..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Save Important Date'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatesTab;
