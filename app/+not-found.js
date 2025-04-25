import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the homepage after 1 second
    const timer = setTimeout(() => {
      router.replace('/(tabs)/Home'); // or '/(tabs)' or whatever your home is
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null; // or a fallback UI like "Redirecting..." or a spinner
}
