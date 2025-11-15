import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    deleteRecipe,
    getRecipe,
    listRecipes,
    RecipeListItem,
    SavedRecipe,
} from '../../services/recipe_service';

export default function RecipesScreen() {
	const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
	const [filteredRecipes, setFilteredRecipes] = useState<RecipeListItem[]>([]);
	const [searchText, setSearchText] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [isLoadingDetail, setIsLoadingDetail] = useState(false);

	useFocusEffect(
		React.useCallback(() => {
			loadRecipes();
		}, [])
	);

	const loadRecipes = async () => {
		try {
			setIsLoading(true);
			const data = await listRecipes();
			setRecipes(data);
			setFilteredRecipes(data);
		} catch (error) {
			console.error('Erro ao carregar receitas:', error);
			Alert.alert('Erro', 'Não foi possível carregar as receitas.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearch = (text: string) => {
		setSearchText(text);
		
		if (text.trim() === '') {
			setFilteredRecipes(recipes);
		} else {
			const filtered = recipes.filter((recipe) =>
				recipe.name.toLowerCase().includes(text.toLowerCase())
			);
			setFilteredRecipes(filtered);
		}
	};

	const handleRecipePress = async (recipeId: string) => {
		try {
			setIsLoadingDetail(true);
			setModalVisible(true);
			const recipe = await getRecipe(recipeId);
			setSelectedRecipe(recipe);
		} catch (error) {
			console.error('Erro ao carregar receita:', error);
			Alert.alert('Erro', 'Não foi possível carregar os detalhes da receita.');
			setModalVisible(false);
		} finally {
			setIsLoadingDetail(false);
		}
	};

	const handleDeleteRecipe = async (recipeId: string) => {
		Alert.alert(
			'Confirmar exclusão',
			'Tem certeza que deseja excluir esta receita?',
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir',
					style: 'destructive',
					onPress: async () => {
						try {
							await deleteRecipe(recipeId);
							Alert.alert('Sucesso', 'Receita excluída com sucesso!');
							setModalVisible(false);
							loadRecipes();
						} catch (error) {
							console.error('Erro ao excluir receita:', error);
							Alert.alert('Erro', 'Não foi possível excluir a receita.');
						}
					},
				},
			]
		);
	};

	const renderRecipeItem = ({ item }: { item: RecipeListItem }) => {
		const date = new Date(item.created_at);
		const formattedDate = date.toLocaleDateString('pt-BR');

		return (
			<TouchableOpacity
				style={styles.recipeCard}
				onPress={() => handleRecipePress(item.id)}
			>
				<View style={styles.recipeHeader}>
					<Text style={styles.recipeName}>{item.name}</Text>
					<Text style={styles.recipeDate}>{formattedDate}</Text>
				</View>
				<Text style={styles.recipeInfo}>
					{item.ingredients_count} ingredientes
				</Text>
			</TouchableOpacity>
		);
	};

	const parsedSteps = selectedRecipe
		? JSON.parse(selectedRecipe.instructions)
		: [];

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Minhas Receitas</Text>
				<TextInput
					style={styles.searchInput}
					placeholder="Buscar receitas..."
					value={searchText}
					onChangeText={handleSearch}
					placeholderTextColor="#999"
				/>
			</View>

			{isLoading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="green" />
					<Text style={styles.loadingText}>Carregando...</Text>
				</View>
			) : (
				<FlatList
					data={filteredRecipes}
					renderItem={renderRecipeItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContainer}
					ListEmptyComponent={
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyText}>
								{searchText
									? 'Nenhuma receita encontrada'
									: 'Nenhuma receita salva ainda'}
							</Text>
							<Text style={styles.emptySubText}>
								{searchText
									? 'Tente buscar com outro termo'
									: 'Gere receitas na aba "Gerar" e salve suas favoritas!'}
							</Text>
						</View>
					}
				/>
			)}

			{/* Modal de Detalhes da Receita */}
			<Modal
				visible={modalVisible}
				animationType="slide"
				transparent={true}
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						{isLoadingDetail ? (
							<View style={styles.modalLoadingContainer}>
								<ActivityIndicator size="large" color="green" />
							</View>
						) : (
							<>
								<ScrollView showsVerticalScrollIndicator={true}>
									<Text style={styles.modalTitle}>
										{selectedRecipe?.name}
									</Text>

									<View style={styles.modalSection}>
										<Text style={styles.sectionTitle}>
											Ingredientes:
										</Text>
										{selectedRecipe?.recipe_ingredients
											.sort((a, b) => a.order - b.order)
											.map((ing) => (
												<Text
													key={ing.id}
													style={styles.ingredientItem}
												>
													• {ing.name} ({ing.quantity})
												</Text>
											))}
									</View>

									<View style={styles.modalSection}>
										<Text style={styles.sectionTitle}>
											Modo de Preparo:
										</Text>
										{parsedSteps.map((step: any) => (
											<Text
												key={step.numero}
												style={styles.stepItem}
											>
												{step.numero}. {step.descricao}
											</Text>
										))}
									</View>
								</ScrollView>

								<View style={styles.modalButtons}>
									<TouchableOpacity
										style={[styles.modalButton, styles.deleteButton]}
										onPress={() =>
											selectedRecipe &&
											handleDeleteRecipe(selectedRecipe.id)
										}
									>
										<Text style={styles.buttonText}>Excluir</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[styles.modalButton, styles.closeButton]}
										onPress={() => setModalVisible(false)}
									>
										<Text style={styles.buttonText}>Fechar</Text>
									</TouchableOpacity>
								</View>
							</>
						)}
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	header: {
		padding: 20,
		paddingTop: 40,
		backgroundColor: 'white',
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 15,
	},
	searchInput: {
		backgroundColor: '#f5f5f5',
		borderRadius: 8,
		paddingHorizontal: 15,
		paddingVertical: 10,
		fontSize: 16,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		marginTop: 10,
		color: '#666',
	},
	listContainer: {
		padding: 15,
	},
	recipeCard: {
		backgroundColor: 'white',
		borderRadius: 8,
		padding: 15,
		marginBottom: 10,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 1.41,
	},
	recipeHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 5,
	},
	recipeName: {
		fontSize: 18,
		fontWeight: 'bold',
		flex: 1,
	},
	recipeDate: {
		fontSize: 12,
		color: '#999',
	},
	recipeInfo: {
		fontSize: 14,
		color: '#666',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 100,
	},
	emptyText: {
		fontSize: 18,
		color: '#666',
		textAlign: 'center',
	},
	emptySubText: {
		fontSize: 14,
		color: '#999',
		marginTop: 10,
		textAlign: 'center',
		paddingHorizontal: 40,
	},
	// Modal styles
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
		width: '90%',
		maxHeight: '80%',
	},
	modalLoadingContainer: {
		padding: 40,
		alignItems: 'center',
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
	sectionTitle: {
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
	deleteButton: {
		backgroundColor: '#dc3545',
	},
	closeButton: {
		backgroundColor: '#666',
	},
	buttonText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 16,
	},
});
