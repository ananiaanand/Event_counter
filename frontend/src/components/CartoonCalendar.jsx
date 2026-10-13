import React, { useState } from 'react';
import { CalendarIcon, CheckIcon } from './Icons';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const CartoonCalendar = ({ value, onChange, label = "Date of Togetherness", required = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Initialize view based on current value or today
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-11

  // Generate Year options (e.g. 2010 to 2030)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 20; y <= currentYear + 2; y++) {
    years.push(y);
  }

  // Days in selected month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const formatted = `${viewYear}-${mm}-${dd}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Check if a day is the currently selected date
  const isSelected = (day) => {
    if (!value) return false;
    const [y, m, d] = value.split('-').map(Number);
    return y === viewYear && m === viewMonth + 1 && d === day;
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Cartoon Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: 'var(--cartoon-border-sm)',
          boxShadow: 'var(--shadow-cartoon-sm)',
          background: value ? '#FFFDF0' : '#FFFFFF',
          color: 'var(--cartoon-border-color)',
          cursor: 'pointer',
          fontFamily: "'Comic Neue', cursive",
          fontWeight: 700,
          fontSize: '1.05rem',
          transition: 'var(--transition)',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translate(-1px, -1px)';
          e.currentTarget.style.boxShadow = '4px 5px 0px var(--cartoon-border-color)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate(0px, 0px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-cartoon-sm)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-full)',
            background: '#FEF08A',
            border: '2px solid var(--cartoon-border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cartoon-border-color)'
          }}>
            <CalendarIcon size={16} />
          </div>
          <span style={{ fontFamily: value ? "'Chewy', cursive" : 'inherit', fontSize: value ? '1.25rem' : '1rem' }}>
            {value ? formatDisplayDate(value) : 'Click to Pick Togetherness Date'}
          </span>
        </div>

        <span style={{
          fontFamily: "'Chewy', cursive",
          fontSize: '0.95rem',
          background: '#F1F5F9',
          padding: '0.2rem 0.65rem',
          borderRadius: 'var(--radius-full)',
          border: '1.5px solid var(--cartoon-border-color)'
        }}>
          {isOpen ? 'Close' : 'Calendar'}
        </span>
      </button>

      {/* Popover Cartoon Calendar Modal */}
      {isOpen && (
        <>
          <div 
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 150 }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: 0,
              right: 0,
              zIndex: 160,
              background: '#FFFDF5',
              border: 'var(--cartoon-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-cartoon-lg)',
              padding: '1.25rem',
              maxWidth: '380px',
              margin: '0 auto',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            {/* Header: Month and Year controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={prevMonth}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-full)',
                  border: '2.5px solid var(--cartoon-border-color)',
                  background: '#FEF08A',
                  boxShadow: '2px 2px 0px var(--cartoon-border-color)',
                  cursor: 'pointer',
                  fontFamily: "'Chewy', cursive",
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                &larr;
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontFamily: "'Chewy', cursive", fontSize: '1.5rem', color: 'var(--cartoon-border-color)' }}>
                  {MONTH_NAMES[viewMonth]}
                </span>
                
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  style={{
                    fontFamily: "'Chewy', cursive",
                    fontSize: '1.2rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--cartoon-border-color)',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={nextMonth}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-full)',
                  border: '2.5px solid var(--cartoon-border-color)',
                  background: '#FEF08A',
                  boxShadow: '2px 2px 0px var(--cartoon-border-color)',
                  cursor: 'pointer',
                  fontFamily: "'Chewy', cursive",
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                &rarr;
              </button>
            </div>

            {/* Days of Week Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem', textAlign: 'center' }}>
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} style={{ fontFamily: "'Chewy', cursive", fontSize: '1rem', color: 'var(--text-secondary)' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem', textAlign: 'center' }}>
              {/* Blank offset days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day buttons */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const active = isSelected(dayNum);

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleSelectDay(dayNum)}
                    style={{
                      aspectRatio: '1 / 1',
                      width: '100%',
                      borderRadius: 'var(--radius-full)',
                      border: active ? '2.5px solid var(--cartoon-border-color)' : '2px solid transparent',
                      background: active ? '#FACC15' : '#FFFFFF',
                      boxShadow: active ? '2px 3px 0px var(--cartoon-border-color)' : 'none',
                      color: 'var(--cartoon-border-color)',
                      fontFamily: "'Comic Neue', cursive",
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = '#FEF9C3';
                        e.currentTarget.style.border = '2px solid var(--cartoon-border-color)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.border = '2px solid transparent';
                        e.currentTarget.style.transform = 'translateY(0px)';
                      }
                    }}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Bottom bar */}
            {value && (
              <div style={{ 
                marginTop: '1rem', 
                borderTop: '2px dashed var(--border-subtle)', 
                paddingTop: '0.75rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Selected: <strong>{formatDisplayDate(value)}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
                >
                  <CheckIcon size={13} /> Done
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CartoonCalendar;
