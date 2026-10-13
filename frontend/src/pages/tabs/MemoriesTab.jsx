import React, { useState, useEffect, useContext, useRef } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { ImageIcon, PlusIcon, TrashIcon, CalendarIcon, SparklesIcon } from '../../components/Icons';

// Aesthetic Pinterest templates in case couple wants starter aesthetic polaroids
const PRESET_TEMPLATES = [
  {
    title: 'Warm Sunset by the Beach',
    caption: 'The sky turned into cotton candy colors while we talked about our dreams.',
    location: 'Sunset Point',
    aspect: 'tall',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=700&q=80'
  },
  {
    title: 'Sunday Morning Coffee',
    caption: 'You made me hot chocolate with two marshmallows just the way I like.',
    location: 'Cozy Corner Cafe',
    aspect: 'square',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=700&q=80'
  },
  {
    title: 'Starry Drive Night',
    caption: 'Windows rolled down, favorite songs playing, holding hands quietly.',
    location: 'Hilltop Road',
    aspect: 'wide',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80'
  }
];

const MemoriesTab = () => {
  const { room, effectiveRole } = useContext(AuthContext);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [dateTaken, setDateTaken] = useState('');
  const [aspect, setAspect] = useState('tall');
  const [imageData, setImageData] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const fetchMemories = async () => {
    try {
      const res = await axiosInstance.get('memories/');
      setMemories(res.data);
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleDeviceImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Please choose an image under 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectTemplate = (template) => {
    setTitle(template.title);
    setCaption(template.caption);
    setLocation(template.location);
    setAspect(template.aspect);
    setImageData(template.imageUrl);
    setImagePreview(template.imageUrl);
  };

  const handleSaveMemory = async (e) => {
    e.preventDefault();
    if (!imageData) {
      alert('Please upload an image from your device or pick a template.');
      return;
    }
    setSubmitting(true);
    try {
      await axiosInstance.post('memories/', {
        title,
        caption,
        location,
        date_taken: dateTaken || null,
        aspect,
        image_data: imageData
      });
      setTitle('');
      setCaption('');
      setLocation('');
      setDateTaken('');
      setImageData('');
      setImagePreview('');
      setShowModal(false);
      await fetchMemories();
    } catch (err) {
      console.error('Failed to create memory:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this memory photo?')) return;
    try {
      await axiosInstance.delete(`memories/${id}/`);
      setMemories(memories.filter(m => m.id !== id));
      if (selectedPhoto?.id === id) setSelectedPhoto(null);
    } catch (err) {
      console.error('Failed to delete memory:', err);
    }
  };

  return (
    <div>
      <div className="section-header-bar">
        <div className="section-title-group">
          <h2>Our Special Memories</h2>
          <p>A Pinterest-style visual diary of all our moments together</p>
        </div>
        <button 
          type="button" 
          className="btn btn-primary btn-sm"
          onClick={() => setShowModal(true)}
        >
          <PlusIcon size={14} /> Add Special Memory
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading photos...</p>
      ) : memories.length === 0 ? (
        <div className="empty-state-cartoon">
          <ImageIcon size={48} className="icon" />
          <h3 style={{ marginTop: '1rem', fontSize: '1.8rem' }}>No Special Memories Uploaded Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '440px', margin: '0.5rem auto 1.5rem auto' }}>
            Upload candid photos directly from your phone or device to create your couple's Pinterest aesthetic board!
          </p>
          <button type="button" className="btn btn-yellow" onClick={() => setShowModal(true)}>
            <PlusIcon size={16} /> Upload Photo from Device
          </button>
        </div>
      ) : (
        <div className="pinterest-grid">
          {memories.map((photo) => (
            <div 
              key={photo.id} 
              className="pinterest-card"
              onClick={() => setSelectedPhoto(photo)}
              style={{ cursor: 'pointer' }}
            >
              <div className="polaroid-frame">
                <img 
                  src={photo.image_data} 
                  alt={photo.title}
                  className="polaroid-img"
                  loading="lazy"
                  style={{
                    maxHeight: photo.aspect === 'tall' ? '360px' : photo.aspect === 'wide' ? '200px' : '260px',
                    objectFit: 'cover'
                  }}
                />
              </div>

              <h4 className="memory-caption">{photo.title}</h4>
              
              {photo.caption && (
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                  {photo.caption}
                </p>
              )}

              <div className="memory-meta">
                <span>{photo.date_taken || 'Special Day'}</span>
                {photo.location && <span>{photo.location}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.65rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {photo.creator_gender === 'boy' ? 'From Him' : photo.creator_gender === 'girl' ? 'From Her' : 'Cherished Memory'}
                </span>
                <button 
                  type="button" 
                  onClick={(e) => handleDelete(photo.id, e)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  title="Delete memory"
                >
                  <TrashIcon size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Memory Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Special Memory</h3>
              <button type="button" className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            {/* Quick Templates option */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                Quick Pinterest Inspiration Templates
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {PRESET_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => handleSelectTemplate(tpl)}
                    style={{ fontSize: '0.76rem', whiteSpace: 'nowrap', padding: '0.35rem 0.65rem' }}
                  >
                    <SparklesIcon size={12} /> {tpl.title}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveMemory}>
              {/* Device Image Upload */}
              <div className="form-group">
                <label className="form-label">Upload from Your Device</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleDeviceImageUpload}
                  style={{ display: 'none' }}
                />
                
                <div 
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    border: '2px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--bg-main)',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  {imagePreview ? (
                    <div>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                      />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Click to change selected image
                      </p>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon size={30} className="icon" />
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, marginTop: '0.5rem' }}>
                        Click to select an image from phone or computer
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        JPG, PNG, WEBP up to 8MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Title / Heading</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rainy Walk in Paris, Beach Picnic"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sweet Caption / Story</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe what happened or what this photo means..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Date Taken</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dateTaken}
                    onChange={(e) => setDateTaken(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Central Park"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={submitting}
              >
                {submitting ? 'Adding Memory...' : 'Pin to Board'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Full view Modal */}
      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', padding: '1.5rem' }}>
            <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
              <button type="button" className="close-btn" onClick={() => setSelectedPhoto(null)}>&times;</button>
            </div>
            <img 
              src={selectedPhoto.image_data} 
              alt={selectedPhoto.title} 
              style={{ width: '100%', maxHeight: '480px', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
            />
            <h3 style={{ marginTop: '1rem', marginBottom: '0.35rem' }}>{selectedPhoto.title}</h3>
            {selectedPhoto.caption && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                {selectedPhoto.caption}
              </p>
            )}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
              <span>{selectedPhoto.date_taken || 'Date not specified'}</span>
              {selectedPhoto.location && <span>{selectedPhoto.location}</span>}
              <span>{selectedPhoto.creator_gender === 'boy' ? 'Added by Him' : selectedPhoto.creator_gender === 'girl' ? 'Added by Her' : 'Cherished Memory'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoriesTab;
