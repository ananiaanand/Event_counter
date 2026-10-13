import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { GiftIcon, PlusIcon, TrashIcon, CheckIcon, SparklesIcon } from '../../components/Icons';

const WishlistTab = () => {
  const { 
    room, 
    effectiveRole, 
    effectiveMyGender, 
    effectivePartnerGender 
  } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'mine' | 'theirs' | 'ours'
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [forWhom, setForWhom] = useState('ours'); // 'mine' | 'theirs' | 'ours'
  const [link, setLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await axiosInstance.get('wishlist/');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch wishlist items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosInstance.post('wishlist/', {
        title,
        notes,
        for_whom: forWhom,
        link
      });
      setTitle('');
      setNotes('');
      setLink('');
      setForWhom('ours');
      setShowModal(false);
      await fetchItems();
    } catch (err) {
      console.error('Failed to add wishlist item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFulfilled = async (item) => {
    try {
      const updated = !item.is_fulfilled;
      await axiosInstance.patch(`wishlist/${item.id}/`, {
        is_fulfilled: updated
      });
      setItems(items.map(i => i.id === item.id ? { ...i, is_fulfilled: updated } : i));
    } catch (err) {
      console.error('Failed to update wishlist item:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item from wishlist?')) return;
    try {
      await axiosInstance.delete(`wishlist/${id}/`);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  // Determine widget CSS styling according to user specification:
  // "when i add something my widget will be pink and his would be blue, and oours opt should be there and that will be for both mine and his interface"
  const getWidgetClass = (item) => {
    if (item.for_whom === 'ours') {
      return 'ours-widget';
    }
    // Check item creator's or target's gender
    const gender = item.creator_gender;
    if (gender === 'boy') return 'boy-widget';
    if (gender === 'girl') return 'girl-widget';
    return 'girl-widget';
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'ours') return item.for_whom === 'ours';
    if (filter === 'mine') return item.for_whom === 'mine';
    if (filter === 'theirs') return item.for_whom === 'theirs';
    return true;
  });

  return (
    <div>
      <div className="section-header-bar">
        <div className="section-title-group">
          <h2>His, Hers &amp; Ours Wishlist</h2>
          <p>Things we want to buy, places we want to visit, and gifts to surprise each other</p>
        </div>
        <button 
          type="button" 
          className="btn btn-primary btn-sm"
          onClick={() => setShowModal(true)}
        >
          <PlusIcon size={14} /> Add Wishlist Item
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-bar">
        <button 
          type="button" 
          className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Items ({items.length})
        </button>
        <button 
          type="button" 
          className={`filter-pill ${filter === 'ours' ? 'active' : ''}`}
          onClick={() => setFilter('ours')}
        >
          Ours Together ({items.filter(i => i.for_whom === 'ours').length})
        </button>
        <button 
          type="button" 
          className={`filter-pill ${filter === 'mine' ? 'active' : ''}`}
          onClick={() => setFilter('mine')}
        >
          My Wishlist ({items.filter(i => i.for_whom === 'mine').length})
        </button>
        <button 
          type="button" 
          className={`filter-pill ${filter === 'theirs' ? 'active' : ''}`}
          onClick={() => setFilter('theirs')}
        >
          Partner's Wishlist ({items.filter(i => i.for_whom === 'theirs').length})
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading wishlist...</p>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state-cartoon">
          <GiftIcon size={48} className="icon" />
          <h3 style={{ marginTop: '1rem', fontSize: '1.8rem' }}>No Wishlist Items Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '440px', margin: '0.5rem auto 1.5rem auto' }}>
            Add gifts you dream of receiving or experiences you want to share together!
          </p>
          <button type="button" className="btn btn-yellow" onClick={() => setShowModal(true)}>
            <PlusIcon size={16} /> Add First Wish
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className={`wishlist-widget ${getWidgetClass(item)}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="wishlist-badge">
                  {item.for_whom === 'ours' && <><SparklesIcon size={12} /> Ours Together</>}
                  {item.for_whom === 'mine' && <>For Me</>}
                  {item.for_whom === 'theirs' && <>For Partner</>}
                </span>

                <button 
                  type="button" 
                  onClick={() => handleDelete(item.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  title="Remove from wishlist"
                >
                  <TrashIcon size={13} />
                </button>
              </div>

              <h3 style={{ 
                fontSize: '1.25rem', 
                marginBottom: '0.45rem',
                textDecoration: item.is_fulfilled ? 'line-through' : 'none',
                opacity: item.is_fulfilled ? 0.7 : 1
              }}>
                {item.title}
              </h3>

              {item.notes && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', flex: 1 }}>
                  {item.notes}
                </p>
              )}

              {item.link && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <a 
                    href={item.link.startsWith('http') ? item.link : `https://${item.link}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.78rem', textDecoration: 'underline', color: 'inherit' }}
                  >
                    View Item Link &rarr;
                  </a>
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderTop: '1px solid rgba(0, 0, 0, 0.06)', 
                paddingTop: '0.75rem',
                marginTop: 'auto' 
              }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {item.creator_gender === 'boy' ? 'Added by Him' : item.creator_gender === 'girl' ? 'Added by Her' : 'Wishlist Item'}
                </span>

                <button
                  type="button"
                  onClick={() => toggleFulfilled(item)}
                  className="btn btn-outline btn-sm"
                  style={{ 
                    padding: '0.25rem 0.65rem', 
                    fontSize: '0.75rem',
                    background: item.is_fulfilled ? 'var(--text-main)' : '#FFFFFF',
                    color: item.is_fulfilled ? '#FFFFFF' : 'var(--text-main)'
                  }}
                >
                  <CheckIcon size={12} /> {item.is_fulfilled ? 'Granted!' : 'Mark Got It'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Wishlist Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Wishlist Item</h3>
              <button type="button" className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label className="form-label">Item / Experience Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Matching hoodies, weekend cabin getaway, pottery class"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Who is this for?</label>
                <div className="gender-selector">
                  <div 
                    className={`gender-option ${forWhom === 'mine' ? (effectiveMyGender === 'boy' ? 'boy selected' : 'girl selected') : ''}`}
                    onClick={() => setForWhom('mine')}
                  >
                    <span>My Wish</span>
                  </div>

                  <div 
                    className={`gender-option ${forWhom === 'theirs' ? (effectivePartnerGender === 'boy' ? 'boy selected' : 'girl selected') : ''}`}
                    onClick={() => setForWhom('theirs')}
                  >
                    <span>Partner's Gift</span>
                  </div>

                  <div 
                    className={`gender-option ${forWhom === 'ours' ? 'selected' : ''}`}
                    onClick={() => setForWhom('ours')}
                    style={forWhom === 'ours' ? { background: 'var(--ours-gradient)', borderColor: 'var(--cartoon-border-color)' } : {}}
                  >
                    <span>Ours Together</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes or Specs (Size, Color, Brand)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Add details, size, color preferences..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Link or Store (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add to Wishlist'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistTab;
