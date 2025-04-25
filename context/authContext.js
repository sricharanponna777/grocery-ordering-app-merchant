import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, settoken] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadToken = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      settoken(token);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadToken();
  }, []);

  const login = async (token) => {
      await AsyncStorage.setItem('expiration', (Date.now()+1000*60*60*24).toString())
      await AsyncStorage.setItem('token', token);
    settoken(token);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('expiration')
    await AsyncStorage.removeItem('token');
    settoken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};