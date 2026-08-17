import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import EventCard from '../components/EventCard';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [title, setTitle] = useState('');
    const [targetDate, setTargetDate] = useState('');
    
    const [editingEvent, setEditingEvent] = useState(null);

    const { logout, user } = useContext(AuthContext);

    const fetchEvents = async () => {
        try {
            const response = await axiosInstance.get('events/');
            setEvents(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching events", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSubmitEvent = async (e) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                await axiosInstance.put(`events/${editingEvent.id}/`, {
                    title,
                    target_date: targetDate
                });
            } else {
                await axiosInstance.post('events/', {
                    title,
                    target_date: targetDate
                });
            }
            setTitle('');
            setTargetDate('');
            setShowForm(false);
            setEditingEvent(null);
            fetchEvents(); // Refresh list
        } catch (error) {
            console.error("Error saving event", error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await axiosInstance.delete(`events/${eventId}/`);
                fetchEvents();
            } catch (error) {
                console.error("Error deleting event", error);
            }
        }
    };

    const openEditForm = (event) => {
        setEditingEvent(event);
        setTitle(event.title);
        // Format date for datetime-local input
        const dateObj = new Date(event.target_date);
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        const localISOTime = (new Date(dateObj - tzoffset)).toISOString().slice(0, 16);
        setTargetDate(localISOTime);
        setShowForm(true);
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            try {
                await axiosInstance.delete('delete-account/');
                logout();
            } catch (error) {
                console.error("Error deleting account", error);
                alert("Failed to delete account. Please try again.");
            }
        }
    };

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="navbar-brand">
                    🐢 CountDown
                </div>
                <div className="navbar-nav">
                    <span style={{ fontWeight: '500' }}>Hello, {user?.username || 'User'} 🐸</span>
                    <button onClick={handleDeleteAccount} className="btn btn-outline" style={{ padding: '0.4rem 1rem', borderColor: 'red', color: 'red', marginRight: '0.5rem' }}>
                        Delete Account
                    </button>
                    <button onClick={logout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>
                        Logout
                    </button>
                </div>
            </nav>

            <div className="dashboard-header">
                <h2>Your Events 🦖</h2>
                <button 
                    className="btn btn-primary" 
                    style={{ width: 'auto' }}
                    onClick={() => {
                        if (showForm) {
                            setShowForm(false);
                            setEditingEvent(null);
                            setTitle('');
                            setTargetDate('');
                        } else {
                            setShowForm(true);
                        }
                    }}
                >
                    {showForm ? 'Cancel' : '+ New Event'}
                </button>
            </div>

            {showForm && (
                <div className="add-event-form">
                    <h3>{editingEvent ? 'Edit Event 🦕' : 'Create New Event 🦕'}</h3>
                    <form onSubmit={handleSubmitEvent}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Event Title</label>
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="E.g., Summer Vacation"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Target Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    value={targetDate}
                                    onChange={(e) => setTargetDate(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Save Event</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div>Loading your events... 🐊</div>
            ) : events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐲</div>
                    <p>You don't have any events yet.</p>
                    <p>Click "+ New Event" to get started!</p>
                </div>
            ) : (
                <div className="events-grid">
                    {events.map(event => (
                        <EventCard 
                            key={event.id} 
                            event={event} 
                            onEdit={() => openEditForm(event)}
                            onDelete={() => handleDeleteEvent(event.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
