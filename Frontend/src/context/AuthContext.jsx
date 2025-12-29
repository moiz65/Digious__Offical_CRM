// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('userRole');
    const storedToken = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    console.log('🔐 AuthContext: Checking stored auth...', { storedUser: !!storedUser, storedRole, storedToken: !!storedToken });
    
    if (storedUser && storedRole && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setRole(storedRole);
        setToken(storedToken);
        console.log('✅ AuthContext: User restored from localStorage');
      } catch (error) {
        console.error('❌ AuthContext: Error parsing stored user:', error);
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData, userRole, authToken = null) => {
    const completeUserData = {
      ...userData,
      loginTime: new Date().toISOString()
    };
    
    const normalizedRole = userRole?.toLowerCase() || 'employee';
    
    console.log('🔐 AuthContext: Logging in user...', { email: userData.email, role: normalizedRole });
    
    setUser(completeUserData);
    setRole(normalizedRole);
    if (authToken) {
      setToken(authToken);
    }
    
    // Store in localStorage with both key names for compatibility
    localStorage.setItem('user', JSON.stringify(completeUserData));
    localStorage.setItem('userRole', normalizedRole);
    if (authToken) {
      localStorage.setItem('token', authToken);
      localStorage.setItem('authToken', authToken);
      console.log('✅ AuthContext: Token stored in localStorage');
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
  };

  const value = {
    user,
    role,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!role && !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
