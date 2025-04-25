import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import InputField from '../../components/InputField';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/authContext';
import { useRouter } from 'expo-router';

export default function LoginScreen({}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
  
    try {
      const res = await axios.post('http://192.168.1.233:5001/api/auth/login', {
        email,
        password,
      });
  
      const { isMerchant, token } = res.data;
  
      if (!isMerchant) {
        Alert.alert('Access Denied', 'You must be a merchant to access this app.');
        return;
      }
  
      // Save tokens & call context login
      await login(token);
      router.replace('/(tabs)/Home');
  
    } catch (error) {
      console.error(error);
      Alert.alert('Login failed', 'Invalid credentials or server error.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Merchant Login</Text>
      <InputField placeholder="Email" value={email} onChangeText={setEmail} />
      <InputField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.navigate('/register')}>
        <Text style={styles.link}>Don't have an account? Register here</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  link: {
    marginTop: 16,
    color: '#2e7d32',
    textAlign: 'center',
  },
});

