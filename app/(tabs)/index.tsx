import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
	Alert,
	Button,
	Dimensions,
	FlatList,
	Image,
	Modal,
	SafeAreaView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

// 1. Definindo o tipo do nosso Ingrediente (TypeScript)
interface Ingrediente {
	id: string;
	nome: string;
	qtd: string;
	unidade: string;
	foto: string | null; // A foto pode ser nula
}

// --- Estilos ---
const { width } = Dimensions.get('window');
const itemGridSize = width / 2 - 25; // Tamanho para 2 colunas com margem

const itemGridStyles = {
	container: {
		backgroundColor: 'white',
		borderRadius: 8,
		padding: 10,
		marginBottom: 10,
		marginHorizontal: 5,
		width: itemGridSize,
		alignItems: 'center',
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 1.41,
	},
	image: {
		width: itemGridSize - 20,
		height: itemGridSize - 20,
		borderRadius: 8,
		marginBottom: 5,
		backgroundColor: '#eee',
	},
	textContainer: {
		alignItems: 'center',
	},
	nome: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	qtd: {
		fontSize: 14,
		color: 'grey',
	},
};

const itemListStyles = {
	container: {
		backgroundColor: 'white',
		borderRadius: 8,
		padding: 10,
		marginBottom: 10,
		flexDirection: 'row',
		alignItems: 'center',
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 1.41,
	},
	image: {
		width: 60,
		height: 60,
		borderRadius: 8,
		marginRight: 10,
		backgroundColor: '#eee',
	},
	textContainer: {
		flex: 1,
	},
	nome: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	qtd: {
		fontSize: 16,
		color: 'grey',
	},
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	container: {
		flex: 1,
		padding: 10,
		marginTop: 30,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
		paddingHorizontal: 10,
	},
	titulo: {
		fontSize: 24,
		fontWeight: 'bold',
	},
	listContent: {
		paddingHorizontal: 10,
	},
	fab: {
		position: 'absolute',
		bottom: 30,
		right: 30,
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: 'green',
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 8,
	},
	fabText: {
		fontSize: 30,
		color: 'white',
	},
	modalOverlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	modalContent: {
		width: '90%',
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 20,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 20,
	},
	input: {
		backgroundColor: '#f0f0f0',
		width: '100%',
		padding: 10,
		borderRadius: 8,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
	},
	inputMetade: {
		width: '48%',
	},
	fotoPicker: {
		width: 100,
		height: 100,
		borderRadius: 8,
		backgroundColor: '#eee',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	fotoPreview: {
		width: 100,
		height: 100,
		borderRadius: 8,
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		width: '100%',
		marginTop: 20,
	},
});

