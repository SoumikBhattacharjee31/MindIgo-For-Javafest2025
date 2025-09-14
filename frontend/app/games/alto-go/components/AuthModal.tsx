// components/AuthModal.tsx
import React, { useState } from 'react';
import { userService, User } from '../services/userService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'guest'>('guest');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let user: User;

      if (mode === 'guest') {
        user = userService.initializeUser();
        onSuccess(user);
        onClose();
        return;
      }

      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        user = await userService.register(formData.email, formData.name, formData.password);
      } else {
        user = await userService.login(formData.email, formData.password);
      }

      onSuccess(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestPlay = () => {
    const user = userService.initializeUser();
    onSuccess(user);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #001122, #003366)',
        border: '2px solid #00ccff',
        borderRadius: '10px',
        padding: '30px',
        minWidth: '400px',
        maxWidth: '90vw',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#00ccff' }}>
          {mode === 'guest' ? 'Welcome to Snowboarder!' : 
           mode === 'login' ? 'Login' : 'Create Account'}
        </h2>

        {error && (
          <div style={{
            background: '#ff4444',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode !== 'guest' && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    fontSize: '16px',
                    background: 'white',
                    color: 'black'
                  }}
                />
              </div>

              {mode === 'register' && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #ccc',
                      fontSize: '16px',
                      background: 'white',
                      color: 'black'
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    fontSize: '16px',
                    background: 'white',
                    color: 'black'
                  }}
                />
              </div>

              {mode === 'register' && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Confirm Password:</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #ccc',
                      fontSize: '16px',
                      background: 'white',
                      color: 'black'
                    }}
                  />
                </div>
              )}
            </>
          )}

          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            {mode === 'guest' ? (
              <>
                <button
                  type="button"
                  onClick={handleGuestPlay}
                  disabled={isLoading}
                  style={{
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '12px 30px',
                    borderRadius: '5px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '15px',
                    width: '100%'
                  }}
                >
                  Play as Guest
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    style={{
                      background: 'transparent',
                      color: '#00ccff',
                      border: '1px solid #00ccff',
                      padding: '8px 20px',
                      borderRadius: '5px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      marginRight: '10px'
                    }}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    style={{
                      background: 'transparent',
                      color: '#00ccff',
                      border: '1px solid #00ccff',
                      padding: '8px 20px',
                      borderRadius: '5px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Register
                  </button>
                </div>
              </>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '5px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  width: '100%'
                }}
              >
                {isLoading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create Account')}
              </button>
            )}
          </div>
        </form>

        {mode !== 'guest' && (
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setMode('guest')}
              style={{
                background: 'transparent',
                color: '#cccccc',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '5px',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Continue as Guest
            </button>
            <br />
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{
                background: 'transparent',
                color: '#00ccff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '5px',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline',
                marginTop: '10px'
              }}
            >
              {mode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            color: '#cccccc',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AuthModal;