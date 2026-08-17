import React, { useState, useEffect } from 'react';

const EventCard = ({ event, onEdit, onDelete }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isPast, setIsPast] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const target = new Date(event.target_date).getTime();
            const now = Date.now();
            const difference = target - now;

            if (difference <= 0) {
                setIsPast(true);
                return;
            }

            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [event.target_date]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="event-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3>{event.title}</h3>
                <div>
                    <button onClick={onEdit} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', marginRight: '0.3rem' }}>Edit</button>
                    <button onClick={onDelete} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderColor: 'red', color: 'red' }}>Delete</button>
                </div>
            </div>
            <div className="target-date">{formatDate(event.target_date)}</div>
            
            {isPast ? (
                <div style={{ color: 'var(--primary-orange)', fontWeight: '600' }}>
                    Event has passed!
                </div>
            ) : (
                <div className="countdown-display">
                    <div className="countdown-item">
                        <span className="countdown-value">{timeLeft.days}</span>
                        <span className="countdown-label">Days</span>
                    </div>
                    <div className="countdown-item">
                        <span className="countdown-value">{timeLeft.hours}</span>
                        <span className="countdown-label">Hrs</span>
                    </div>
                    <div className="countdown-item">
                        <span className="countdown-value">{timeLeft.minutes}</span>
                        <span className="countdown-label">Min</span>
                    </div>
                    <div className="countdown-item">
                        <span className="countdown-value">{timeLeft.seconds}</span>
                        <span className="countdown-label">Sec</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventCard;
