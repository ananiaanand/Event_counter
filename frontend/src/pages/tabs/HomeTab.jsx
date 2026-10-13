import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { 
  HeartIcon, EditIcon, CalendarIcon, SparklesIcon, 
  UsersIcon, CopyIcon, CheckIcon, PlusIcon, TrashIcon 
} from '../../components/Icons';
import CartoonCalendar from '../../components/CartoonCalendar';

const HomeTab = () => {
  const { 
    room, 
    effectiveRole, 
    effectiveMyGender,
    effectivePartnerGender 
  } = useContext(AuthContext);

  const [stories, setStories] = useState([]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form states for editing perspective
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editFirstMet, setEditFirstMet] = useState('');
  const [editFavorite, setEditFavorite] = useState('');
  const [submittingPerspective, setSubmittingPerspective] = useState(false);

  // Form states for adding milestone date
  const [dateTitle, setDateTitle] = useState('');
  const [dateVal, setDateVal] = useState('');
  const [category, setCategory] = useState('Milestone');
  const [description, setDescription] = useState('');
  const [submittingDate, setSubmittingDate] = useState(false);

  const fetchHomeData = async () => {
    try {
      const [storiesRes, datesRes] = await Promise.all([
        axiosInstance.get('stories/'),
        axiosInstance.get('dates/')
      ]);
      setStories(storiesRes.data);
      setDates(datesRes.data);
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Creator's story and Partner's story
  const creatorStory = stories.find(s => s.author === room?.creator) || stories[0];
  const partnerStory = stories.find(s => s.author === room?.partner && s.author !== room?.creator);

  // Calculate days together
  const calculateDaysTogether = () => {
    if (!room?.togetherness_date) return 0;
    const start = new Date(room.togetherness_date);
    const today = new Date();
    const diffTime = today - start;
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const daysTogether = calculateDaysTogether();

  const getThemeClass = (gender) => {
    if (gender === 'boy') return 'blue-theme';
    if (gender === 'girl') return 'pink-theme';
    return 'yellow-theme';
  };

  const openEditModal = (targetStory) => {
    setEditTitle(targetStory?.title || '');
    setEditContent(targetStory?.content || '');
    setEditFirstMet(targetStory?.first_met || '');
    setEditFavorite(targetStory?.favorite_memory || '');
    setShowEditModal(true);
  };

  const handleSavePerspective = async (e) => {
    e.preventDefault();
    setSubmittingPerspective(true);
    try {
      const myStory = stories.find(s => 
        effectiveRole === 'creator' ? s.author === room?.creator : s.author === room?.partner
      );

      if (myStory) {
        await axiosInstance.put(`stories/${myStory.id}/`, {
          title: editTitle,
          content: editContent,
          first_met: editFirstMet,
          favorite_memory: editFavorite
        });
      } else {
        await axiosInstance.post('stories/', {
          title: editTitle,
          content: editContent,
          first_met: editFirstMet,
          favorite_memory: editFavorite
        });
      }

      const res = await axiosInstance.get('stories/');
      setStories(res.data);
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to save story perspective:', err);
    } finally {
      setSubmittingPerspective(false);
    }
  };

  // Date handlers
  const handleAddDate = async (e) => {
    e.preventDefault();
    if (!dateVal) {
      alert('Please pick a date on the calendar.');
      return;
    }
    setSubmittingDate(true);
    try {
      await axiosInstance.post('dates/', {
        title: dateTitle,
        date: dateVal,
        category,
        description
      });
      setDateTitle('');
      setDateVal('');
      setDescription('');
      setShowDateModal(false);
      const res = await axiosInstance.get('dates/');
      setDates(res.data);
    } catch (err) {
      console.error('Failed to add date:', err);
    } finally {
      setSubmittingDate(false);
    }
  };

  const handleDeleteDate = async (id) => {
    if (!window.confirm('Delete this milestone date?')) return;
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

  return (
    <div>
      {/* Compact Cozy Togetherness Header */}
      <div className="togetherness-compact-bar">
        <div className="togetherness-left">
          <div className="togetherness-couple-title">
            <span className="couple-names-compact">
              {room?.partner 
                ? `${room?.creator_pet_name || 'Room Creator'} & ${room?.partner_pet_name || 'Partner'}`
                : `Our Space with ${room?.creator_pet_name || 'My Love'}`
              }
            </span>
            <span className="togetherness-sparkle-dot">&bull;</span>
            <span className="togetherness-date-chip">
              Since {room?.togetherness_date}
            </span>
          </div>

          <p className="togetherness-subtext" style={{ margin: 0, marginTop: '0.2rem' }}>
            Our synchronized private couple sanctuary
          </p>
        </div>

        <div className="togetherness-right">
          <div className="days-counter-capsule">
            <HeartIcon size={18} className="days-heart-icon" />
            <div className="days-counter-content">
              <span className="days-counter-num">{daysTogether}</span>
              <span className="days-counter-label">Days Together</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Split Perspective Love Story Section */}
      <div className="section-header-bar">
        <div className="section-title-group">
          <h2>Our Perspectives</h2>
          <p>Read how each of us remembers and treasures our journey together</p>
        </div>
        <button 
          type="button" 
          className="btn btn-outline btn-sm"
          onClick={() => openEditModal(effectiveRole === 'creator' ? creatorStory : partnerStory)}
        >
          <EditIcon size={14} /> Write / Edit My Perspective
        </button>
      </div>

      <div className="perspective-split-grid" style={{ marginBottom: '3.5rem' }}>
        {/* LEFT HALF: Creator's Perspective */}
        <div className={`perspective-card ${getThemeClass(room?.creator_gender)}`}>
          <div className="perspective-header">
            <div className="perspective-author-badge">
              <SparklesIcon size={14} />
              <span>
                {room?.creator_gender === 'girl' ? 'Her Perspective' : room?.creator_gender === 'boy' ? 'His Perspective' : 'Perspective'} {room?.creator_pet_name ? `(${room.creator_pet_name})` : ''}
              </span>
            </div>
            {creatorStory && (
              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={() => openEditModal(creatorStory)}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.85rem' }}
              >
                <EditIcon size={13} /> Edit
              </button>
            )}
          </div>

          {creatorStory ? (
            <>
              <h3>{creatorStory.title}</h3>
              <div className="perspective-body">
                <p className="perspective-text">{creatorStory.content}</p>
              </div>
              {(creatorStory.first_met || creatorStory.favorite_memory) && (
                <div className="perspective-details">
                  {creatorStory.first_met && (
                    <div className="detail-row">
                      <span className="detail-label">The Day We First Met</span>
                      <span>{creatorStory.first_met}</span>
                    </div>
                  )}
                  {creatorStory.favorite_memory && (
                    <div className="detail-row">
                      <span className="detail-label">What I Treasure Most</span>
                      <span>{creatorStory.favorite_memory}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="perspective-body" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <p style={{ fontFamily: "'Chewy', cursive", fontSize: '1.35rem', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                No letter written yet
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Write your heartfelt letter and memories for your partner to read.
              </p>
              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={() => openEditModal(null)}
              >
                <EditIcon size={14} /> Write My Perspective
              </button>
            </div>
          )}
        </div>

        {/* RIGHT HALF: Partner's Perspective */}
        <div className={`perspective-card ${getThemeClass(room?.partner_gender || 'boy')}`}>
          <div className="perspective-header">
            <div className="perspective-author-badge">
              <SparklesIcon size={14} />
              <span>
                {room?.partner_gender === 'boy' ? 'His Perspective' : room?.partner_gender === 'girl' ? 'Her Perspective' : 'Partner Perspective'} {room?.partner_pet_name ? `(${room.partner_pet_name})` : ''}
              </span>
            </div>
            {partnerStory && (
              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={() => openEditModal(partnerStory)}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.85rem' }}
              >
                <EditIcon size={13} /> Edit
              </button>
            )}
          </div>

          {partnerStory ? (
            <>
              <h3>{partnerStory.title}</h3>
              <div className="perspective-body">
                <p className="perspective-text">{partnerStory.content}</p>
              </div>
              {(partnerStory.first_met || partnerStory.favorite_memory) && (
                <div className="perspective-details">
                  {partnerStory.first_met && (
                    <div className="detail-row">
                      <span className="detail-label">The Day We First Met</span>
                      <span>{partnerStory.first_met}</span>
                    </div>
                  )}
                  {partnerStory.favorite_memory && (
                    <div className="detail-row">
                      <span className="detail-label">What I Treasure Most</span>
                      <span>{partnerStory.favorite_memory}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : room?.partner ? (
            <div className="perspective-body" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <p style={{ fontFamily: "'Chewy', cursive", fontSize: '1.35rem', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                No letter written yet
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {room.partner_pet_name || 'Your partner'} has joined but hasn't written their letter yet.
              </p>
            </div>
          ) : (
            <div className="perspective-body" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <UsersIcon size={36} className="icon" />
              <p style={{ marginTop: '0.75rem', fontFamily: "'Chewy', cursive", fontSize: '1.4rem' }}>
                Waiting for your partner to join
              </p>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: '1.25rem' }}>
                Give them code <strong style={{ letterSpacing: '0.1em' }}>{room?.code}</strong>. When they enter the code and exact date of togetherness, their perspective will appear here!
              </p>
              <button 
                type="button" 
                className="btn btn-yellow btn-sm"
                onClick={handleCopyCode}
              >
                {copied ? <><CheckIcon size={14} /> Code Copied!</> : <><CopyIcon size={14} /> Copy Room Code</>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Important Dates & Milestones Section (Embedded directly on Home page!) */}
      <div className="section-header-bar" style={{ borderTop: '2px dashed rgba(30, 41, 59, 0.25)', paddingTop: '2.5rem' }}>
        <div className="section-title-group">
          <h2>Important Dates &amp; Milestones</h2>
          <p>Every milestone that shaped our story, tracked together on our home page</p>
        </div>
        <button 
          type="button" 
          className="btn btn-primary btn-sm"
          onClick={() => setShowDateModal(true)}
        >
          <PlusIcon size={14} /> Add Important Date
        </button>
      </div>

      {dates.length === 0 ? (
        <div className="empty-state-cartoon">
          <CalendarIcon size={48} className="icon" />
          <h3 style={{ marginTop: '1rem', fontSize: '1.8rem' }}>No Important Dates Added Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '440px', margin: '0.5rem auto 1.5rem auto' }}>
            He or she can add anniversaries, first trips, birthdays, or future plans!
          </p>
          <button type="button" className="btn btn-yellow" onClick={() => setShowDateModal(true)}>
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
                  onClick={() => handleDeleteDate(item.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  title="Remove milestone"
                >
                  <TrashIcon size={14} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.45rem', marginBottom: '0.4rem' }}>{item.title}</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                <CalendarIcon size={16} />
                <span>{item.date}</span>
                <span style={{ 
                  marginLeft: 'auto', 
                  fontFamily: "'Chewy', cursive",
                  fontSize: '1rem',
                  color: item.days_until === 0 ? '#DC2626' : 'var(--cartoon-border-color)',
                  padding: '0.15rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  background: item.days_until >= 0 ? '#DCFCE7' : '#F1F5F9',
                  border: '1.5px solid var(--cartoon-border-color)'
                }}>
                  {getCountdownText(item.days_until)}
                </span>
              </div>

              {item.description && (
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1 }}>
                  {item.description}
                </p>
              )}

              <div style={{ borderTop: '2px dashed var(--border-light)', paddingTop: '0.75rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Added by:</span>
                <span style={{ 
                  fontSize: '0.82rem', 
                  fontFamily: "'Chewy', cursive",
                  padding: '0.2rem 0.65rem', 
                  borderRadius: 'var(--radius-full)',
                  background: item.creator_gender === 'boy' ? 'var(--baby-blue)' : item.creator_gender === 'girl' ? 'var(--baby-pink)' : 'var(--baby-yellow)',
                  border: '1.5px solid var(--cartoon-border-color)'
                }}>
                  {item.category || 'Milestone'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Perspective Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Write Your Perspective</h3>
              <button type="button" className="close-btn" onClick={() => setShowEditModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePerspective}>
              <div className="form-group">
                <label className="form-label">Story Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title of your letter"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Our Story In My Words</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '140px' }}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Express how you feel, your personal memories, and love..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">The Day We Met (My Memory)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFirstMet}
                  onChange={(e) => setEditFirstMet(e.target.value)}
                  placeholder="When and where you first met"
                />
              </div>

              <div className="form-group">
                <label className="form-label">What I Treasure Most About You</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFavorite}
                  onChange={(e) => setEditFavorite(e.target.value)}
                  placeholder="What you cherish most about your partner"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={submittingPerspective}
              >
                {submittingPerspective ? 'Saving Perspective...' : 'Save Love Story'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Date Modal (Using CartoonCalendar!) */}
      {showDateModal && (
        <div className="modal-overlay" onClick={() => setShowDateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Important Date</h3>
              <button type="button" className="close-btn" onClick={() => setShowDateModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleAddDate}>
              <div className="form-group">
                <label className="form-label">Event / Milestone Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Milestone or special event title"
                  value={dateTitle}
                  onChange={(e) => setDateTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pick Milestone Date</label>
                <CartoonCalendar
                  value={dateVal}
                  onChange={setDateVal}
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
                disabled={submittingDate}
              >
                {submittingDate ? 'Adding...' : 'Save Important Date'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeTab;
