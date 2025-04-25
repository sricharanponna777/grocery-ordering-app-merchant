import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Platform, Pressable } from 'react-native';
import axios from 'axios';
import OrderCard from '../../components/OrderCard';
import { COLORS } from '../../constants/colors';
import { FlashList } from '@shopify/flash-list';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/authContext';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { logout } = useContext(AuthContext);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://192.168.1.233:5001/api/merchant/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Error fetching orders.');
      if (err?.response?.status === 403) {
        logout();
        router.replace('/login');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchOrders();
  };

  const onStatusUpdate = (updatedOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Orders</Text>
        <Pressable style={styles.refreshBtn} onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color="#fff" />
        </Pressable>
      </View>

      <FlashList
        data={safeOrders}
        renderItem={({ item }) => (
          <OrderCard order={item} onStatusUpdate={onStatusUpdate} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F5FFFA',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  refreshBtn: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 50,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
