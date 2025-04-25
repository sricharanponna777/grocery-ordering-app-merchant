// components/Toasts.js
import { Platform } from 'react-native';

let nativeToast;
let webToast;
let toast;

if (Platform.OS !== 'web') {
  nativeToast = require('react-native-toast-message').default;
} else {
  const toastify = require('react-toastify');
  webToast = toastify.toast;
  toast = toastify;
}

export const ToastComponent = (type, title, message) => {
  if (Platform.OS !== 'web' && nativeToast) {
    nativeToast.show({
      type,
      text1: title,
      text2: message,
    });
  } else if (webToast) {
    webToast[type](`${title}: ${message}`, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
};

export const ToastProvider = () => {
  if (Platform.OS === 'web' && toast) {
    const { ToastContainer } = toast;
    return <ToastContainer />;
  } else {
    const Toast = require('react-native-toast-message').default;
    return <Toast />;
  }
};
