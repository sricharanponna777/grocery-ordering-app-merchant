import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const secureStorage = {
  getItem: async (key) => {
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key, value) => {
    return await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    return await AsyncStorage.removeItem(key);
  },
};
