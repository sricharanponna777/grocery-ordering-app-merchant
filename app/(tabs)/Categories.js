import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, Modal, StyleSheet
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Don't forget to import AsyncStorage
import { AuthContext } from '../../context/authContext';
import { useRouter } from 'expo-router';

const API_URL = 'http://192.168.1.233:5001/api';

const CategoryScreen = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState(null);

  const [token, setToken] = useState(null);

  const { logout } = useContext(AuthContext)
  const router = useRouter()

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/merchant/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      if (error.response.status == 403) {
        ToastComponent('error', 'Session Expired', 'Please log in again')
        logout()
        router.replace('/login')
        
      }
    }
    setLoading(false);
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await axios.post(`${API_URL}/categories`, { name: newCategory }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      Alert.alert('Error', 'Failed to add category');
      console.error(err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (err) {
      Alert.alert('Error', 'Delete failed');
    }
  };

  const openEditModal = (id, name) => {
    setEditCategoryId(id);
    setEditCategoryName(name);
    setEditModalVisible(true);
  };

  const submitEdit = async () => {
    try {
      await axios.put(`${API_URL}/categories/${editCategoryId}`, { name: editCategoryName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditModalVisible(false);
      fetchCategories();
    } catch (err) {
      Alert.alert('Error', 'Edit failed');
    }
  };

  const renderRightActions = (item) => (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity
        onPress={() => openEditModal(item.id, item.name)}
        style={[styles.swipeButton, { backgroundColor: '#4CAF50' }]}
      >
        <Text style={styles.swipeText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          Alert.alert('Delete', 'Are you sure?', [
            { text: 'Cancel' },
            { text: 'Delete', onPress: () => deleteCategory(item.id), style: 'destructive' },
          ])
        }
        style={[styles.swipeButton, { backgroundColor: '#F44336' }]}
      >
        <Text style={styles.swipeText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <View style={styles.item}>
        <Text style={styles.itemText}>{item.name}</Text>
      </View>
    </Swipeable>
  );

  useEffect(() => {
    const getToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
    };

    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Categories</Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholder="New Category"
          value={newCategory}
          onChangeText={setNewCategory}
          style={styles.input}
        />
        <TouchableOpacity style={styles.addButton} onPress={addCategory}>
          <Text style={{ color: '#fff' }}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlashList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        estimatedItemSize={60}
      />

      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit Category</Text>
            <TextInput
              value={editCategoryName}
              onChangeText={setEditCategoryName}
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={{ color: '#F44336' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitEdit}>
                <Text style={{ color: '#4CAF50' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#81C784',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  item: {
    backgroundColor: '#fff',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemText: {
    fontSize: 16,
  },
  swipeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    paddingHorizontal: 10,
  },
  swipeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
});
