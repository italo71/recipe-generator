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
	receitaCard: {
		backgroundColor: '#f9f9f9',
		borderRadius: 8,
		padding: 15,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	receitaCardTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 5,
	},
	receitaCardInfo: {
		fontSize: 14,
		color: '#666',
	},
});

export default function GeradorReceitaScreen() {
	const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
	const [selecionados, setSelecionados] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isGerando, setIsGerando] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	
	// Estado para as receitas geradas (lista) e modal
	const [receitasGeradas, setReceitasGeradas] = useState<GeneratedRecipe[]>([]);
	const [receitaSelecionada, setReceitaSelecionada] = useState<GeneratedRecipe | null>(null);
	const [listaModalVisible, setListaModalVisible] = useState(false);
	const [detalheModalVisible, setDetalheModalVisible] = useState(false);

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
			const response = await generateRecipe(listaParaJson);
			setReceitasGeradas(response);
			setListaModalVisible(true);
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

	const handleSelecionarReceita = (receita: GeneratedRecipe) => {
		setReceitaSelecionada(receita);
		setListaModalVisible(false);
		setDetalheModalVisible(true);
	};

	const handleSalvarReceita = async () => {
		if (!receitaSelecionada) return;

		try {
			setIsSaving(true);
			await saveRecipe(receitaSelecionada);
			
			// Fecha ambos os modais e limpa os estados
			setDetalheModalVisible(false);
			setListaModalVisible(false);
			setReceitaSelecionada(null);
			setReceitasGeradas([]);
			
			Alert.alert(
				'Sucesso!',
				'Receita salva com sucesso! Você pode vê-la na aba Receitas.'
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

	const handleFecharDetalheModal = () => {
		setDetalheModalVisible(false);
		setReceitaSelecionada(null);
		setListaModalVisible(true);
	};

	const handleFecharListaModal = () => {
		setListaModalVisible(false);
		setReceitasGeradas([]);
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

			{/* Modal da Lista de Receitas */}
			<Modal
				visible={listaModalVisible}
				animationType="slide"
				transparent={true}
				onRequestClose={handleFecharListaModal}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Receitas Geradas</Text>
						<Text style={styles.subtitulo}>
							Selecione uma receita para ver os detalhes:
						</Text>

						<FlatList
							data={receitasGeradas}
							keyExtractor={(item, index) => `receita-${index}`}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={styles.receitaCard}
									onPress={() => handleSelecionarReceita(item)}
								>
									<Text style={styles.receitaCardTitle}>
										{item.nome}
									</Text>
									<Text style={styles.receitaCardInfo}>
										{item.listaIngredientes.length} ingredientes •{' '}
										{item.passos.length} passos
									</Text>
								</TouchableOpacity>
						)}
						contentContainerStyle={{ paddingBottom: 10 }}
					/>

					<View style={styles.modalButtons}>
						<TouchableOpacity
							style={[styles.modalButton, styles.closeButton]}
							onPress={handleFecharListaModal}
						>
							<Text style={styles.modalButtonText}>Fechar</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>

			{/* Modal de Detalhes da Receita */}
			<Modal
				visible={detalheModalVisible}
				animationType="slide"
				transparent={true}
				onRequestClose={handleFecharDetalheModal}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<ScrollView showsVerticalScrollIndicator={true}>
							<Text style={styles.modalTitle}>
								{receitaSelecionada?.nome}
							</Text>

							<View style={styles.modalSection}>
								<Text style={styles.modalSectionTitle}>
									Ingredientes:
								</Text>
								{receitaSelecionada?.listaIngredientes.map((ing, index) => (
									<Text key={index} style={styles.ingredientItem}>
										• {ing.nome} ({ing.quantidade})
									</Text>
								))}
							</View>

							<View style={styles.modalSection}>
								<Text style={styles.modalSectionTitle}>
									Modo de Preparo:
								</Text>
								{receitaSelecionada?.passos.map((passo) => (
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
								onPress={handleFecharDetalheModal}
								disabled={isSaving}
							>
								<Text style={styles.modalButtonText}>Voltar</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}



