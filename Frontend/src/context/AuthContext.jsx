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
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedRole && storedToken) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = (userData, userRole, authToken = null) => {
    const completeUserData = {
      ...userData,
      loginTime: new Date().toISOString()
    };
    
    setUser(completeUserData);
    setRole(userRole);
    if (authToken) {
      setToken(authToken);
    }
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(completeUserData));
    localStorage.setItem('userRole', userRole);
    if (authToken) {
      localStorage.setItem('authToken', authToken);
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
