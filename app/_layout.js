import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AuthGate({ children }) {
  const token = AsyncStorage.getItem('token')
  const expiration = parseInt(AsyncStorage.getItem('expiration'))
  const router = useRouter();

  useEffect(() => {
    if (!token || expiration < Date.now()-10000) {
      router.replace('/(auth)/login');
    } else {
      router.replace('/(tabs)/Home');
    }
  }, [token]);

  return children;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AuthGate>
            <Slot />
            <Toast />
          </AuthGate>
        </PersistGate>
      </Provider>
    </AuthProvider>
  );
}
