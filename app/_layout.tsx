import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

// 2. Componente "Porteiro"
// Esta lógica decide para onde redirecionar o usuário
function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return; // Se está carregando o token, espere

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      // Logado, mas na tela de login? Vá para o app.
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      // Não logado e fora da área de auth? Vá para o login.
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    // Pode ser sua tela de Splash
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 3. Definir as Stacks (Rotas)
  // Agora temos o grupo (auth) e o (tabs)
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

// 4. Layout Raiz Principal
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // 5. Envolver tudo com os Provedores
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}