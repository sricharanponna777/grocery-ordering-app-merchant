import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Button,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
  ScrollView,
  Platform
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { RNPickerSelect } from 'react-native-picker-select';
import { ToastComponent } from '../../components/Toasts'; // Import your new ToastComponent
import { COLORS } from '../../constants/colors';
import { useRouter, useLocalSearchParams } from 'expo-router';  // Import useLocalSearchParams
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

export default function EditProductScreen() {
  const { productId } = useLocalSearchParams();  // Get dynamic route parameter using useLocalSearchParams()
  const [product, setProduct] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState()

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);  // Save token in state
    };

    fetchToken();
  }, []);

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      if (!token) return; // Ensure token is loaded before making API calls
      try {
        const productResponse = await axios.get(
          `http://192.168.1.233:5001/api/merchant/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProduct(productResponse.data);

        const categoriesResponse = await axios.get(
          'http://192.168.1.233:5001/api/merchant/categories',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(categoriesResponse.data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError('Error fetching product or categories. Please check your connection or try again later.');
        setLoading(false);
      }
    };

    fetchProductAndCategories();
  }, [productId, token]);

  const handleImagePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert('Permission Denied', 'Please grant access to your photo library.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const clearSelectedImage = () => {
    setImageUri(null);
  };

  const handleSaveChanges = async () => {
    if (!product.name || !product.price || !product.category_id) {
      // Use ToastComponent for error message
      ToastComponent('error', 'Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('price', product.price);
      formData.append('category_id', product.category_id);
      formData.append('is_available', product.is_available);
      if (product.description) {
        formData.append('description', product.description);
      }

      if (imageUri) {
        const fileName = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(fileName);
        const ext = match ? match[1] : 'jpg';

        formData.append('image', {
          uri: imageUri,
          name: `product.${ext}`,
          type: `image/${ext}`,
        });
      }

      const response = await axios.put(
        `http://192.168.1.233:5001/api/products/${productId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        // Use ToastComponent for success message
        ToastComponent('success', 'Product updated successfully!', '');
        router.back();  // Use router.back() instead of navigation.goBack()
      }
    } catch (error) {
      console.error('Error updating product:', error);
      // Use ToastComponent for error message
      ToastComponent('error', 'Update Failed', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#81C784" />;
  if (error) return <Text>{error}</Text>;
  if (!product) return <Text>No product found.</Text>;

  return (
    <ScrollView style={styles.container}>
      <View>
        <TextInput
          style={styles.input}
          placeholder="Product Name"
          value={product.name}
          onChangeText={(text) => setProduct({ ...product, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Product Price"
          value={String(product.price)}
          keyboardType="numeric"
          onChangeText={(text) => setProduct({ ...product, price: parseFloat(text) })}
        />
        <TextInput
          style={styles.input}
          placeholder="Product Description (optional)"
          value={product.description || ''}
          onChangeText={(text) => setProduct({ ...product, description: text })}
        />

        <Text style={styles.label}>Category</Text>
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
        
        <View style={styles.switchContainer}>
          <Text>Available:</Text>
          <Switch
            value={product.is_available}
            onValueChange={(value) => setProduct({ ...product, is_available: value })}
          />
        </View>

        <TouchableOpacity onPress={handleImagePick} style={styles.imagePickerButton}>
          <Text style={styles.imagePickerText}>Select New Image</Text>
        </TouchableOpacity>

        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity onPress={clearSelectedImage} style={styles.clearImageBtn}>
              <Text style={styles.clearImageText}>Clear Selected Image</Text>
            </TouchableOpacity>
          </>
        ) : (
          product.image_url && (
            <Image
              source={{ uri: `http://192.168.1.233:5001/${product.image_url}` }}
              style={styles.imagePreview}
            />
          )
        )}

        <Button
          title={isSaving ? 'Saving...' : 'Save Changes'}
          onPress={handleSaveChanges}
          disabled={isSaving}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 8,
    borderRadius: 10,
  },
  picker: {
    height: 40,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 100 : 15,
    justifyContent: 'space-between',
  },
  imagePickerButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  imagePickerText: {
    color: '#fff',
    textAlign: 'center',
  },
  clearImageBtn: {
    backgroundColor: '#d9534f',
    padding: 8,
    borderRadius: 5,
    marginBottom: 20,
  },
  clearImageText: {
    color: 'white',
    textAlign: 'center',
  },
  imagePreview: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
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
    marginBottom: 12,
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
    marginBottom: 12,
    height: 50,
  },
});
