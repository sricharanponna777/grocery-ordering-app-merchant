import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, LogBox } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import axios from 'axios';
import { COLORS } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Suppress specific warnings
LogBox.ignoreAllLogs(true); // Replace with specific warning to ignore
// You can also use LogBox.ignoreAllLogs() to suppress all logs
export default function ReviewsScreen() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = await AsyncStorage.getItem('token')
        const response = await axios.get('http://192.168.1.233:5001/api/merchant/reviews', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReviews(response.data);
        setLoading(false);
      } catch (err) {
        setError(`Error fetching reviews: ${err}`);
        setLoading(false);
        if (error.response.status == 403) {
                ToastComponent('error', 'Session Expired', 'Please log in again')
                logout()
                router.replace('/login')
                
              }
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading reviews...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Reviews</Text>

      {reviews.length === 0 ? (
        <Text>No reviews yet.</Text>
      ) : (
        <FlashList
          data={reviews}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <Text style={styles.productName}>{item.product_name}</Text>
              <Text style={styles.customerName}>By: {item.customer_name}</Text>
              <Text style={styles.rating}>Rating: {item.rating}/5</Text>
              <Text style={styles.reviewText}>"{item.comment}"</Text>
              <Text style={styles.reviewDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
          )}
          estimatedItemSize={100}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reviewCard: {
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerName: {
    fontSize: 14,
    color: 'gray',
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  reviewText: {
    fontSize: 16,
    marginVertical: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
