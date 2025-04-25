import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert, Modal,
  TextInput, ScrollView, Image, TouchableOpacity, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { Picker } from '@react-native-picker/picker';

const OrderCard = ({ order, onStatusUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [notes, setNotes] = useState('');

  const statusOptions = ['pending', 'accepted', 'rejected', 'preparing', 'ready for collection', 'cancelled', 'collected'];

  const filteredStatusOptions = order.status === 'collected'
    ? statusOptions.filter(status => status !== 'collected')
    : statusOptions;

  useEffect(() => {
    setSelectedStatus(order.status);
  }, [order.status]);

  useEffect(() => {
    if (showModal) {
      setNotes('');
    }
  }, [showModal]);

  const handleStatusChange = () => {
    if (order.status !== 'collected') {
      setShowModal(true);
    }
  };

  const handleConfirmChange = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('Token retrieval failed: token is null or undefined');
        Alert.alert('Authentication Error', 'You are not logged in.');
        return;
      }

      const payload = {
        status: selectedStatus,
        notes: notes,
      };

      const response = await fetch(`http://192.168.1.233:5001/api/merchant/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', `Status updated to: ${selectedStatus}`);
        onStatusUpdate(result);
        setShowModal(false);
      } else {
        Alert.alert('Error', result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Could not update order status: ' + error.message);
    }
  };

  const getBorderColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'green';
      case 'rejected':
        return 'red';
      case 'pending':
        return 'orange';
      case 'preparing':
        return 'blue';
      case 'ready for collection':
        return 'purple';
      case 'cancelled':
        return 'gray';
      case 'collected':
        return '#81C784';
      default:
        return '#ccc';
    }
  };

  const getShadowStyle = (status) => {
    switch (status) {
      case 'accepted':
        return { shadowColor: 'green' };
      case 'rejected':
        return { shadowColor: 'red' };
      case 'pending':
        return { shadowColor: 'orange' };
      case 'preparing':
        return { shadowColor: 'blue' };
      case 'ready for collection':
        return { shadowColor: 'purple' };
      case 'cancelled':
        return { shadowColor: 'gray' };
      case 'collected':
        return { shadowColor: '#81C784' };
      default:
        return { shadowColor: '#ccc' };
    }
  };

  const getBadgeText = (status) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending';
      case 'preparing':
        return 'Preparing';
      case 'ready for collection':
        return 'Ready';
      case 'cancelled':
        return 'Cancelled';
      case 'collected':
        return 'Collected'
      default:
        return 'Unknown';
    }
  };

  const getBadgeColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'green';
      case 'rejected':
        return 'red';
      case 'pending':
        return 'orange';
      case 'preparing':
        return 'blue';
      case 'ready for collection':
        return 'purple';
      case 'cancelled':
        return 'gray';
      case 'collected':
        return '#81C784';  
      default:
        return '#ccc';
    }
  };

  return (
    <View style={[styles.card, getShadowStyle(order.status), { borderColor: getBorderColor(order.status) }]}>
      <View style={[styles.badgeContainer, { backgroundColor: getBadgeColor(order.status) }]}>
        <Text style={styles.badge}>{getBadgeText(order.status)}</Text>
      </View>

      <Text style={styles.customerName}>{order.customer_name}</Text>
      <Text style={styles.orderStatus}>Status: {order.status}</Text>
      <Text style={styles.orderDetails}>Total: £{parseFloat(order.total_amount).toFixed(2)}</Text>

      {/* QR Code */}
      <View style={styles.qrContainer}>
        {order.qr_code_url ? (
          <Image source={{ uri: order.qr_code_url }} style={styles.qrCode} />
      ) : ( 
          <Text>No QR Code available</Text>
        )}
      </View>

      {/* Order Items */}
      <ScrollView style={styles.itemsContainer}>
        {order.items?.map((item) => (
          <View key={`${item.id}-${item.product_name}`} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.product_name}</Text>
            <Text style={styles.itemQuantity}>
              {item.quantity} x £{parseFloat(item.unit_price).toFixed(2)}
            </Text>
            <Text style={styles.itemSubtotal}>
              Subtotal: £{parseFloat(item.subtotal).toFixed(2)}
            </Text>
            {item.notes && <Text style={styles.itemNotes}>Notes: {item.notes}</Text>}
          </View>
        ))}
      </ScrollView>

      {/* Change Status Button */}
      <TouchableOpacity onPress={handleStatusChange} style={styles.statusButton} disabled={order.status === 'collected'}>
        <Text style={styles.statusButtonText}>Change Status</Text>
      </TouchableOpacity>

      {/* Status Modal */}
      <Modal visible={showModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Change Order Status</Text>

            <Text style={styles.currentStatus}>Current: {order.status}</Text>

            <View
              style={[
                styles.pickerWrapper,
                { borderColor: getBorderColor(selectedStatus) },
              ]}
            >
              <Picker
                selectedValue={selectedStatus}
                onValueChange={(itemValue) => setSelectedStatus(itemValue)}
                style={styles.picker}
              >
                {filteredStatusOptions.map((status) => (
                  <Picker.Item key={status} label={status} value={status} />
                ))}
              </Picker>
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <TouchableOpacity onPress={handleConfirmChange} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Update Status</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  badge: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderStatus: {
    fontSize: 16,
    color: COLORS.text,
  },
  orderDetails: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  qrContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  qrCode: {
    width: 150,
    height: 150,
    marginBottom: 10,
    borderRadius: 10,
  },
  itemsContainer: {
    marginTop: 10,
    maxHeight: 200,
  },
  itemRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemName: {
    fontSize: 16,
    color: COLORS.text,
  },
  itemQuantity: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  itemSubtotal: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  itemNotes: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  statusButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    alignItems: 'center',
  },
  statusButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  currentStatus: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    marginBottom: 10,
    textAlign: 'center',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    height: Platform.OS === 'ios' ? 150 : 48,
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 48,
    width: '100%',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    minHeight: 60,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrderCard;
