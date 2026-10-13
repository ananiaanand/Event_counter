import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  HeartIcon, CopyIcon, CheckIcon, RefreshIcon, FrogRatLogo 
} from '../components/Icons';
import CartoonCalendar from '../components/CartoonCalendar';

const generateRandomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const AuthPage = () => {
  const { createRoom, joinRoom, loginWithCode } = useContext(AuthContext);
  const navigate = useNavigate();

  // Mode: 'signin' | 'join' | 'create'
  const [mode, setMode] = useState('signin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form Fields (No username or password required; security lies on the code itself!)
  const [petName, setPetName] = useState('');
  const [gender, setGender] = useState('girl'); // 'boy' | 'girl' | 'other'
  const [togethernessDate, setTogethernessDate] = useState('');
  const [loginRole, setLoginRole] = useState('creator'); // 'creator' | 'partner'

  // Create Mode Code
  const [createdCode, setCreatedCode] = useState(generateRandomCode());

  // 6-character OTP Code Boxes
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    const val = value.toUpperCase().slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto focus next input
    if (val && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRegenerateCode = () => {
    setCreatedCode(generateRandomCode());
    setCopied(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const fullCode = otp.join('').trim().toUpperCase();
        if (fullCode.length !== 6) {
          setError('Please enter your complete 6-character room code.');
          setLoading(false);
          return;
        }
        if (!togethernessDate) {
          setError('Please select your date of togetherness (anniversary date).');
          setLoading(false);
          return;
        }

        const res = await loginWithCode({
          code: fullCode,
          togetherness_date: togethernessDate,
          role: loginRole
        });

        if (res.success) {
          navigate('/');
        } else {
          setError(res.error);
        }
      } else if (mode === 'create') {
        if (!togethernessDate) {
          setError('Please select your date of togetherness.');
          setLoading(false);
          return;
        }

        const res = await createRoom({
          pet_name_for_partner: petName,
          gender,
          togetherness_date: togethernessDate,
          code: createdCode
        });

        if (res.success) {
          navigate('/');
        } else {
          setError(res.error);
        }
      } else if (mode === 'join') {
        const fullCode = otp.join('').trim().toUpperCase();
        if (fullCode.length !== 6) {
          setError('Please enter the complete 6-character room code.');
          setLoading(false);
          return;
        }
        if (!togethernessDate) {
          setError('Please pick your date of togetherness to verify access.');
          setLoading(false);
          return;
        }

        const res = await joinRoom({
          code: fullCode,
          pet_name_for_partner: petName,
          gender,
          togetherness_date: togethernessDate
        });

        if (res.success) {
          navigate('/');
        } else {
          setError(res.error);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="brand-wrapper" style={{ justifyContent: 'center', marginBottom: '0.75rem' }}>
            <FrogRatLogo size="large" />
            <span className="brand-text">
              <span className="brand-name-part">lub</span>
              <span className="brand-dot-part">.</span>
            </span>
          </div>
          <h2>Our Shared Sanctuary</h2>
          <p>
            {mode === 'signin' && 'Sign back into your room with your code and anniversary date'}
            {mode === 'join' && "Enter your partner's secret code and date of togetherness to connect"}
            {mode === 'create' && 'Create a private couple sanctuary and invite your partner'}
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setError(''); }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`auth-tab-btn ${mode === 'join' ? 'active' : ''}`}
            onClick={() => { setMode('join'); setError(''); }}
          >
            Join Partner
          </button>
          <button 
            type="button" 
            className={`auth-tab-btn ${mode === 'create' ? 'active' : ''}`}
            onClick={() => { setMode('create'); setError(''); }}
          >
            Create Room
          </button>
        </div>

        {error && (
          <div className="alert-box alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ================= SIGN IN MODE ================= */}
          {mode === 'signin' && (
            <>
              <div className="form-group" style={{ textAlign: 'center' }}>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                  Enter Your 6-Letter Room Code
                </label>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  The secret code obtained when your room was made
                </p>
                <div className="otp-container" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={`signin-otp-${idx}`}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      className="otp-box"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Signing In As</label>
                <div className="gender-selector">
                  <div 
                    className={`gender-option ${loginRole === 'creator' ? 'selected' : ''}`}
                    onClick={() => setLoginRole('creator')}
                    style={loginRole === 'creator' ? { background: 'var(--baby-yellow)', borderColor: 'var(--cartoon-border-color)' } : {}}
                  >
                    <span>Room Creator</span>
                  </div>
                  <div 
                    className={`gender-option ${loginRole === 'partner' ? 'selected' : ''}`}
                    onClick={() => setLoginRole('partner')}
                    style={loginRole === 'partner' ? { background: 'var(--baby-yellow)', borderColor: 'var(--cartoon-border-color)' } : {}}
                  >
                    <span>Partner</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Togetherness (Anniversary)</label>
                <CartoonCalendar 
                  value={togethernessDate} 
                  onChange={setTogethernessDate} 
                />
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.45rem' }}>
                  Must match the room anniversary date to gain entry.
                </p>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
                style={{ marginTop: '1.5rem' }}
              >
                {loading ? 'Verifying & Signing In...' : 'Sign In to Sanctuary'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Don't have a room yet?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('create'); setError(''); }}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--primary-color)', 
                    fontFamily: "'Chewy', cursive", 
                    fontSize: '1rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Create a Room
                </button>
              </div>
            </>
          )}

          {/* ================= JOIN PARTNER MODE ================= */}
          {mode === 'join' && (
            <>
              <div className="form-group" style={{ textAlign: 'center' }}>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>
                  Paste or Enter Partner's 6-Letter Code
                </label>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Paste anywhere or type letter by letter
                </p>
                <div className="otp-container" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={`join-otp-${idx}`}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      className="otp-box"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Gender</label>
                <div className="gender-selector">
                  <div 
                    className={`gender-option boy ${gender === 'boy' ? 'selected' : ''}`}
                    onClick={() => setGender('boy')}
                  >
                    <span>Boy</span>
                  </div>
                  <div 
                    className={`gender-option girl ${gender === 'girl' ? 'selected' : ''}`}
                    onClick={() => setGender('girl')}
                  >
                    <span>Girl</span>
                  </div>
                  <div 
                    className={`gender-option other ${gender === 'other' ? 'selected' : ''}`}
                    onClick={() => setGender('other')}
                  >
                    <span>Other</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pet Name for Your Partner</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Pet name for your partner"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Togetherness</label>
                <CartoonCalendar 
                  value={togethernessDate} 
                  onChange={setTogethernessDate} 
                />
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.45rem' }}>
                  Must match the exact anniversary date set by the room creator to gain entry.
                </p>
              </div>

              <button 
                type="submit" 
                className={`btn btn-block ${gender === 'boy' ? 'btn-blue' : gender === 'girl' ? 'btn-pink' : 'btn-primary'}`}
                disabled={loading}
                style={{ marginTop: '1.5rem' }}
              >
                {loading ? 'Verifying & Connecting...' : 'Join Partner Sanctuary'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Already set up?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); }}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--primary-color)', 
                    fontFamily: "'Chewy', cursive", 
                    fontSize: '1rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Sign In with Code
                </button>
              </div>
            </>
          )}

          {/* ================= CREATE ROOM MODE ================= */}
          {mode === 'create' && (
            <>
              <div className="form-group">
                <label className="form-label">Your Gender</label>
                <div className="gender-selector">
                  <div 
                    className={`gender-option boy ${gender === 'boy' ? 'selected' : ''}`}
                    onClick={() => setGender('boy')}
                  >
                    <span>Boy</span>
                  </div>
                  <div 
                    className={`gender-option girl ${gender === 'girl' ? 'selected' : ''}`}
                    onClick={() => setGender('girl')}
                  >
                    <span>Girl</span>
                  </div>
                  <div 
                    className={`gender-option other ${gender === 'other' ? 'selected' : ''}`}
                    onClick={() => setGender('other')}
                  >
                    <span>Other</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pet Name for Your Partner</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Pet name for your partner"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Togetherness</label>
                <CartoonCalendar 
                  value={togethernessDate} 
                  onChange={setTogethernessDate} 
                />
              </div>

              {/* Code Generation & Copy Section */}
              <div className="form-group" style={{ 
                background: '#FFFDF0', 
                padding: '1.25rem', 
                borderRadius: 'var(--radius-md)',
                border: 'var(--cartoon-border-sm)',
                boxShadow: 'var(--shadow-cartoon-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <label className="form-label" style={{ margin: 0, fontFamily: "'Chewy', cursive", fontSize: '1.25rem' }}>
                    Room Code for Partner
                  </label>
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm"
                    onClick={handleRegenerateCode}
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.85rem' }}
                  >
                    <RefreshIcon size={14} /> New Code
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    flex: 1, 
                    background: '#FFFFFF', 
                    padding: '0.65rem 1rem', 
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: "'Chewy', cursive",
                    fontSize: '1.75rem',
                    letterSpacing: '0.25em',
                    textAlign: 'center',
                    border: 'var(--cartoon-border-sm)',
                    boxShadow: '2px 2px 0px var(--cartoon-border-color)',
                    color: 'var(--cartoon-border-color)'
                  }}>
                    {createdCode}
                  </div>
                  <button 
                    type="button" 
                    className={`btn ${copied ? 'btn-primary' : 'btn-yellow'}`}
                    onClick={handleCopyCode}
                  >
                    {copied ? <><CheckIcon size={16} /> Copied</> : <><CopyIcon size={16} /> Copy</>}
                  </button>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.65rem' }}>
                  Share this code with your partner. Your room security relies strictly on this code and your togetherness date!
                </p>
              </div>

              <button 
                type="submit" 
                className={`btn btn-block ${gender === 'boy' ? 'btn-blue' : gender === 'girl' ? 'btn-pink' : 'btn-primary'}`}
                disabled={loading}
                style={{ marginTop: '1.25rem' }}
              >
                {loading ? 'Creating Sanctuary...' : 'Create Room & Enter'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Already have a room code?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); }}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--primary-color)', 
                    fontFamily: "'Chewy', cursive", 
                    fontSize: '1rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Sign In with Code
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
