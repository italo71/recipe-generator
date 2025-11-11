// GeradorReceitaScreen.tsx
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Button, // Importado
	Dimensions,
	FlatList,
	Image,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
// (Imports de serviço comentados para o mock)

// 1. Tipo Ingrediente (Sem alterações)
interface Ingrediente {
	id: string;
	nome: string;
	qtd: string;
	unidade: string;
	foto: string | null;
}

// 2. Mock (Sem alterações)
const MOCK_INGREDIENTES: Ingrediente[] = [
	{
		id: '1',
		nome: 'Tomate',
		qtd: '2',
		unidade: 'un',
		foto: 'https://img.freepik.com/fotos-gratis/tomate-vermelho-isolado-no-branco_1205-1215.jpg',
	},
	{
		id: '2',
		nome: 'Cebola',
		qtd: '1',
		unidade: 'un',
		foto: 'https://img.freepik.com/fotos-gratis/cebola-isolada-no-fundo-branco_1205-1100.jpg',
	},
	{
		id: '3',
		nome: 'Alho',
		qtd: '3',
		unidade: 'dentes',
		foto: 'https://img.freepik.com/fotos-gratis/alho-isolado-em-um-fundo-branco_1302-21151.jpg',
	},
	{
		id: '4',
		nome: 'Arroz',
		qtd: '100',
		unidade: 'g',
		foto: null,
	},
	{
		id: '5',
		nome: 'Peito de Frango',
		qtd: '200',
		unidade: 'g',
		foto: 'https://img.freepik.com/fotos-gratis/file-de-peito-de-frango-cru-isolado-no-fundo-branco_1434-70.jpg',
	},
	{
		id: '6',
		nome: 'Batata',
		qtd: '2',
		unidade: 'un',
		foto: 'https://img.freepik.com/fotos-gratis/batata-crua-isolada-no-branco_1205-1136.jpg',
	},
];

// 3. Estilos (itemGridStyles sem alterações)
const { width } = Dimensions.get('window');
const itemGridSize = width / 2 - 25;

const itemGridStyles = StyleSheet.create({
	/* ... (mesmos estilos de antes) ... */
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

// --- ESTILOS PRINCIPAIS (COM MUDANÇAS) ---
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
	// --- MODIFICADO: Header agora é 'row' ---
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 10,
		marginBottom: 5, // Reduzido
	},
	titulo: {
		fontSize: 24,
		fontWeight: 'bold',
	},
	// --- MODIFICADO: Subtítulo saiu do header ---
	subtitulo: {
		fontSize: 16,
		color: '#666',
		paddingHorizontal: 10,
		marginBottom: 15, // Margem que estava no header
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
	},
});

// --- O Componente ---
export default function GeradorReceitaScreen() {
	const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
	const [selecionados, setSelecionados] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		carregarIngredientes();
	}, []);

	// carregarIngredientes (mock) (Sem alterações)
	const carregarIngredientes = async () => {
		try {
			setIsLoading(true);
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setIngredientes(MOCK_INGREDIENTES);
		} catch (error) {
			Alert.alert('Erro', 'Não foi possível carregar os ingredientes.');
		} finally {
			setIsLoading(false);
		}
	};

	// handleSelecionar (Sem alterações)
	const handleSelecionar = (id: string) => {
		if (selecionados.includes(id)) {
			setSelecionados(selecionados.filter((itemId) => itemId !== id));
		} else {
			setSelecionados([...selecionados, id]);
		}
	};

	// --- NOVA FUNÇÃO ---
	const handleToggleSelecionarTudo = () => {
		// Se a lista de ingredientes estiver vazia, não faz nada
		if (ingredientes.length === 0) return;

		// Verifica se o número de selecionados é IGUAL ao total de ingredientes
		if (selecionados.length === ingredientes.length) {
			// Se sim, todos estão marcados -> Desmarca todos (seta para array vazio)
			setSelecionados([]);
		} else {
			// Se não, (zero ou alguns marcados) -> Marca todos
			// Pega o ID de cada ingrediente e joga no array de selecionados
			const todosOsIds = ingredientes.map((ing) => ing.id);
			setSelecionados(todosOsIds);
		}
	};

	// handleGerarJson (Sem alterações)
	const handleGerarJson = () => {
		const ingredientesFiltrados = ingredientes.filter((ing) =>
			selecionados.includes(ing.id),
		);
		const listaParaJson = ingredientesFiltrados.map((item) => ({
			Ingrediente: item.nome,
			qtd: `${item.qtd} ${item.unidade}`,
		}));
		const jsonOutput = {
			listaIngredientes: listaParaJson,
		};
		const jsonString = JSON.stringify(jsonOutput, null, 2);
		Alert.alert('JSON Gerado!', jsonString, [{ text: 'OK' }], {
			cancelable: true,
		});
		console.log(jsonString);
	};

	// renderIngredienteGrid (Sem alterações)
	const renderIngredienteGrid = ({ item }: { item: Ingrediente }) => {
		/* ... (mesmo código de render) ... */
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

	// --- NOVO: Variável para o título do botão ---
	const todosSelecionados =
		ingredientes.length > 0 && selecionados.length === ingredientes.length;
	const tituloBotaoMarcar = todosSelecionados
		? 'Desmarcar Todos'
		: 'Selecionar Todos';

	// --- JSX (RETURN) ---
	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				{/* --- MODIFICADO: Header e Subtítulo --- */}
				<View style={styles.header}>
					<Text style={styles.titulo}>Gerar Receita</Text>

					{/* --- NOVO BOTÃO (Só aparece se a lista não estiver vazia) --- */}
					{!isLoading && ingredientes.length > 0 && (
						<Button
							title={tituloBotaoMarcar}
							onPress={handleToggleSelecionarTudo}
							color="green" // Opcional, para combinar
						/>
					)}
				</View>
				{/* Subtítulo agora fica fora do header */}
				<Text style={styles.subtitulo}>
					Selecione os ingredientes que você tem:
				</Text>

				{/* --- Restante do JSX (Sem alterações) --- */}
				{isLoading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator
							size="large"
							color="green"
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
									Nenhum ingrediente
								</Text>
								<Text style={styles.emptySubText}>
									Vá para a tela de cadastro para adicionar
									itens.
								</Text>
							</View>
						}
						// Adiciona um espaço extra no final para o botão não tampar
						ListFooterComponent={<View style={{ height: 80 }} />}
					/>
				)}

				{selecionados.length >= 2 && (
					<View style={styles.botaoGerarContainer}>
						<Button
							title={`Gerar Receita com (${selecionados.length}) Ingredientes`}
							onPress={handleGerarJson}
							color="green"
						/>
					</View>
				)}
			</View>
		</SafeAreaView>
	);
}
