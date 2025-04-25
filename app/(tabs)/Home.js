import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/authContext';
import { useRouter } from 'expo-router';
import axios from 'axios';
import ToastComponent from '../../components/Toasts'; // Make sure this is correctly implemented

export default function HomeScreen() {
  const router = useRouter();
  const { logout } = useContext(AuthContext);
  const [token, setToken] = useState(null);

  const authenticate = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      const response = await axios.get('http://192.168.1.233:5001/api/get-user-type', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      console.log(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        ToastComponent('error', 'Session expired', 'Please log in again');
        logout();
        router.replace('/(auth)/login');
      } else {
        console.error("Auth check failed:", error.message);
      }
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, Merchant 👋</Text>
        <Text style={styles.subtitle}>Manage your business with ease</Text>
      </View>
      
      <View style={styles.content}>
        {/* Your main dashboard content goes here */}
      </View>
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
