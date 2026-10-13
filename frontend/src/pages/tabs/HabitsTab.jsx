import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { 
  ActivityIcon, FlameIcon, CheckIcon, PlusIcon, 
  TrashIcon, UsersIcon, ChevronLeftIcon, ChevronRightIcon,
  ClockIcon, LockIcon, MessageHeartIcon, SparklesIcon
} from '../../components/Icons';

// Preset color trios (Good, Average, Worst)
const COLOR_PRESETS = [
  { id: 'traffic', label: 'Classic', good: '#10B981', average: '#FBBF24', worst: '#F87171' },
  { id: 'pastel', label: 'Pastel Couple', good: '#34D399', average: '#FDE047', worst: '#FB7185' },
  { id: 'ocean', label: 'Sky & Ocean', good: '#0284C7', average: '#38BDF8', worst: '#94A3B8' },
  { id: 'sunset', label: 'Sunset Glow', good: '#F97316', average: '#FBBF24', worst: '#A8A29E' },
  { id: 'violet', label: 'Lilac Dream', good: '#9333EA', average: '#C084FC', worst: '#CBD5E1' },
];

const HabitsTab = () => {
  const { 
    room, 
    effectiveMyGender,
    effectivePartnerGender,
    effectiveMyPetName,
    effectivePartnerPetName 
  } = useContext(AuthContext);

  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reliable local date calculation (No timezone skew!)
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const currentMonthStr = `${curYear}-${curMonth < 10 ? '0' + curMonth : curMonth}`;
  const curDay = now.getDate();
  const todayDateStr = `${currentMonthStr}-${curDay < 10 ? '0' + curDay : curDay}`;

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const isViewingCurrentMonth = selectedMonth === currentMonthStr;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  
  const [activeHabitForLog, setActiveHabitForLog] = useState(null);
  const [activeDateForLog, setActiveDateForLog] = useState('');
  const [activeViewLog, setActiveViewLog] = useState(null);
  const [activeHabitForComments, setActiveHabitForComments] = useState(null);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(false);
  
  // Daily check-in form states
  const [logPerformance, setLogPerformance] = useState('good'); // 'good' | 'average' | 'worst'
  const [logMinutes, setLogMinutes] = useState(30);
  const [logNote, setLogNote] = useState('');

  // New Habit Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Daily Habit');
  const [newStartDate, setNewStartDate] = useState(todayDateStr);
  
  // Default end date: 21 days from today
  const defaultEndDateObj = new Date();
  defaultEndDateObj.setDate(defaultEndDateObj.getDate() + 20);
  const defaultEndYear = defaultEndDateObj.getFullYear();
  const defaultEndMonth = defaultEndDateObj.getMonth() + 1;
  const defaultEndDay = defaultEndDateObj.getDate();
  const defaultEndStr = `${defaultEndYear}-${defaultEndMonth < 10 ? '0' + defaultEndMonth : defaultEndMonth}-${defaultEndDay < 10 ? '0' + defaultEndDay : defaultEndDay}`;
  
  const [newEndDate, setNewEndDate] = useState(defaultEndStr);
  const [colorGood, setColorGood] = useState('#10B981');
  const [colorAverage, setColorAverage] = useState('#FBBF24');
  const [colorWorst, setColorWorst] = useState('#F87171');
  const [submittingHabit, setSubmittingHabit] = useState(false);

  // Fetch habits for selected month
  const fetchHabits = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`habits/?month=${selectedMonth}`);
      setHabits(res.data);
    } catch (err) {
      console.error('Failed to fetch habits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [selectedMonth]);

  // Reliable Month Navigation (Deterministic integer math)
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevMonthStr = prevMonth < 10 ? `0${prevMonth}` : `${prevMonth}`;
    setSelectedMonth(`${prevYear}-${prevMonthStr}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const nextMonthStr = nextMonth < 10 ? `0${nextMonth}` : `${nextMonth}`;
    setSelectedMonth(`${nextYear}-${nextMonthStr}`);
  };

  const formatMonthTitle = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Helper for quick duration target buttons in create form
  const setTargetDurationDays = (days) => {
    const start = new Date(newStartDate + 'T00:00:00');
    start.setDate(start.getDate() + (days - 1));
    const y = start.getFullYear();
    const m = start.getMonth() + 1;
    const d = start.getDate();
    setNewEndDate(`${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`);
  };

  // Apply a preset color palette
  const applyColorPreset = (preset) => {
    setColorGood(preset.good);
    setColorAverage(preset.average);
    setColorWorst(preset.worst);
  };

  // Days in selected month for grid
  const getDaysInMonth = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    const numDays = new Date(year, month, 0).getDate();
    const days = [];
    for (let day = 1; day <= numDays; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateStr = `${monthStr}-${dayStr}`;
      const dayOfWeek = new Date(year, month - 1, day).getDay(); // 0 is Sunday
      days.push({
        dayNumber: day,
        dateStr,
        dayOfWeek: (dayOfWeek + 6) % 7 // Convert to 0=Mon ... 6=Sun
      });
    }
    return days;
  };

  const daysInMonth = getDaysInMonth(selectedMonth);

  // Cell Click:
  // - If today on own habit: allow logging/editing!
  // - If past day with log: view record!
  const handleCellClick = (habit, dateStr) => {
    const existingLog = habit.logs?.find(l => l.date === dateStr);
    
    if (dateStr === todayDateStr && habit.is_mine) {
      setActiveHabitForLog(habit);
      setActiveDateForLog(dateStr);
      setLogPerformance(existingLog ? existingLog.performance : 'good');
      setLogMinutes(existingLog ? existingLog.minutes_or_count : 30);
      setLogNote(existingLog ? existingLog.note : '');
      setShowLogModal(true);
    } else if (existingLog) {
      setActiveHabitForLog(habit);
      setActiveDateForLog(dateStr);
      setActiveViewLog(existingLog);
      setShowViewModal(true);
    }
  };

  // Open Log Modal directly for Today
  const handleOpenTodayLog = (habit) => {
    if (!habit.is_mine) return;
    const existingLog = habit.logs?.find(l => l.date === todayDateStr);
    setActiveHabitForLog(habit);
    setActiveDateForLog(todayDateStr);
    setLogPerformance(existingLog ? existingLog.performance : 'good');
    setLogMinutes(existingLog ? existingLog.minutes_or_count : 30);
    setLogNote(existingLog ? existingLog.note : '');
    setShowLogModal(true);
  };

  // Open Comments Modal
  const handleOpenComments = (habit) => {
    setActiveHabitForComments(habit);
    setShowCommentsModal(true);
  };

  // Save Log for Today
  const handleSaveLog = async (e) => {
    e.preventDefault();
    if (!activeHabitForLog || activeDateForLog !== todayDateStr) return;
    try {
      const levelMap = { good: 3, average: 2, worst: 1 };
      const res = await axiosInstance.post(`habits/${activeHabitForLog.id}/log-day/`, {
        date: todayDateStr,
        performance: logPerformance,
        level: levelMap[logPerformance] || 2,
        minutes_or_count: logMinutes,
        note: logNote
      });
      setHabits(prev => prev.map(h => h.id === activeHabitForLog.id ? res.data : h));
      setShowLogModal(false);
    } catch (err) {
      console.error('Failed to save log:', err);
      alert(err.response?.data?.error || 'Failed to save log.');
    }
  };

  // Create Habit
  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmittingHabit(true);
    try {
      const res = await axiosInstance.post('habits/', {
        title: newTitle.trim(),
        category: newCategory.trim() || 'Daily Habit',
        month: selectedMonth,
        start_date: newStartDate,
        end_date: newEndDate,
        color_good: colorGood,
        color_average: colorAverage,
        color_worst: colorWorst,
        color: 'green'
      });
      setHabits(prev => [...prev, res.data]);
      setNewTitle('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create habit:', err);
      alert('Failed to create habit. Please verify dates.');
    } finally {
      setSubmittingHabit(false);
    }
  };

  // Delete Habit
  const handlePromptDelete = (habit) => {
    setHabitToDelete(habit);
  };

  const handleConfirmDelete = async () => {
    if (!habitToDelete) return;
    setDeletingHabit(true);
    try {
      await axiosInstance.delete(`habits/${habitToDelete.id}/`);
      setHabits(prev => prev.filter(h => h.id !== habitToDelete.id));
      setHabitToDelete(null);
    } catch (err) {
      console.error('Failed to delete habit:', err);
      alert('Could not delete habit calendar. Please try again.');
    } finally {
      setDeletingHabit(false);
    }
  };

  // Split into My Habits and Partner's Habits
  const myHabits = habits.filter(h => h.is_mine);
  const partnerHabits = habits.filter(h => !h.is_mine);

  // Resolved Genders & Names (She/He and Pet Names)
  const myGender = effectiveMyGender || 'girl';
  const partnerGender = effectivePartnerGender || 'boy';
  const myDisplayName = effectiveMyPetName ? effectiveMyPetName : 'My Habits';
  const partnerDisplayName = effectivePartnerPetName ? `${effectivePartnerPetName}'s Habits` : "Partner's Habits";

  return (
    <div className="habits-minimal-page">
      {/* 1. Minimal Top Control Bar */}
      <div className="habits-minimal-bar">
        <div className="habits-bar-left">
          <h1 className="habits-bar-title">Habits</h1>
          
          <div className="month-switcher-pill">
            <button 
              type="button" 
              className="month-nav-arrow" 
              onClick={handlePrevMonth}
              title="Previous Month"
            >
              <ChevronLeftIcon size={14} />
            </button>
            
            <span className="month-nav-text">{formatMonthTitle(selectedMonth)}</span>
            
            <button 
              type="button" 
              className="month-nav-arrow" 
              onClick={handleNextMonth}
              title="Next Month"
            >
              <ChevronRightIcon size={14} />
            </button>

            {!isViewingCurrentMonth && (
              <button 
                type="button" 
                className="month-today-chip" 
                onClick={() => setSelectedMonth(currentMonthStr)}
                title="Jump to current month"
              >
                Today
              </button>
            )}
          </div>

          {!isViewingCurrentMonth && (
            <span className="view-only-badge">
              <LockIcon size={12} /> View Only
            </span>
          )}
        </div>

        <button 
          type="button" 
          className="btn-minimal-add"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon size={15} />
          <span>New Habit</span>
        </button>
      </div>

      {/* 2. Side-by-Side Couple Habit Columns */}
      <div className="habits-minimal-columns">
        {/* ================= LEFT SIDE: MY HABITS ================= */}
        <div className="habit-col-wrapper">
          <div className="col-header-row">
            <div className="col-user-pill">
              <span className={`col-dot ${myGender}`} />
              <span className="col-name">{myDisplayName}</span>
              <span className="col-gender-label">
                ({myGender === 'girl' ? 'She' : myGender === 'boy' ? 'He' : 'Me'})
              </span>
            </div>
            <span className="col-count-text">
              {myHabits.length} {myHabits.length === 1 ? 'target' : 'targets'}
            </span>
          </div>

          {loading ? (
            <div className="col-loading-state">Loading habits...</div>
          ) : myHabits.length === 0 ? (
            <div className="col-empty-box">
              <ActivityIcon size={24} />
              <p>No habits for {formatMonthTitle(selectedMonth)}</p>
              <button 
                type="button" 
                className="btn-ghost-add"
                onClick={() => setShowAddModal(true)}
              >
                + Create a target
              </button>
            </div>
          ) : (
            <div className="habits-card-stack">
              {myHabits.map((habit) => (
                <HabitCard 
                  key={habit.id}
                  habit={habit}
                  daysInMonth={daysInMonth}
                  todayDateStr={todayDateStr}
                  isViewingCurrentMonth={isViewingCurrentMonth}
                  onCellClick={handleCellClick}
                  onOpenTodayLog={handleOpenTodayLog}
                  onOpenComments={handleOpenComments}
                  onDelete={handlePromptDelete}
                  isMine={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* ================= RIGHT SIDE: PARTNER'S HABITS ================= */}
        <div className="habit-col-wrapper">
          <div className="col-header-row">
            <div className="col-user-pill">
              <span className={`col-dot ${partnerGender}`} />
              <span className="col-name">{partnerDisplayName}</span>
              <span className="col-gender-label">
                ({partnerGender === 'boy' ? 'He' : partnerGender === 'girl' ? 'She' : 'Partner'})
              </span>
            </div>
            <span className="col-count-text">
              {partnerHabits.length} {partnerHabits.length === 1 ? 'target' : 'targets'}
            </span>
          </div>

          {loading ? (
            <div className="col-loading-state">Loading partner habits...</div>
          ) : !room?.partner ? (
            <div className="col-empty-box">
              <UsersIcon size={24} />
              <p>Waiting for partner to join</p>
              <span className="col-empty-sub">Share room code <strong>{room?.code}</strong> to sync habits!</span>
            </div>
          ) : partnerHabits.length === 0 ? (
            <div className="col-empty-box">
              <ActivityIcon size={24} />
              <p>{partnerDisplayName} hasn't added targets yet</p>
            </div>
          ) : (
            <div className="habits-card-stack">
              {partnerHabits.map((habit) => (
                <HabitCard 
                  key={habit.id}
                  habit={habit}
                  daysInMonth={daysInMonth}
                  todayDateStr={todayDateStr}
                  isViewingCurrentMonth={isViewingCurrentMonth}
                  onCellClick={handleCellClick}
                  onOpenTodayLog={handleOpenTodayLog}
                  onOpenComments={handleOpenComments}
                  onDelete={handlePromptDelete}
                  isMine={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. New Habit Creation Modal (Time Period & Custom Good/Average/Worst Colors) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content modal-habit-create" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <SparklesIcon size={18} />
                <h3 style={{ margin: 0, fontFamily: "'Chewy', cursive", fontSize: '1.45rem' }}>
                  Create a New Habit
                </h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleCreateHabit}>
              {/* 1. Habit Title */}
              <div className="form-group">
                <label className="form-label">What habit do you need to create?</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Read 20 mins, Morning Run, Hydration..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {/* 2. Category Tag */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <div className="category-chips-row">
                  {['Daily Routine', 'Fitness', 'Reading', 'Self-Care', 'Couple Goal'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`cat-chip ${newCategory === cat ? 'active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Time Period (From Which Date to Which Date) */}
              <div className="form-group">
                <label className="form-label">Time Period (Target Duration)</label>
                <div className="duration-presets-row">
                  <button type="button" className="btn-preset-chip" onClick={() => setTargetDurationDays(7)}>7 Days</button>
                  <button type="button" className="btn-preset-chip" onClick={() => setTargetDurationDays(14)}>14 Days</button>
                  <button type="button" className="btn-preset-chip" onClick={() => setTargetDurationDays(21)}>21 Days</button>
                  <button type="button" className="btn-preset-chip" onClick={() => setTargetDurationDays(30)}>30 Days</button>
                </div>
                
                <div className="date-range-row">
                  <div className="date-field">
                    <span className="date-field-label">From Date:</span>
                    <input
                      type="date"
                      className="form-input"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="date-field">
                    <span className="date-field-label">To Date:</span>
                    <input
                      type="date"
                      className="form-input"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 4. Performance Colors (Good, Average, Worst) */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Performance Day Colors
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Good &bull; Average &bull; Worst</span>
                </div>

                {/* Preset Palettes */}
                <div className="color-palette-presets">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="palette-preset-btn"
                      onClick={() => applyColorPreset(p)}
                      title={p.label}
                    >
                      <span className="palette-tri-dot" style={{ background: p.good }} />
                      <span className="palette-tri-dot" style={{ background: p.average }} />
                      <span className="palette-tri-dot" style={{ background: p.worst }} />
                      <span className="palette-label">{p.label}</span>
                    </button>
                  ))}
                </div>

                {/* Individual Color Pickers */}
                <div className="perf-colors-grid">
                  <div className="perf-color-item">
                    <span className="perf-dot" style={{ background: colorGood }} />
                    <div className="perf-info">
                      <span className="perf-title">Good Performance</span>
                      <span className="perf-sub">High focus & target met</span>
                    </div>
                    <input
                      type="color"
                      className="color-picker-input"
                      value={colorGood}
                      onChange={(e) => setColorGood(e.target.value)}
                      title="Pick Good Day Color"
                    />
                  </div>

                  <div className="perf-color-item">
                    <span className="perf-dot" style={{ background: colorAverage }} />
                    <div className="perf-info">
                      <span className="perf-title">Average Performance</span>
                      <span className="perf-sub">Moderate / satisfactory focus</span>
                    </div>
                    <input
                      type="color"
                      className="color-picker-input"
                      value={colorAverage}
                      onChange={(e) => setColorAverage(e.target.value)}
                      title="Pick Average Day Color"
                    />
                  </div>

                  <div className="perf-color-item">
                    <span className="perf-dot" style={{ background: colorWorst }} />
                    <div className="perf-info">
                      <span className="perf-title">Worst Performance</span>
                      <span className="perf-sub">Low focus / struggled</span>
                    </div>
                    <input
                      type="color"
                      className="color-picker-input"
                      value={colorWorst}
                      onChange={(e) => setColorWorst(e.target.value)}
                      title="Pick Worst Day Color"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.25rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  disabled={submittingHabit}
                  style={{ flex: 2 }}
                >
                  {submittingHabit ? 'Creating...' : 'Start Habit Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit Day Log Modal (STRICTLY FOR TODAY ONLY, with Good/Average/Worst & Comments) */}
      {showLogModal && activeHabitForLog && activeDateForLog === todayDateStr && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-content modal-minimal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontFamily: "'Chewy', cursive", fontSize: '1.35rem' }}>
                  {activeHabitForLog.title}
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
                  Today &bull; {todayDateStr}
                </span>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowLogModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSaveLog}>
              {/* Performance Selection */}
              <div className="form-group">
                <label className="form-label">How was your performance today?</label>
                <div className="perf-choice-row">
                  <button
                    type="button"
                    className={`perf-choice-card good ${logPerformance === 'good' ? 'active' : ''}`}
                    onClick={() => setLogPerformance('good')}
                    style={logPerformance === 'good' ? { borderColor: activeHabitForLog.color_good || '#10B981' } : {}}
                  >
                    <span className="perf-choice-indicator" style={{ background: activeHabitForLog.color_good || '#10B981' }} />
                    <span className="perf-choice-name">Good</span>
                    <span className="perf-choice-desc">High focus!</span>
                  </button>

                  <button
                    type="button"
                    className={`perf-choice-card average ${logPerformance === 'average' ? 'active' : ''}`}
                    onClick={() => setLogPerformance('average')}
                    style={logPerformance === 'average' ? { borderColor: activeHabitForLog.color_average || '#FBBF24' } : {}}
                  >
                    <span className="perf-choice-indicator" style={{ background: activeHabitForLog.color_average || '#FBBF24' }} />
                    <span className="perf-choice-name">Average</span>
                    <span className="perf-choice-desc">Moderate</span>
                  </button>

                  <button
                    type="button"
                    className={`perf-choice-card worst ${logPerformance === 'worst' ? 'active' : ''}`}
                    onClick={() => setLogPerformance('worst')}
                    style={logPerformance === 'worst' ? { borderColor: activeHabitForLog.color_worst || '#F87171' } : {}}
                  >
                    <span className="perf-choice-indicator" style={{ background: activeHabitForLog.color_worst || '#F87171' }} />
                    <span className="perf-choice-name">Worst</span>
                    <span className="perf-choice-desc">Low focus</span>
                  </button>
                </div>
              </div>

              {/* Time spent */}
              <div className="form-group">
                <label className="form-label">Time Focused</label>
                <div className="duration-quick-row">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      className={`btn-time-chip ${logMinutes === mins ? 'active' : ''}`}
                      onClick={() => setLogMinutes(mins)}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Comment / Reflection */}
              <div className="form-group">
                <label className="form-label">Today's Comment / Thoughts (Visible to Partner)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Share a reflection, milestone, or feeling about today's habit..."
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.15rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowLogModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  style={{ flex: 2 }}
                >
                  Save Today Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Read-Only Day Record View Modal */}
      {showViewModal && activeHabitForLog && activeViewLog && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content modal-minimal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontFamily: "'Chewy', cursive", fontSize: '1.35rem' }}>
                  {activeHabitForLog.title}
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {activeDateForLog}
                </span>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowViewModal(false)}>&times;</button>
            </div>

            <div style={{ padding: '0.5rem 0' }}>
              <div className="view-log-pill">
                <span 
                  className="perf-dot" 
                  style={{ 
                    background: activeViewLog.performance === 'good' 
                      ? (activeHabitForLog.color_good || '#10B981')
                      : activeViewLog.performance === 'average'
                      ? (activeHabitForLog.color_average || '#FBBF24')
                      : (activeHabitForLog.color_worst || '#F87171')
                  }} 
                />
                <span>
                  Performance: <strong style={{ textTransform: 'capitalize' }}>{activeViewLog.performance}</strong> &bull; {activeViewLog.minutes_or_count}m
                </span>
              </div>

              {activeViewLog.note ? (
                <div className="view-log-note">
                  <span className="note-label">Comment:</span>
                  <p>{activeViewLog.note}</p>
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>
                  No comment was entered for this day.
                </p>
              )}

              <div className="view-only-notice">
                <LockIcon size={13} />
                <span>Past records are view-only to keep streaks authentic!</span>
              </div>
            </div>

            <button 
              type="button" 
              className="btn btn-outline btn-block btn-sm"
              onClick={() => setShowViewModal(false)}
              style={{ marginTop: '0.85rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 6. All Daily Comments / Journal Drawer Modal (Partner Visibility) */}
      {showCommentsModal && activeHabitForComments && (
        <div className="modal-overlay" onClick={() => setShowCommentsModal(false)}>
          <div className="modal-content modal-minimal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontFamily: "'Chewy', cursive", fontSize: '1.45rem' }}>
                  Daily Comments & Journal
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {activeHabitForComments.title} ({activeHabitForComments.is_mine ? 'My Comments' : 'Partner Comments'})
                </span>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowCommentsModal(false)}>&times;</button>
            </div>

            <div style={{ overflowY: 'auto', padding: '0.5rem 0', flex: 1 }}>
              {(!activeHabitForComments.comments || activeHabitForComments.comments.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  <MessageHeartIcon size={32} />
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>No comments recorded yet for this habit.</p>
                </div>
              ) : (
                <div className="comments-stream">
                  {activeHabitForComments.comments.map((c) => (
                    <div key={c.id || c.date} className="comment-bubble-card">
                      <div className="comment-bubble-header">
                        <span className="comment-date">{c.date}</span>
                        <span 
                          className="comment-perf-tag"
                          style={{
                            background: c.performance === 'good' 
                              ? (activeHabitForComments.color_good || '#10B981')
                              : c.performance === 'average'
                              ? (activeHabitForComments.color_average || '#FBBF24')
                              : (activeHabitForComments.color_worst || '#F87171'),
                            color: '#FFFFFF'
                          }}
                        >
                          {c.performance} &bull; {c.minutes_or_count}m
                        </span>
                      </div>
                      <p className="comment-text">{c.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="button" 
              className="btn btn-outline btn-block btn-sm"
              onClick={() => setShowCommentsModal(false)}
              style={{ marginTop: '1rem' }}
            >
              Done Reading
            </button>
          </div>
        </div>
      )}

      {/* 5. Delete Habit Calendar Confirmation Modal */}
      {habitToDelete && (
        <div className="modal-overlay" onClick={() => !deletingHabit && setHabitToDelete(null)}>
          <div className="modal-content modal-minimal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
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

            <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: "'Chewy', cursive", fontSize: '1.45rem', color: 'var(--cartoon-border-color)' }}>
              Delete Habit Calendar?
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 1.25rem 0', lineHeight: 1.4 }}>
              Are you sure you want to delete <strong>"{habitToDelete.title}"</strong>? All logged days, comments, and streaks for this habit will be permanently deleted.
            </p>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                onClick={() => setHabitToDelete(null)}
                disabled={deletingHabit}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger btn-sm" 
                onClick={handleConfirmDelete}
                disabled={deletingHabit}
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
                {deletingHabit ? 'Deleting...' : 'Yes, Delete Calendar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= HABIT CARD COMPONENT (ACTIVE GRID vs FINISHED WIDGET) =================
const HabitCard = ({ 
  habit, 
  daysInMonth, 
  todayDateStr, 
  isViewingCurrentMonth, 
  onCellClick, 
  onOpenTodayLog, 
  onOpenComments,
  onDelete, 
  isMine 
}) => {
  const [showCalendarOverride, setShowCalendarOverride] = useState(false);

  const logMap = {};
  habit.logs?.forEach(l => {
    logMap[l.date] = l;
  });

  const todayLog = logMap[todayDateStr];
  const isDoneToday = todayLog && todayLog.level > 0;

  // Custom colors or fallbacks
  const cGood = habit.color_good || '#10B981';
  const cAverage = habit.color_average || '#FBBF24';
  const cWorst = habit.color_worst || '#F87171';

  // Helper to determine day cell color based on performance
  const getCellColor = (dateStr) => {
    const entry = logMap[dateStr];
    if (!entry || entry.level === 0) return '#EBEDF0'; // default neutral gray
    if (entry.performance === 'good') return cGood;
    if (entry.performance === 'average') return cAverage;
    if (entry.performance === 'worst') return cWorst;
    if (entry.level >= 3) return cGood;
    if (entry.level === 2) return cAverage;
    return cWorst;
  };

  const getCellTooltip = (dateStr, dayNum) => {
    const isToday = dateStr === todayDateStr;
    const entry = logMap[dateStr];

    if (isToday) {
      if (entry && entry.level > 0) {
        return `Today (Day ${dayNum}) · ${entry.performance?.toUpperCase()} (${entry.minutes_or_count}m)${entry.note ? ` - "${entry.note}"` : ''} · Click to edit`;
      }
      return `Today (Day ${dayNum}) · Click to log focus!`;
    }

    if (entry && entry.level > 0) {
      return `Day ${dayNum} · ${entry.performance?.toUpperCase()} (${entry.minutes_or_count}m)${entry.note ? ` - "${entry.note}"` : ''} · View record`;
    }

    return `Day ${dayNum} · Past day (View only)`;
  };

  // Pad first row with empty spaces for starting weekday (Mon-Sun)
  const firstDayWeekday = daysInMonth[0]?.dayOfWeek || 0;
  const paddingCells = Array.from({ length: firstDayWeekday });

  const hasComments = habit.comments && habit.comments.length > 0;

  return (
    <div className="habit-minimal-card">
      {/* Top Header: Title, Target Dates, Streak & Actions */}
      <div className="habit-card-top-minimal">
        <div className="habit-title-group">
          <span className="habit-dot" style={{ background: cGood }} />
          <div>
            <h3 className="habit-title-text">{habit.title}</h3>
            <span className="habit-cat-label">
              {habit.category} &bull; {habit.start_date && habit.end_date ? `${habit.start_date} to ${habit.end_date}` : 'Target Habit'}
            </span>
          </div>
        </div>

        <div className="habit-card-actions">
          {habit.streak > 0 && !habit.is_finished && (
            <span className="streak-chip" title={`${habit.streak} day streak!`}>
              <FlameIcon size={12} />
              <span>{habit.streak}d</span>
            </span>
          )}

          {/* Quick Comments Button (Allows reading both partners' reflections) */}
          <button
            type="button"
            className="comment-toggle-btn"
            onClick={() => onOpenComments(habit)}
            title="Read all daily comments & reflections"
          >
            💬 {habit.comments?.length || 0}
          </button>

          {/* Quick Today Action - ONLY active in current month on active habit */}
          {isMine && isViewingCurrentMonth && !habit.is_finished && (
            <button
              type="button"
              className={`today-quick-chip ${isDoneToday ? 'done' : ''}`}
              onClick={() => onOpenTodayLog(habit)}
              title={isDoneToday ? `Done today: ${todayLog.minutes_or_count}m (${todayLog.performance})` : 'Log activity for today'}
              style={isDoneToday ? { background: getCellColor(todayDateStr), color: '#FFFFFF', borderColor: 'transparent' } : {}}
            >
              {isDoneToday ? `✓ ${todayLog.performance}` : '+ Today'}
            </button>
          )}

          {/* Active Delete Option for all calendars */}
          <button 
            type="button" 
            className="habit-delete-chip"
            onClick={() => onDelete(habit)}
            title="Delete this habit calendar"
          >
            <TrashIcon size={12} />
            <span className="del-label">Delete</span>
          </button>
        </div>
      </div>

      {/* ================= CONDITION 1: HABIT FINISHED / COMPLETED ================= */}
      {habit.is_finished && !showCalendarOverride ? (
        <div className="habit-finished-widget">
          <div className="finished-banner">
            <span className="finished-badge">🎉 Completed this target & habit!</span>
            <span className="finished-dates">
              Target Period: <strong>{habit.start_date}</strong> to <strong>{habit.end_date}</strong>
            </span>
          </div>

          {/* Performance Breakdown Widget (Good, Average, Worst Days) */}
          <div className="finished-stats-grid">
            <div className="stat-card good" style={{ borderColor: cGood }}>
              <span className="stat-count" style={{ color: cGood }}>{habit.good_days_count || 0}</span>
              <span className="stat-label">Good Days</span>
            </div>

            <div className="stat-card average" style={{ borderColor: cAverage }}>
              <span className="stat-count" style={{ color: cAverage }}>{habit.average_days_count || 0}</span>
              <span className="stat-label">Average Days</span>
            </div>

            <div className="stat-card worst" style={{ borderColor: cWorst }}>
              <span className="stat-count" style={{ color: cWorst }}>{habit.worst_days_count || 0}</span>
              <span className="stat-label">Worst Days</span>
            </div>
          </div>

          <div className="finished-footer-row">
            <span className="completion-rate-text">
              Logged {habit.completion_count || 0} of {habit.total_target_days || 0} target days
            </span>
            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
              <button 
                type="button" 
                className="btn-peek-cal"
                onClick={() => onOpenComments(habit)}
              >
                Read Journal
              </button>
              <button 
                type="button" 
                className="btn-peek-cal"
                onClick={() => setShowCalendarOverride(true)}
              >
                View Grid
              </button>
              <button 
                type="button" 
                className="btn-peek-cal btn-peek-del"
                onClick={() => onDelete(habit)}
                title="Delete this completed calendar"
              >
                <TrashIcon size={11} /> Delete
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= CONDITION 2: ACTIVE HABIT CALENDAR GRID ================= */
        <div className="github-tracker-minimal">
          {habit.is_finished && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', fontSize: '0.74rem' }}>
              <span style={{ color: '#059669', fontWeight: 700 }}>✓ Target Finished</span>
              <button 
                type="button" 
                onClick={() => setShowCalendarOverride(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700 }}
              >
                Hide Grid
              </button>
            </div>
          )}

          <div className="weekday-row-minimal">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="github-grid-minimal">
            {/* Leading padding cells for day alignment */}
            {paddingCells.map((_, idx) => (
              <div key={`pad-${idx}`} className="grid-cell-min empty-pad" />
            ))}

            {/* Month Days */}
            {daysInMonth.map((day) => {
              const color = getCellColor(day.dateStr);
              const isToday = day.dateStr === todayDateStr;
              const hasLog = logMap[day.dateStr] && logMap[day.dateStr].level > 0;
              const tooltip = getCellTooltip(day.dateStr, day.dayNumber);

              const isClickable = (isToday && isMine && !habit.is_finished) || hasLog;

              return (
                <div
                  key={day.dateStr}
                  className={`grid-cell-min ${isToday ? 'is-today' : ''} ${isClickable ? 'clickable' : ''}`}
                  style={{ background: color }}
                  title={tooltip}
                  onClick={() => onCellClick(habit, day.dateStr)}
                >
                  {isToday && <span className="today-dot-indicator" />}
                </div>
              );
            })}
          </div>

          {/* Minimal Footer: Completion counter + 3-Color Performance Legend */}
          <div className="habit-footer-minimal" style={{ marginTop: '0.65rem' }}>
            <span className="completion-text">
              {habit.completion_count} of {daysInMonth.length} days
            </span>

            <div className="perf-legend-row">
              <span className="perf-legend-item">
                <span className="legend-sq" style={{ background: cGood }} /> Good
              </span>
              <span className="perf-legend-item">
                <span className="legend-sq" style={{ background: cAverage }} /> Avg
              </span>
              <span className="perf-legend-item">
                <span className="legend-sq" style={{ background: cWorst }} /> Worst
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitsTab;
