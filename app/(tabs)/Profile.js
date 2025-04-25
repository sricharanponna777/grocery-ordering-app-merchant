import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ensure AsyncStorage is imported
import { AuthContext } from '../../context/authContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [logoUri, setLogoUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null); // Add token state

  const API_URL = 'http://192.168.1.233:5001/api'; // Replace with your actual API URL

  const { logout } = useContext(AuthContext)
  const router = useRouter()

  // Load token from AsyncStorage
  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken); // Set token to state
      } else {
        Alert.alert('Error', 'No token found');
      }
    } catch (error) {
      console.error('Error loading token:', error);
    }
  };

  // Fetch merchant profile after token is set
  const fetchMerchantProfile = async () => {
    if (!token) return; // Ensure token is available
    try {
      const response = await axios.get(`${API_URL}/merchant/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setProfile(data);
      setBusinessName(data.business_name);
      setDescription(data.description);
      setAddress(data.address);
      setLogoUri(data.logo_url);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to fetch profile');
      if (error.response.status == 403) {
              ToastComponent('error', 'Session Expired', 'Please log in again')
              logout()
              router.replace('/login')
              
            }
    } finally {
      setLoading(false);
    }
  };

  // Update merchant profile
  const updateMerchantProfile = async () => {
    if (!token) return; // Ensure token is available
    try {
      const response = await axios.put(
        `${API_URL}/merchant/profile`,
        { business_name: businessName, description, address },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(response.data);
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  // Pick and upload logo
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      setLogoUri(image.uri);
      uploadLogo(image);
    }
  };

  const uploadLogo = async (image) => {
    const formData = new FormData();
    formData.append('logo', {
      uri: image.uri,
      name: 'merchant_logo.jpg',
      type: 'image/jpeg',
    });

    if (!token) return; // Ensure token is available
    try {
      const response = await axios.post(`${API_URL}/merchant/logo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setLogoUri(response.data.logo_url);
      Alert.alert('Success', 'Logo uploaded!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      Alert.alert('Error', 'Failed to upload logo');
    }
  };

  // Load token on mount
  useEffect(() => {
    loadToken();
  }, []);

  // Fetch profile if token is set
  useEffect(() => {
    if (token) {
      fetchMerchantProfile();
    }
  }, [token]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>👤 Merchant Profile</Text>

      {logoUri && (
        <Image source={{ uri: logoUri }} style={styles.logo} resizeMode="cover" />
      )}

      <TouchableOpacity onPress={pickImage}>
        <Text style={styles.uploadButton}>📷 Upload Logo</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Business Name"
        value={businessName}
        onChangeText={setBusinessName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />

      <Button title="Update Profile" onPress={updateMerchantProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  heading: {
    color: COLORS.text,
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: COLORS.text,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: COLORS.text,
  },
  text: {
    color: COLORS.text,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.text,
  },
  uploadButton: {
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
});
