import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastComponent } from '../../components/Toasts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/authContext';
import { useRouter } from 'expo-router';

export default function AddItemScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState();
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { logout } = useContext(AuthContext)
  const router = useRouter()

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.1.233:5001/api/merchant/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
      console.log('Loaded categories:', response.data); // ✅ DEBUG
    } catch (error) {
      if (error.response.status == 403) {
        ToastComponent('error', 'Session expired', 'Please log in again')
        logout()
        router.replace('/(auth)/login')
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImagePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return ToastComponent('error', 'Permission Denied', 'Please grant access to your photo library.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!itemName || !price || !selectedCategory) {
      ToastComponent('error', 'Validation Error', 'Please fill in all required fields.');
      return;
    }

    if (isNaN(price)) {
      ToastComponent('error', 'Validation Error', 'Price must be a number.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', itemName);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('category_id', selectedCategory);
      const token = await AsyncStorage.getItem('token');

      if (image) {
        formData.append('image', {
          uri: image,
          name: 'item.jpg',
          type: 'image/jpeg',
        });
      }

      await axios.post('http://192.168.1.233:5001/api/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      ToastComponent('success', 'Success', 'Item added successfully!');
      setItemName('');
      setPrice('');
      setDescription('');
      setSelectedCategory('');
      setImage(null);
    } catch (error) {
      console.error('Error adding item:', error);
      ToastComponent('error', 'Error', 'Failed to add item.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
              
              <TouchableOpacity style={styles.imagePickerButton} onPress={() => {fetchCategories}}>
                <Text style={styles.imagePickerText}>Refresh</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Item Name"
                value={itemName}
                onChangeText={setItemName}
              />

              <View style={{ height: 50, marginBottom: 12 }}>
                <RNPickerSelect
                  onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                  value={selectedCategory}
                  placeholder={{ label: 'Select Category', value: '' }}
                  items={
                    Array.isArray(categories)
                      ? categories.map((category) => ({
                          label: category.name || 'Unnamed',
                          value: category.id?.toString() || '',
                        }))
                      : []
                  }
                  useNativeAndroidPickerStyle={false}
                  style={pickerSelectStyles}
                  Icon={() => <Text style={{ fontSize: 20, marginRight: 10, marginTop: 15 }}>▼</Text>}
                />
              </View>

              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Description (optional)"
                value={description}
                onChangeText={setDescription}
                onSubmitEditing={Keyboard.dismiss}
                returnKeyType="done"
                multiline
              />

              <TextInput
                style={styles.input}
                placeholder="Price (£)"
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
                onSubmitEditing={Keyboard.dismiss}
                returnKeyType="done"
              />

              <TouchableOpacity onPress={handleImagePick} style={styles.imagePickerButton}>
                <Text style={styles.imagePickerText}>Select Item Image (JPEG only)</Text>
              </TouchableOpacity>

              {image && (
                <View style={{ alignItems: 'center', marginBottom: 160 }}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <Text style={{ marginTop: 5, fontSize: 12, color: '#555' }}>
                    {image.split('/').pop()}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.5 }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Adding...' : 'Add Item'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  note: {
    fontSize: 23,
    fontStyle: 'italic'
  },
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    height: 40
  },
  imagePickerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    height: 40
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    height: 50
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#fff',
    height: 50,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#fff',
    height: 50,
  },
  inputWeb: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#fff',
    height: 50,
  },
});
