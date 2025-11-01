import React, { useState } from 'react';
import {
	Alert,
	SafeAreaView,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

export default function LoginScreen() {
	// Estado para alternar entre Login e Cadastro
	const [isLogin, setIsLogin] = useState(true);

	// Estados para os campos do formulário
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState(''); // Apenas para cadastro

	// Função para lidar com o Login (placeholder)
	const handleLogin = () => {
		if (!email || !password) {
			Alert.alert('Erro', 'Por favor, preencha o email e a senha.');
			return;
		}
		// Lógica de login aqui (ex: chamada de API, verificação no banco)
		console.log('Tentativa de Login com:', email, password);
		Alert.alert('Sucesso', 'Login realizado!');
	};

	// Função para lidar com o Cadastro (placeholder)
	const handleRegister = () => {
		if (!email || !password || !confirmPassword) {
			Alert.alert('Erro', 'Por favor, preencha todos os campos.');
			return;
		}
		if (password !== confirmPassword) {
			Alert.alert('Erro', 'As senhas não coincidem.');
			return;
		}
		// Lógica de cadastro aqui
		console.log('Tentativa de Cadastro com:', email, password);
		Alert.alert('Sucesso', 'Conta criada com sucesso!');
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="dark-content" />
			<View style={styles.container}>
				<Text style={styles.title}>
					{isLogin ? 'Bem-vindo(a)!' : 'Crie sua Conta'}
				</Text>
				<Text style={styles.subtitle}>
					{isLogin ? 'Acesse sua conta' : 'Rápido e fácil'}
				</Text>

				{/* Campo de Email */}
				<TextInput
					style={styles.input}
					placeholder="Email"
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
					autoCapitalize="none"
				/>

				{/* Campo de Senha */}
				<TextInput
					style={styles.input}
					placeholder="Senha"
					value={password}
					onChangeText={setPassword}
					secureTextEntry // Esconde a senha
				/>

				{/* Campo de Confirmar Senha (apenas no modo Cadastro) */}
				{!isLogin && (
					<TextInput
						style={styles.input}
						placeholder="Confirmar Senha"
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						secureTextEntry
					/>
				)}

				{/* Botão Principal (Login ou Cadastro) */}
				<TouchableOpacity
					style={styles.buttonPrimary}
					onPress={isLogin ? handleLogin : handleRegister}
				>
					<Text style={styles.buttonPrimaryText}>
						{isLogin ? 'Entrar' : 'Cadastrar'}
					</Text>
				</TouchableOpacity>

				{/* Botão para alternar o modo */}
				<TouchableOpacity
					style={styles.buttonSecondary}
					onPress={() => {
						setIsLogin(!isLogin); // Alterna o estado
						// Limpa os campos ao alternar
						setEmail('');
						setPassword('');
						setConfirmPassword('');
					}}
				>
					<Text style={styles.buttonSecondaryText}>
						{isLogin
							? 'Não tem uma conta? Cadastre-se'
							: 'Já tem uma conta? Faça login'}
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

// --- Estilos ---
const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#f5f5f5', // Um fundo cinza claro
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
		backgroundColor: '#E64A19', // Um tom de laranja para combinar com "receitas"
		paddingVertical: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 10,
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
