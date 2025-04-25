import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import { BASEURL } from '../../constants/baseUrl';
import { ToastComponent } from '../../components/Toasts'; // Import your new ToastComponent
import { useRouter } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
export default function RegisterScreen() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    business_name: '',
    description: '',
    address: '',
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${BASEURL}:8080/api/auth/register`, {
        ...form,
        user_type: 'merchant',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Use ToastComponent instead of Toast.show
      ToastComponent('success', 'Registration Successful', response.data.message);
      router.navigate('/login');
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || 'Registration failed';

      // Use ToastComponent instead of Toast.show
      ToastComponent('error', 'Registration Failed', msg);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>Register as Merchant</Text>

          <TextInput placeholder="Name" style={styles.input} onChangeText={(text) => handleChange('name', text)} />
          <TextInput placeholder="Email" style={styles.input} autoCapitalize="none" onChangeText={(text) => handleChange('email', text)} />
          <TextInput placeholder="Password" style={styles.input} secureTextEntry onChangeText={(text) => handleChange('password', text)} />
          <TextInput placeholder="Phone" style={styles.input} keyboardType="phone-pad" onChangeText={(text) => handleChange('phone', text)} />
          
          <TextInput placeholder="Business Name" style={styles.input} onChangeText={(text) => handleChange('business_name', text)} />
          <TextInput placeholder="Description" style={styles.input} onChangeText={(text) => handleChange('description', text)} />
          <TextInput placeholder="Address" style={styles.input} onChangeText={(text) => handleChange('address', text)} />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    color: '#2E7D32',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#81C784',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
