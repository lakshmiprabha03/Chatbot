import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // Adjust path if your AuthContext is elsewhere

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { login, token, user, loading: authLoading } = useAuth();  // From AuthContext
  const navigate = useNavigate();

  // Debug: Log renders
  console.log('🔥 DEBUG: Render - AuthContext available?', !!useAuth, 'Token?', !!token, 'User  ?', !!user, 'Auth loading?', authLoading);

  // Helper: Validate email format
  const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Helper: Button disabled logic
  const isButtonDisabled = (): boolean => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const reasons: string[] = [];
    if (!trimmedEmail) reasons.push('No email');
    else if (!isValidEmail(trimmedEmail)) reasons.push('Invalid email');
    if (!trimmedPassword) reasons.push('No password');
    else if (trimmedPassword.length < 6) reasons.push('Password too short');
    const disabled = reasons.length > 0 || loading || authLoading;
    console.log('🔥 DEBUG: Render - Button disabled?', disabled, 'Reasons:', reasons, 'Email len:', trimmedEmail.length, 'Password len:', trimmedPassword.length);
    return disabled;
  };

  // Email change handler (with log)
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setError('');  // Clear error on type
    console.log('🔥 DEBUG: Email changed to:', newEmail, '(length:', newEmail.length, ')');
  };

  // Password change handler (with log)
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setError('');  // Clear error on type
    console.log('🔥 DEBUG: Password length changed to:', newPassword.length);
  };

  // Enhanced KeyDown: Prevent Enter submit + trigger login if valid
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();  // Extra: Stop bubbling
      console.log('🔥 DEBUG: Enter pressed - Prevented submit, checking if valid...');
      if (!isButtonDisabled()) {
        handleLoginClick();
      } else {
        console.log('🔥 DEBUG: Enter ignored - Button disabled');
      }
    }
  };

  // Main handler: No alert, full steps with logs + extra click confirmation
  const handleLoginClick = async (): Promise<void> => {
    console.log('🔥 DEBUG: Button onClick fired! Starting handleLoginClick...');  // NEW: Confirms click
    console.log('🔥 DEBUG: === ALERT SPOT REACHED - Handler fully started (no popup)! ===');
    console.log('🔥 DEBUG: === handleLoginClick STARTED - Button clicked! ===');

    try {
      // Step 1: Trim inputs
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      console.log('🔥 DEBUG: Step 1 - Email Trimmed:', trimmedEmail, 'Length:', trimmedEmail.length);
      console.log('🔥 DEBUG: Step 1 - Password Trimmed length:', trimmedPassword.length);

      // Step 2: Validate
      if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
        throw new Error('Invalid email format');
      }
      if (!trimmedPassword || trimmedPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      console.log('🔥 DEBUG: Step 2 - Validation PASSED');

      // Step 3: Set loading
      setLoading(true);
      setError('');
      console.log('🔥 DEBUG: Step 3 - Loading set to true - UI should update now');

      // Step 4: Call AuthContext login
      console.log('🔥 DEBUG: Step 4 - Calling AuthContext login...');
      if (typeof login !== 'function') {
        throw new Error('AuthContext login function not available');
      }
      console.log('🔥 DEBUG: Step 4 - login function type?', typeof login);
      console.log('🔥 DEBUG: Step 4 - About to call login with email:', trimmedEmail);
      const response = await login(trimmedEmail, trimmedPassword);
      console.log('🔥 DEBUG: Step 5 - login() succeeded - Response processed:', response);
      console.log('🔥 DEBUG: Step 5 - After login call - token state:', !!token, 'user state:', !!user);

      // Step 5: Immediate check after login (for timing)
      console.log('🔥 DEBUG: Step 5 - Immediate check after login: Token?', !!token, 'User  ?', !!user);

      // Step 6: Check immediate redirect
      console.log('🔥 DEBUG: Step 6 - Checking immediate state for redirect');
      console.log('🔥 DEBUG: Step 6 - Current token:', token);
      console.log('🔥 DEBUG: Step 6 - Current user:', user);
      console.log('🔥 DEBUG: Step 6 - localStorage token:', localStorage.getItem('token'));
      
      // Step 7: Fallback wait for state update (timing fix)
      console.log('🔥 DEBUG: Step 7 - Setting up fallback check in 500ms...');
      setTimeout(() => {
        const currentToken = localStorage.getItem('token');
        console.log('🔥 DEBUG: Fallback check - User?', !!user, 'Token state?', !!token, 'localStorage token?', !!currentToken, 'Path:', window.location.pathname);
        if (currentToken) {
          console.log('🔥 DEBUG: Fallback - Token found in localStorage! Attempting navigation to /dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          console.log('🔥 DEBUG: Fallback - No token found anywhere');
        }
      }, 500);

      // Step 8: Reset loading (handler ends)
      setLoading(false);
      console.log('🔥 DEBUG: Step 8 - Loading set to false - Handler ended');

    } catch (err: any) {
      console.error('🔥 DEBUG: CATCH - Error in handleLoginClick:', err.message || err);
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  // useEffect: Auto-redirect if already logged in
  useEffect(() => {
    console.log('🔥 DEBUG: useEffect running - User exists?', !!user, 'Token exists?', !!token, 'Current path:', window.location.pathname);
    if (token && user && window.location.pathname === '/') {
      console.log('🔥 DEBUG: Auto-redirect to /dashboard (auth state confirmed)');
      navigate('/dashboard', { replace: true });
    }
  }, [token, user, navigate]);
  // Styles (Simple & Modern - Add Here)
  const containerStyle: React.CSSProperties = {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',  // Soft shadow
    border: '1px solid #e0e0e0',
    fontFamily: 'Arial, sans-serif'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    marginTop: '8px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease'  // Smooth focus
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',  // Hover effect
    marginTop: '10px'
  };

  const buttonDisabledStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.7
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #f5c6cb',
    marginBottom: '15px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
  };

  const registerLinkStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: '15px',
    fontSize: '14px',
    color: '#666'
  };
// JSX Render (Updated with Styles)
return (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f5f5f5' }}>
    <div style={containerStyle}>
    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
      <h1 style={{ color: '#007bff', fontSize: '28px', margin: '0' }}>ChatBot</h1>  {/* Change "HelloAI" to your app name */}
      </div>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Login</h2>
      
      {/* Error Display - Styled */}
      {error && (
        <div style={errorStyle}>
          ❌ Error: {error}
        </div>
      )}
      
      {/* Standalone Inputs - Styled */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Email:</label>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter email"
          disabled={loading || authLoading}
          style={inputStyle}
          onFocus={(e) => e.target.style.setProperty('border-color', '#007bff')}
          onBlur={(e) => e.target.style.setProperty('border-color', '#e0e0e0')}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Password:</label>
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter password"
          disabled={loading || authLoading}
          style={inputStyle}
          onFocus={(e) => e.target.style.setProperty('border-color', '#007bff')}
          onBlur={(e) => e.target.style.setProperty('border-color', '#e0e0e0')}
        />
      </div>
      
      {/* Button - Styled with Hover */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔥 DEBUG: Button click event captured - Preventing default');
          handleLoginClick();
        }}
        disabled={isButtonDisabled()}
        style={isButtonDisabled() ? buttonDisabledStyle : buttonStyle}
        onMouseEnter={(e) => { if (!isButtonDisabled()) e.currentTarget.style.backgroundColor = '#0056b3'; }}
        onMouseLeave={(e) => { if (!isButtonDisabled()) e.currentTarget.style.backgroundColor = '#007bff'; }}
      >
        {loading || authLoading ? 'Signing in...' : 'Sign in'}
      </button>
      
      {/* Register Link - Styled */}
      <div style={registerLinkStyle}>
      <span>Don't have an account? </span>
      <button
    type="button"
    onClick={() => navigate('/register')}
    style={{
      background: 'none',
      border: 'none',
      color: '#007bff',
      textDecoration: 'underline',
      cursor: 'pointer',
      fontSize: '14px'
    }}
  >
    Register here
  </button>
  <br />  {/* Line break for spacing */}
  <a 
    href="/forgot-password" 
    style={{ 
      display: 'block', 
      textAlign: 'center', 
      marginTop: '10px', 
      color: '#007bff', 
      textDecoration: 'none', 
      fontSize: '14px',
      fontWeight: '500'
      }}
      onClick={(e) => {
         e.preventDefault();
         navigate('/forgot-password');  // Smooth navigation
       }}
       >
       Forgot Password?
     </a>
    </div>
    </div>
  </div>
);
}

export default Login;