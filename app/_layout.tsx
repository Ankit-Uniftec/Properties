import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import BottomNavigation from './BottomNavigation';
import LoginScreen from './LoginScreen';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { user, loading } = useAuth();



  if (!loaded || loading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {user ? (
        <View style={styles.container}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainScreen" />
            <Stack.Screen name="ExploreScreen" />
            <Stack.Screen name="PropertiesScreen" />
            <Stack.Screen name="MenuScreen" />
          </Stack>
          <BottomNavigation />
        </View>
      ) : (
        <LoginScreen onLogin={() => { /* handle login logic here */ }} />

      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