// O componente da tela agora é exportado como default
export default function HomeScreen() {
	// --- Estados Principais ---
	const [modalVisible, setModalVisible] = useState(false);
	const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]); // Array tipado
	const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid'); // Tipo literal

	// --- Estados para o formulário do modal ---
	const [nomeIngrediente, setNomeIngrediente] = useState('');
	const [quantidade, setQuantidade] = useState('');
	const [unidade, setUnidade] = useState('');
	const [fotoUri, setFotoUri] = useState<string | null>(null);

	// --- Funções do Modal ---

	const handleAbrirModal = () => {
		setModalVisible(true);
	};

	const handleFecharModal = () => {
		// Limpa o formulário ao fechar
		setNomeIngrediente('');
		setQuantidade('');
		setUnidade('');
		setFotoUri(null);
		setModalVisible(false);
	};

	// --- Função para escolher a foto ---

	const handleEscolherFoto = async () => {
		// Pede permissão para acessar a galeria
		const { status } =
			await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				'Desculpe, precisamos de permissão para acessar suas fotos.',
			);
			return;
		}

		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1], // Força uma foto quadrada
			quality: 0.5,
		});

		if (!result.canceled) {
			setFotoUri(result.assets[0].uri);
		}
	};

	// --- Função para adicionar o ingrediente ---

	const handleAdicionarIngrediente = () => {
		if (!nomeIngrediente || !quantidade || !unidade) {
			Alert.alert('Erro', 'Por favor, preencha todos os campos.');
			return;
		}

		const novoIngrediente: Ingrediente = {
			id: String(Date.now()), // ID único baseado no timestamp
			nome: nomeIngrediente,
			qtd: quantidade,
			unidade: unidade,
			foto: fotoUri,
		};

		// Adiciona o novo ingrediente à lista de ingredientes
		setIngredientes((ingredientesAtuais) => [
			...ingredientesAtuais,
			novoIngrediente,
		]);

		// Fecha o modal e limpa o formulário
		handleFecharModal();
	};

	// --- Funções de Layout ---

	const toggleLayout = () => {
		setLayoutMode(layoutMode === 'grid' ? 'list' : 'grid');
	};

	// --- Renderização do Item (para FlatList) ---

	// Tipando o parâmetro 'item'
	const renderIngrediente = ({ item }: { item: Ingrediente }) => {
		const styleItem =
			layoutMode === 'grid' ? itemGridStyles : itemListStyles;

		return (
			<View style={styleItem.container}>
				<Image
					source={
						item.foto
							? { uri: item.foto }
							: require('../../assets/placeholder.jpg') // Caminho relativo ajustado
					}
					style={styleItem.image}
				/>
				<View style={styleItem.textContainer}>
					<Text style={styleItem.nome}>{item.nome}</Text>
					<Text style={styleItem.qtd}>
						{item.qtd} {item.unidade}
					</Text>
				</View>
			</View>
		);
	};

	return (
		// SafeAreaView é importante para não sobrepor a barra de status/notch
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				{/* --- Header com Título e Botão de Layout --- */}
				<View style={styles.header}>
					<Text style={styles.titulo}>Meus Ingredientes</Text>
					<Button
						title={layoutMode === 'grid' ? 'Lista' : 'Grade'}
						onPress={toggleLayout}
					/>
				</View>

				{/* --- Lista / Grade de Ingredientes --- */}
				<FlatList
					data={ingredientes}
					renderItem={renderIngrediente}
					keyExtractor={(item) => item.id}
					key={layoutMode} // Truque para forçar re-renderização ao trocar layout
					numColumns={layoutMode === 'grid' ? 2 : 1}
					contentContainerStyle={styles.listContent}
				/>

				{/* --- Botão Flutuante de Adicionar (+) --- */}
				<TouchableOpacity
					style={styles.fab}
					onPress={handleAbrirModal}
				>
					<Text style={styles.fabText}>+</Text>
				</TouchableOpacity>

				{/* --- Pop-up (Modal) para Adicionar Ingrediente --- */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={modalVisible}
					onRequestClose={handleFecharModal}
				>
					{/* Usamos uma View com 'flex: 1' e fundo semi-transparente para o overlay */}
					<View style={styles.modalOverlay}>
						<View style={styles.modalContent}>
							<Text style={styles.modalTitle}>
								Adicionar Ingrediente
							</Text>

							<TouchableOpacity
								style={styles.fotoPicker}
								onPress={handleEscolherFoto}
							>
								{fotoUri ? (
									<Image
										source={{ uri: fotoUri }}
										style={styles.fotoPreview}
									/>
								) : (
									<Text>Escolher Foto</Text>
								)}
							</TouchableOpacity>

							<TextInput
								style={styles.input}
								placeholder="Nome do Ingrediente"
								value={nomeIngrediente}
								onChangeText={setNomeIngrediente}
								placeholderTextColor="#999"
							/>
							<View style={styles.row}>
								<TextInput
									style={[styles.input, styles.inputMetade]}
									placeholder="Qtd."
									keyboardType="numeric"
									value={quantidade}
									onChangeText={setQuantidade}
									placeholderTextColor="#999"
								/>
								<TextInput
									style={[styles.input, styles.inputMetade]}
									placeholder="Unidade (g, ml, un)"
									value={unidade}
									onChangeText={setUnidade}
									placeholderTextColor="#999"
								/>
							</View>

							<View style={styles.modalButtons}>
								<Button
									title="Cancelar"
									onPress={handleFecharModal}
									color="red"
								/>
								<Button
									title="Adicionar"
									onPress={handleAdicionarIngrediente}
								/>
							</View>
						</View>
					</View>
				</Modal>
			</View>
		</SafeAreaView>
	);
}

// --- ESTA É A CORREÇÃO ---
// Definimos os estilos dos itens FORA do StyleSheet.create.
// Isso nos permite agrupá-los (container, image, etc.)
// Usamos "as ViewStyle" para ajudar o TypeScript.

/* const itemGridStyles = {
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    marginHorizontal: 5,
    width: itemGridSize,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  } as ViewStyle,
  image: {
    width: itemGridSize - 20,
    height: itemGridSize - 20,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#eee', // Fundo para a imagem
  } as ImageStyle,
  textContainer: {
    alignItems: 'center',
  } as ViewStyle,
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,
  qtd: {
    fontSize: 14,
    color: 'grey',
  } as TextStyle,
}; */

/* const itemListStyles = {
	container: {
		backgroundColor: 'white',
		borderRadius: 8,
		padding: 10,
		marginBottom: 10,
		flexDirection: 'row',
		alignItems: 'center',
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 1.41,
	} as ViewStyle,
	image: {
		width: 60,
		height: 60,
		borderRadius: 8,
		marginRight: 10,
		backgroundColor: '#eee', // Fundo para a imagem
	} as ImageStyle,
	textContainer: {
		flex: 1,
	} as ViewStyle,
	nome: {
		fontSize: 18,
		fontWeight: 'bold',
	} as TextStyle,
	qtd: {
		fontSize: 16,
		color: 'grey',
	} as TextStyle,
 };*/
