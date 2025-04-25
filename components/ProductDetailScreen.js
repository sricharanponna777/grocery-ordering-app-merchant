import { SafeAreaView } from 'react-native-safe-area-context'; // import SafeAreaView
import { SafeAreaProvider } from 'react-native-safe-area-context'; // import SafeAreaProvider
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { View, Text, ScrollView, Modal, TouchableOpacity, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); 
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); 


  useEffect(() => {
    const fetchProduct = async () => {
      const token = await AsyncStorage.getItem('token')
      try {
        console.log(`Fetching product with ID: ${productId}`);
        const response1 = await axios.get(`http://192.168.1.233:5001/api/merchant/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`Product fetched: ${JSON.stringify(response1.data)}`);
        setProduct(response1.data);

        const response2 = await axios.get(`http://192.168.1.233:5001/api/categories/${response1.data.category_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`Category fetched: ${JSON.stringify(response2.data)}`);
        setCategory(response2.data[0]?.name);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(`Error fetching product: ${err.message}`);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) return <Text style={styles.centeredText}>Loading...</Text>;
  if (error) return <Text style={styles.centeredText}>{error}</Text>;
  if (!product) return <Text style={styles.centeredText}>No product found.</Text>;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.page}>
        <ScrollView contentContainerStyle={styles.container}>
          {product.image_url?.trim() !== '' && (
            <Image source={{ uri: product.image_url }} style={styles.image} />
          )}

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>£{product.price}</Text>
          <Text style={styles.productCategory}>Category: {category || 'Not available'}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
        </ScrollView>

        {/* Sticky bottom buttons */}
        <View style={styles.buttonBar}>
          <TouchableOpacity style={[styles.button, styles.edit]} onPress={handleEdit}>
            <AntDesign name="edit" size={20} color="#fff" />
            <Text style={styles.buttonText}> Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.clear]} onPress={openClearImageModal}>
            <MaterialIcons name="image-not-supported" size={20} color="#fff" />
            <Text style={styles.buttonText}> Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.delete]} onPress={confirmDelete}>
            <AntDesign name="delete" size={20} color="#fff" />
            <Text style={styles.buttonText}> Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Modal for clearing image */}
        <Modal
          transparent
          visible={modalVisible}
          animationType="fade"
          onRequestClose={closeClearImageModal}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Clear Image</Text>
              <Text style={styles.modalText}>Are you sure you want to clear this product's image?</Text>
              <View style={styles.modalButtons}>
                <Pressable onPress={closeClearImageModal} style={styles.cancelButton}>
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleClearImage} style={styles.confirmButton}>
                  <Text style={styles.modalBtnText}>Clear</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal for deletion */}
        <Modal
          transparent
          visible={deleteModalVisible}
          animationType="fade"
          onRequestClose={closeDeleteModal}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Product</Text>
              <Text style={styles.modalText}>Are you sure you want to delete this product?</Text>
              <View style={styles.modalButtons}>
                <Pressable onPress={closeDeleteModal} style={styles.cancelButton}>
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleDelete} style={styles.confirmButton}>
                  <Text style={styles.modalBtnText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
import { Modal, StyleSheet } from 'react-native';
import axios from 'axios';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 16,
    paddingBottom: 100, // ensures content isn't blocked by bottom buttons
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    color: '#388e3c',
    fontWeight: '600',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  centeredText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    padding: 16,
  },
  buttonBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  edit: {
    backgroundColor: '#4caf50',
  },
  clear: {
    backgroundColor: '#ff9800',
  },
  delete: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
