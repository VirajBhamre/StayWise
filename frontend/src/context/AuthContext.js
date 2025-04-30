import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    const storedAdmin = localStorage.getItem('adminInfo');
    const storedWarden = localStorage.getItem('wardenInfo');
    const storedHosteller = localStorage.getItem('hostellerInfo');
    
    if (storedAdmin) {
      setUser(JSON.parse(storedAdmin));
      setUserRole('admin');
    } else if (storedWarden) {
      setUser(JSON.parse(storedWarden));
      setUserRole('warden');
    } else if (storedHosteller) {
      setUser(JSON.parse(storedHosteller));
      setUserRole('hosteller');
    }
    
    setLoading(false);
  }, []);
  
  const login = (userData, role, navigate) => {
    console.log(`Auth context login called with role: ${role}`, userData);
    // Make sure token exists to avoid invalid authentication
    if (!userData || !userData.token) {
      console.error('Login failed: No token provided in user data');
      return;
    }
    
    // Store user data in localStorage based on role
    if (role === 'admin') {
      localStorage.setItem('adminInfo', JSON.stringify(userData));
    } else if (role === 'warden') {
      localStorage.setItem('wardenInfo', JSON.stringify(userData));
    } else if (role === 'hosteller') {
      localStorage.setItem('hostellerInfo', JSON.stringify(userData));
    }
    
    // Verify the data was stored correctly
    const storedData = role === 'admin' 
      ? localStorage.getItem('adminInfo')
      : role === 'warden'
        ? localStorage.getItem('wardenInfo')
        : localStorage.getItem('hostellerInfo');
        
    console.log(`Auth data stored for ${role}:`, !!storedData);
    
    setUser(userData);
    setUserRole(role);
    
    // Redirect to the appropriate dashboard if navigate is provided
    if (navigate) {
      const redirectPath = `/${role}/dashboard`;
      console.log(`Redirecting to: ${redirectPath}`);
      navigate(redirectPath);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('wardenInfo');
    localStorage.removeItem('hostellerInfo');
    setUser(null);
    setUserRole(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, userRole, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;