import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('datespot_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('datespot_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axiosClient.get('/auth/me');
        setUser(data);
        localStorage.setItem('datespot_user', JSON.stringify(data));
      } catch (err) {
        localStorage.removeItem('datespot_token');
        localStorage.removeItem('datespot_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    localStorage.setItem('datespot_token', data.token);
    localStorage.setItem('datespot_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password, bio) => {
    const { data } = await axiosClient.post('/auth/register', {
      name,
      email,
      password,
      bio,
    });
    localStorage.setItem('datespot_token', data.token);
    localStorage.setItem('datespot_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const updateProfile = async (payload) => {
    const { data } = await axiosClient.put('/auth/profile', payload);
    localStorage.setItem('datespot_token', data.token);
    localStorage.setItem('datespot_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const updateSavedLocationsList = (savedLocations) => {
    if (!user) return;
    const updated = { ...user, savedLocations };
    setUser(updated);
    localStorage.setItem('datespot_user', JSON.stringify(updated));
  };

  const logout = () => {
    localStorage.removeItem('datespot_token');
    localStorage.removeItem('datespot_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateProfile,
        updateSavedLocationsList,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

