import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Button, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ProductCard from '../../components/ProductCard';
import axios from 'axios';
import { COLORS } from '../../constants/colors';
import { FlashList } from '@shopify/flash-list';
import { useSelector } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/authContext';

export default function ProductsScreen({}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const { logout } = useContext(AuthContext)
  const router = useRouter()


  const fetchCategories = async () => {
    const token = await AsyncStorage.getItem('token')
    try {
      const response = await axios.get('http://192.168.1.233:5001/api/merchant/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories([{ id: 'All', name: 'All' }, ...response.data]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async (categoryId = selectedCategory) => {
    try {
      const token = await AsyncStorage.getItem('token')
      setLoading(true);
      const url =
        categoryId === 'All'
          ? 'http://192.168.1.233:5001/api/merchant/products'
          : `http://192.168.1.233:5001/api/products/category/${categoryId}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]); // In case of error or no products
      if (error.response.status == 403) {
              ToastComponent('error', 'Session Expired', 'Please log in again')
              logout()
              router.replace('/login')
              
            }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const handleDeleteProduct = async (id) => {
    try {
      setDeleting(true);
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`http://192.168.1.233:5001/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete product');
      }

      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const handleClearImage = async (productId) => {
    const token = await AsyncStorage.getItem('token')
    try {
      await axios.delete(`http://192.168.1.233:5001/product/${productId}/clear-image`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Image cleared successfully!');
    } catch (error) {
      console.error('Error clearing image:', error);
      alert('Failed to clear image');
    }
  };

  const handleRefresh = () => {
    fetchProducts();
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedCategory === item.id;

    return (
      <TouchableOpacity
        onPress={() => setSelectedCategory(item.id)}
        style={[styles.pill, isSelected && styles.selectedPill]}
      >
        <Text style={[styles.pillText, isSelected && styles.selectedPillText]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const data = [...categories];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Products</Text>

      {/* Category Picker */}
      {/* <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        style={styles.picker}
        dropdownIconColor={COLORS.primary}
      >
        {categories.map((cat) => (
          <Picker.Item label={cat.name} value={cat.id} key={cat.id} />
        ))}
      </Picker> */}
       <FlashList
        data={data}
        renderItem={renderItem}
        horizontal
        keyExtractor={(item) => item.id?.toString() ?? 'all'}
        estimatedItemSize={80}
        contentContainerStyle={styles.listContainer}
        showsHorizontalScrollIndicator={false}
      />
      {/* Refresh Button */}
      <Button title="Refresh" onPress={handleRefresh} color={COLORS.primary} />

      {deleting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyVoid} />
      ) : (
        <FlashList
          data={products}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => {
                console.log(item.id)
                router.navigate(`/product-details/${item.id}`)
              }}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={200}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    marginBottom: 20,
  },
  picker: {
    backgroundColor: COLORS.card,
    marginBottom: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#000'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyVoid: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  pill: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    marginRight: 8,
  },
  selectedPill: {
    backgroundColor: '#81C784', // your pale green
  },
  pillText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedPillText: {
    color: 'white',
  },
});
