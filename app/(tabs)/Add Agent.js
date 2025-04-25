import React, { useContext, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastComponent } from '../../components/Toasts';
import { AuthContext } from '../../context/authContext';
import { useRouter } from 'expo-router';

const GEOAPIFY_API_KEY = 'e9d10056c1304c16844990e7ef112451';

const AddCollectionPointScreen = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useContext(AuthContext)

  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const fetchSuggestions = async (query) => {
    if (query.length < 3) return;

    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete`,
        {
          params: {
            text: query,
            apiKey: GEOAPIFY_API_KEY,
          },
        }
      );
      setSuggestions(response.data.features);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleLocationChange = (text) => {
    setSearchQuery(text);
    fetchSuggestions(text);
  };

  const handleSelectLocation = (item) => {
    setSelectedLocation(item);
    setSearchQuery(item.properties.formatted);
    setSuggestions([]);
  };

  const onSubmit = async (data) => {
    if (!selectedLocation) {
      alert('Please select a valid location');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token')
      await axios.post('http://192.168.1.233:5001/api/merchant/create-agent', {
        agent_name: data.agentName,
        agent_email: data.agentEmail,
        agent_phone: data.agentPhone,
        agent_password: data.agentPassword,
        lat: selectedLocation.geometry.coordinates[1],
        lng: selectedLocation.geometry.coordinates[0],
        location_name: selectedLocation.properties.formatted
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

      alert('Agent created successfully');
      reset();
      setSearchQuery('');
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error creating agent:', error);
      if (error.message === "Agent already exists") {
        ToastComponent('error', 'Error', 'Agent already Exists')
      } else if (error.response.status == 403) {
        ToastComponent('error', 'Session Expired', 'Please log in again')
        logout()
        router.replace('/login')
        
      } else {
        ToastComponent('error', 'Error', 'An error occured')
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Agent</Text>

      <Controller
        control={control}
        name="agentName"
        rules={{ required: 'Agent name is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Agent Name"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.agentName && <Text style={styles.error}>{errors.agentName.message}</Text>}

      <Controller
        control={control}
        name="agentEmail"
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email format',
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Agent Email"
            value={value}
            onChangeText={onChange}
            keyboardType="email-address"
          />
        )}
      />
      {errors.agentEmail && <Text style={styles.error}>{errors.agentEmail.message}</Text>}

      <Controller
        control={control}
        name="agentPhone"
        rules={{ required: 'Phone number is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Agent Phone"
            value={value}
            onChangeText={onChange}
            keyboardType="phone-pad"
          />
        )}
      />
      {errors.agentPhone && <Text style={styles.error}>{errors.agentPhone.message}</Text>}

      <Controller
        control={control}
        name="agentPassword"
        rules={{ required: 'Password is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Agent Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
          />
        )}
      />
      {errors.agentPassword && <Text style={styles.error}>{errors.agentPassword.message}</Text>}

      <TextInput
        style={styles.searchInput}
        placeholder="Enter postcode or street name"
        value={searchQuery}
        onChangeText={handleLocationChange}
      />

      {selectedLocation && (
        <View style={styles.selectedLocation}>
          <Text style={styles.selectedText}>
            Selected Location: {selectedLocation.properties.formatted}
          </Text>
        </View>
      )}

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.properties.geohash}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectLocation(item)} style={styles.suggestionItem}>
              <Text>{item.properties.formatted}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.button} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Agent</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, marginBottom: 16, fontWeight: 'bold' },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    marginLeft: 8,
  },
  selectedLocation: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#e0ffe0',
    borderRadius: 5,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddCollectionPointScreen;
