// GeradorReceitaScreen.tsx
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Button,
	Dimensions,
	FlatList,
	Image,
	Modal,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { listIngredients, Ingredient } from '../../services/ingredient_service';
import { generateRecipe, saveRecipe, GeneratedRecipe } from '../../services/recipe_service';
import { useFocusEffect } from '@react-navigation/native';

// Tipo Ingrediente
interface Ingrediente {
	id: string;
	nome: string;
	qtd: string;
	unidade: string;
	foto: string | null;
}

// 3. Estilos
const { width } = Dimensions.get('window');
const itemGridSize = width / 2 - 25;

const itemGridStyles = StyleSheet.create({
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
		borderWidth: 3,
		borderColor: 'transparent',
	},
	itemSelecionado: {
		borderColor: 'green',
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
});

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
		paddingHorizontal: 10,
		marginBottom: 5,
	},
	titulo: {
		fontSize: 24,
		fontWeight: 'bold',
	},
	subtitulo: {
		fontSize: 16,
		color: '#666',
		paddingHorizontal: 10,
		marginBottom: 15,
	},
	listContent: {
		paddingHorizontal: 10,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 50,
	},
	emptyText: {
		fontSize: 18,
		color: '#666',
	},
	emptySubText: {
		fontSize: 14,
		color: '#999',
		marginTop: 10,
	},
	botaoGerarContainer: {
		padding: 15,
		borderTopWidth: 1,
		borderTopColor: '#eee',
		backgroundColor: '#f5f5f5',
		alignItems: 'center',
	},
	// Estilos do Modal
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 20,
		width: width * 0.9,
		maxHeight: '80%',
	},
	modalTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 15,
		textAlign: 'center',
	},
	modalSection: {
		marginBottom: 15,
	},
	modalSectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8,
		color: '#333',
	},
	ingredientItem: {
		fontSize: 14,
		marginBottom: 4,
		color: '#666',
	},
	stepItem: {
		fontSize: 14,
		marginBottom: 8,
		color: '#666',
		lineHeight: 20,
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 15,
		gap: 10,
	},
	modalButton: {
		flex: 1,
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	saveButton: {
		backgroundColor: 'green',
	},
	closeButton: {
		backgroundColor: '#666',
	},
	modalButtonText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 16,
	},
});

