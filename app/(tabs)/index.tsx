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

// --- (Estilos originais, sem alteração) ---
const { width } = Dimensions.get('window');
const itemGridSize = width / 2 - 25;

// ... (itemGridStyles e itemListStyles permanecem os mesmos)
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
// --- (Fim dos estilos de item) ---

// --- StyleSheet principal ---
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
	// Estilos do Modal de Formulário (Adicionar/Editar)
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
	// --- NOVO: Estilos para o Modal de Opções ---
	optionsModalContent: {
		width: '80%',
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 20,
		alignItems: 'center',
		elevation: 5,
	},
	optionsButton: {
		width: '100%',
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		alignItems: 'center',
	},
	optionsButtonText: {
		fontSize: 18,
		color: '#007AFF', // Cor azul (padrão iOS)
	},
	optionsButtonTextDanger: {
		fontSize: 18,
		color: 'red',
	},
	optionsButtonClose: {
		width: '100%',
		paddingVertical: 15,
		alignItems: 'center',
		marginTop: 10,
	},
	optionsButtonTextClose: {
		fontSize: 18,
		fontWeight: 'bold',
		color: 'grey',
	},
});

export default function HomeScreen() {
	// --- Estados Principais ---
	const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
	const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

	// --- MODIFICADO: Estados do Modal de Formulário (Adicionar/Editar) ---
	const [modalVisible, setModalVisible] = useState(false); // Modal do formulário
	const [modoEdicao, setModoEdicao] = useState(false); // Controla se estamos Adicionando ou Editando

	// --- NOVO: Estados do Modal de Opções (Editar/Remover) ---
	const [optionsModalVisible, setOptionsModalVisible] = useState(false);
	const [ingredienteSelecionado, setIngredienteSelecionado] =
		useState<Ingrediente | null>(null);

	// --- Estados para o formulário do modal ---
	const [nomeIngrediente, setNomeIngrediente] = useState('');
	const [quantidade, setQuantidade] = useState('');
	const [unidade, setUnidade] = useState('');
	const [fotoUri, setFotoUri] = useState<string | null>(null);

	// --- Funções do Modal de Formulário (Adicionar/Editar) ---

	// --- MODIFICADO: Limpa o formulário e reseta os modos ---
	const handleFecharModal = () => {
		setNomeIngrediente('');
		setQuantidade('');
		setUnidade('');
		setFotoUri(null);
		setModalVisible(false);
		setModoEdicao(false); // --- NOVO
		setIngredienteSelecionado(null); // --- NOVO
	};

	// --- MODIFICADO: Abre o modal para ADICIONAR (modoEdicao = false) ---
	const handleAbrirModalAdicionar = () => {
		setModoEdicao(false); // Garante que não está em modo de edição
		setModalVisible(true);
	};

	// --- NOVO: Abre o modal para EDITAR (pré-preenche os dados) ---
	const handleAbrirModalEditar = () => {
		if (!ingredienteSelecionado) return;

		setModoEdicao(true); // Ativa o modo de edição

		// Preenche o formulário com os dados do ingrediente selecionado
		setNomeIngrediente(ingredienteSelecionado.nome);
		setQuantidade(ingredienteSelecionado.qtd);
		setUnidade(ingredienteSelecionado.unidade);
		setFotoUri(ingredienteSelecionado.foto);

		setOptionsModalVisible(false); // Fecha o modal de opções
		setModalVisible(true); // Abre o modal de formulário
	};

	// --- Funções de Escolha de Foto (Sem alteração) ---
	const abrirCamera = async () => {
		/* ... (seu código original) ... */
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				'Permissão necessária',
				'Desculpe, precisamos de permissão para acessar sua câmera.',
			);
			return;
		}
		let result = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.5,
		});
		if (!result.canceled) {
			setFotoUri(result.assets[0].uri);
		}
	};
	const abrirGaleria = async () => {
		/* ... (seu código original) ... */
		const { status } =
			await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				'Permissão necessária',
				'Desculpe, precisamos de permissão para acessar suas fotos.',
			);
			return;
		}
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.5,
		});
		if (!result.canceled) {
			setFotoUri(result.assets[0].uri);
		}
	};
	const handleEscolherFoto = async () => {
		/* ... (seu código original) ... */
		Alert.alert(
			'Adicionar Foto',
			'Escolha de onde você quer adicionar a foto:',
			[
				{ text: 'Tirar Foto...', onPress: abrirCamera },
				{ text: 'Escolher da Galeria...', onPress: abrirGaleria },
				{ text: 'Cancelar', style: 'cancel' },
			],
			{ cancelable: true },
		);
	};

	// --- Funções de CRUD (Create, Read, Update, Delete) ---

	// 1. CREATE (Adicionar)
	const handleAdicionarIngrediente = () => {
		if (!nomeIngrediente || !quantidade || !unidade) {
			Alert.alert('Erro', 'Por favor, preencha todos os campos.');
			return;
		}
		const novoIngrediente: Ingrediente = {
			id: String(Date.now()),
			nome: nomeIngrediente,
			qtd: quantidade,
			unidade: unidade,
			foto: fotoUri,
		};
		setIngredientes((ingredientesAtuais) => [
			...ingredientesAtuais,
			novoIngrediente,
		]);
		handleFecharModal();
	};

	// 2. UPDATE (Salvar Edição) --- NOVO ---
	const handleSalvarEdicao = () => {
		if (!ingredienteSelecionado) return;

		// Atualiza a lista usando 'map'
		setIngredientes((ingredientesAtuais) =>
			ingredientesAtuais.map((ing) => {
				// Se o ID for o mesmo do ingrediente selecionado...
				if (ing.id === ingredienteSelecionado.id) {
					// ...retorna o ingrediente com os dados ATUALIZADOS do formulário
					return {
						...ing, // Mantém o ID original
						nome: nomeIngrediente,
						qtd: quantidade,
						unidade: unidade,
						foto: fotoUri,
					};
				}
				// Senão, retorna o ingrediente como ele estava
				return ing;
			}),
		);

		handleFecharModal(); // Fecha e limpa o modal de formulário
	};

	// 3. DELETE (Remover) --- NOVO ---
	const handleRemoverIngrediente = () => {
		if (!ingredienteSelecionado) return;

		// Mostra um alerta de confirmação
		Alert.alert(
			'Remover Ingrediente',
			`Tem certeza que deseja remover "${ingredienteSelecionado.nome}"?`,
			[
				{
					text: 'Cancelar',
					style: 'cancel',
					onPress: () => setOptionsModalVisible(false), // Apenas fecha o modal de opções
				},
				{
					text: 'Remover',
					style: 'destructive',
					onPress: () => {
						// Filtra a lista, mantendo todos EXCETO o selecionado
						setIngredientes((ingredientesAtuais) =>
							ingredientesAtuais.filter(
								(ing) => ing.id !== ingredienteSelecionado.id,
							),
						);
						setOptionsModalVisible(false); // Fecha o modal de opções
						setIngredienteSelecionado(null); // Limpa a seleção
					},
				},
			],
		);
	};

	// --- Funções de Layout (Sem alteração) ---
	const toggleLayout = () => {
		setLayoutMode(layoutMode === 'grid' ? 'list' : 'grid');
	};

	// --- MODIFICADO: Renderização do Item (para FlatList) ---
	const renderIngrediente = ({ item }: { item: Ingrediente }) => {
		const styleItem =
			layoutMode === 'grid' ? itemGridStyles : itemListStyles;

		// --- NOVO: Função para abrir o modal de opções ---
		const onPressItem = () => {
			setIngredienteSelecionado(item); // Guarda qual item foi clicado
			setOptionsModalVisible(true); // Abre o modal de opções
		};

		return (
			// --- MODIFICADO: Adicionado TouchableOpacity ---
			<TouchableOpacity onPress={onPressItem}>
				<View style={styleItem.container}>
					<Image
						source={
							item.foto
								? { uri: item.foto }
								: require('../../assets/placeholder.jpg')
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
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				{/* --- Header (Sem alteração) --- */}
				<View style={styles.header}>
					<Text style={styles.titulo}>Meus Ingredientes</Text>
					<Button
						title={layoutMode === 'grid' ? 'Lista' : 'Grade'}
						onPress={toggleLayout}
					/>
				</View>

				{/* --- Lista / Grade (Sem alteração) --- */}
				<FlatList
					data={ingredientes}
					renderItem={renderIngrediente}
					keyExtractor={(item) => item.id}
					key={layoutMode}
					numColumns={layoutMode === 'grid' ? 2 : 1}
					contentContainerStyle={styles.listContent}
				/>

				{/* --- Botão Flutuante de Adicionar (+) --- */}
				<TouchableOpacity
					style={styles.fab}
					onPress={handleAbrirModalAdicionar} // --- MODIFICADO ---
				>
					<Text style={styles.fabText}>+</Text>
				</TouchableOpacity>

				{/* --- MODIFICADO: Modal (Formulário) para Adicionar/Editar --- */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={modalVisible}
					onRequestClose={handleFecharModal}
				>
					<View style={styles.modalOverlay}>
						<View style={styles.modalContent}>
							<Text style={styles.modalTitle}>
								{modoEdicao
									? 'Editar Ingrediente'
									: 'Adicionar Ingrediente'}
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
									// --- MODIFICADO: Título e Ação dinâmicos ---
									title={modoEdicao ? 'Salvar' : 'Adicionar'}
									onPress={
										modoEdicao
											? handleSalvarEdicao
											: handleAdicionarIngrediente
									}
								/>
							</View>
						</View>
					</View>
				</Modal>

				{/* --- NOVO: Modal de Opções (Editar/Remover) --- */}
				<Modal
					animationType="fade" // 'fade' é bom para popups rápidos
					transparent={true}
					visible={optionsModalVisible}
					onRequestClose={() => setOptionsModalVisible(false)}
				>
					{/* Overlay semi-transparente */}
					<View style={styles.modalOverlay}>
						<View style={styles.optionsModalContent}>
							{/* Título (opcional, mas bom) */}
							<Text style={styles.modalTitle}>
								{ingredienteSelecionado?.nome}
							</Text>

							{/* Botão Editar */}
							<TouchableOpacity
								style={styles.optionsButton}
								onPress={handleAbrirModalEditar}
							>
								<Text style={styles.optionsButtonText}>
									Editar
								</Text>
							</TouchableOpacity>

							{/* Botão Remover */}
							<TouchableOpacity
								style={styles.optionsButton}
								onPress={handleRemoverIngrediente}
							>
								<Text style={styles.optionsButtonTextDanger}>
									Remover
								</Text>
							</TouchableOpacity>

							{/* Botão Fechar */}
							<TouchableOpacity
								style={styles.optionsButtonClose}
								onPress={() => setOptionsModalVisible(false)}
							>
								<Text style={styles.optionsButtonTextClose}>
									Fechar
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			</View>
		</SafeAreaView>
	);
}
