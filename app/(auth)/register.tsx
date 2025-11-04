import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleRegister = async () => {
    if (loading) return;
    setLoading(true);

    if (!username || !email || !password || !fullName) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      const success = await register(username, email, password, fullName);

      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erro', 'Não foi possível registrar. Verifique os dados.');
      }
    } catch (e) {
      console.error('Erro no registro:', e);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Crie sua Conta</Text>
        <Text style={styles.subtitle}>Rápido e fácil</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome Completo (Full Name)"
          placeholderTextColor="#888"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="Usuário (username)"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {}
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonPrimaryText}>Registrar</Text>
          )}
        </TouchableOpacity>

        {}
        <View style={styles.buttonSecondary}>
          {}
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.buttonSecondaryText}>
                Já tem uma conta? Voltar
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  buttonPrimary: {
    backgroundColor: '#E64A19',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    height: 50, 
    justifyContent: 'center',
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonSecondaryText: {
    color: '#E64A19',
    fontSize: 16,
    fontWeight: '500',
  },
});