export default function GeradorReceitaScreen() {
	const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
	const [selecionados, setSelecionados] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isGerando, setIsGerando] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	
	// Estado para a receita gerada e modal
	const [receitaGerada, setReceitaGerada] = useState<GeneratedRecipe | null>(null);
	const [modalVisible, setModalVisible] = useState(false);

	useFocusEffect(
		React.useCallback(() => {
			carregarIngredientes();
		}, [])
	);

	const carregarIngredientes = async () => {
		try {
			setIsLoading(true);
			const ingredientesApi = await listIngredients();

			// Mapeia os ingredientes da API para o formato usado no componente
			const ingredientesMapeados = ingredientesApi.map((ing: Ingredient) => ({
				id: ing.id,
				nome: ing.name,
				qtd: ing.quantity,
				unidade: ing.unit,
				foto: ing.image_url,
			}));

			setIngredientes(ingredientesMapeados);
		} catch (error) {
			console.error('Erro ao carregar ingredientes:', error);
			Alert.alert('Erro', 'Não foi possível carregar os ingredientes. Verifique sua conexão.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSelecionar = (id: string) => {
		if (selecionados.includes(id)) {
			setSelecionados(selecionados.filter((itemId) => itemId !== id));
		} else {
			setSelecionados([...selecionados, id]);
		}
	};

	const handleToggleSelecionarTudo = () => {
		if (ingredientes.length === 0) return;

		if (selecionados.length === ingredientes.length) {
			setSelecionados([]);
		} else {
			const todosOsIds = ingredientes.map((ing) => ing.id);
			setSelecionados(todosOsIds);
		}
	};

	const handleGerarReceita = async () => {
		const ingredientesFiltrados = ingredientes.filter((ing) =>
			selecionados.includes(ing.id),
		);
		const listaParaJson = ingredientesFiltrados.map((item) => ({
			Ingrediente: item.nome,
			qtd: `${item.qtd} ${item.unidade}`,
		}));

		try {
			setIsGerando(true);
			const receita = await generateRecipe(listaParaJson);
			setReceitaGerada(receita);
			setModalVisible(true);
		} catch (error: any) {
			console.error(error);
			Alert.alert(
				'Erro',
				error.response?.data?.detail || 'Não foi possível gerar a receita.',
			);
		} finally {
			setIsGerando(false);
		}
	};

	const handleSalvarReceita = async () => {
		if (!receitaGerada) return;

		try {
			setIsSaving(true);
			await saveRecipe(receitaGerada);
			Alert.alert(
				'Sucesso!',
				'Receita salva com sucesso! Você pode vê-la na aba Receitas.',
				[
					{
						text: 'OK',
						onPress: () => {
							setModalVisible(false);
							setReceitaGerada(null);
							setSelecionados([]);
						},
					},
				]
			);
		} catch (error: any) {
			console.error(error);
			Alert.alert(
				'Erro',
				error.response?.data?.detail || 'Não foi possível salvar a receita.',
			);
		} finally {
			setIsSaving(false);
		}
	};

	const handleFecharModal = () => {
		setModalVisible(false);
		setReceitaGerada(null);
	};

	const renderIngredienteGrid = ({ item }: { item: Ingrediente }) => {
		const isSelecionado = selecionados.includes(item.id);
		return (
			<TouchableOpacity
				onPress={() => handleSelecionar(item.id)}
				activeOpacity={0.7}
			>
				<View
					style={[
						itemGridStyles.container,
						isSelecionado ? itemGridStyles.itemSelecionado : {},
					]}
				>
					<Image
						source={
							item.foto
								? { uri: item.foto }
								: require('../../assets/placeholder.jpg')
						}
						style={itemGridStyles.image}
					/>
					<View style={itemGridStyles.textContainer}>
						<Text style={itemGridStyles.nome}>{item.nome}</Text>
						<Text style={itemGridStyles.qtd}>
							{item.qtd} {item.unidade}
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	const todosSelecionados =
		ingredientes.length > 0 && selecionados.length === ingredientes.length;
	const tituloBotaoMarcar = todosSelecionados
		? 'Desmarcar Todos'
		: 'Selecionar Todos';

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.titulo}>Gerar Receita</Text>
					{!isLoading && ingredientes.length > 0 && (
						<Button
							title={tituloBotaoMarcar}
							onPress={handleToggleSelecionarTudo}
							color="green"
						/>
					)}
				</View>
				<Text style={styles.subtitulo}>
					Selecione os ingredientes que você tem:
				</Text>

				{isLoading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color="green" />
						/>
						<Text style={{ marginTop: 10, color: '#666' }}>
							Carregando...
						</Text>
					</View>
				) : (
					<FlatList
						data={ingredientes}
						renderItem={renderIngredienteGrid}
						keyExtractor={(item) => item.id}
						numColumns={2}
						contentContainerStyle={styles.listContent}
						ListEmptyComponent={
							<View style={styles.emptyContainer}>
								<Text style={styles.emptyText}>
									Nenhum ingrediente encontrado
								</Text>
								<Text style={styles.emptySubText}>
									Vá para a aba "Ingredientes" para adicionar
									ingredientes.
								</Text>
							</View>
						}
						ListFooterComponent={<View style={{ height: 100 }} />}
					/>
				)}

				{!isLoading && selecionados.length >= 2 && (
					<View style={styles.botaoGerarContainer}>
						<Button
							title={
								isGerando
									? 'Gerando Receita...'
									: `Gerar Receita com (${selecionados.length}) Ingredientes`
							}
							onPress={handleGerarReceita}
							color="green"
							disabled={isGerando}
						/>
						{isGerando && (
							<ActivityIndicator
								style={{ marginTop: 10 }}
								color="green"
							/>
						)}
					</View>
				)}

				{!isLoading && ingredientes.length > 0 && selecionados.length < 2 && (
					<View style={styles.botaoGerarContainer}>
						<Text style={{ color: '#666', textAlign: 'center' }}>
							Selecione pelo menos 2 ingredientes para gerar uma receita
						</Text>
					</View>
				)}
			</View>

			{/* Modal da Receita */}
			<Modal
				visible={modalVisible}
				animationType="slide"
				transparent={true}
				onRequestClose={handleFecharModal}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<ScrollView showsVerticalScrollIndicator={true}>
							<Text style={styles.modalTitle}>
								{receitaGerada?.nome}
							</Text>

							<View style={styles.modalSection}>
								<Text style={styles.modalSectionTitle}>
									Ingredientes:
								</Text>
								{receitaGerada?.listaIngredientes.map((ing, index) => (
									<Text key={index} style={styles.ingredientItem}>
										• {ing.nome} ({ing.quantidade})
									</Text>
								))}
							</View>

							<View style={styles.modalSection}>
								<Text style={styles.modalSectionTitle}>
									Modo de Preparo:
								</Text>
								{receitaGerada?.passos.map((passo) => (
									<Text key={passo.numero} style={styles.stepItem}>
										{passo.numero}. {passo.descricao}
									</Text>
								))}
							</View>
						</ScrollView>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[styles.modalButton, styles.saveButton]}
								onPress={handleSalvarReceita}
								disabled={isSaving}
							>
								<Text style={styles.modalButtonText}>
									{isSaving ? 'Salvando...' : 'Salvar Receita'}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.modalButton, styles.closeButton]}
								onPress={handleFecharModal}
								disabled={isSaving}
							>
								<Text style={styles.modalButtonText}>Fechar</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}
