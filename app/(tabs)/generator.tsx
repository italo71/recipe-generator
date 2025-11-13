// GeradorReceitaScreen.tsx
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Button,
	Dimensions,
	FlatList,
	Image,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { listIngredients, Ingredient } from '../../services/ingredient_service';
import { useFocusEffect } from '@react-navigation/native';

// 1. Tipo Ingrediente (Sem alterações)
interface Ingrediente {
	id: string;
	nome: string;
	qtd: string;
	unidade: string;
	foto: string | null;
}

// --- NOVO: Tipos para a Resposta da Receita ---
interface IngredienteReceita {
	nome: string;
	quantidade: string;
}

interface PassoReceita {
	numero: number;
	descricao: string;
}

interface Receita {
	nome: string;
	listaIngredientes: IngredienteReceita[];
	passos: PassoReceita[];
}

interface ApiResponseReceitas {
	listaReceitas: Receita[];
}

// --- NOVO: Função Mock para simular a API de gerar receita ---
/**
 * Simula o envio dos ingredientes para a API e o recebimento de uma receita.
 */
const simularApiGerarReceita = async (
	ingredientesEnviados: any,
): Promise<ApiResponseReceitas> => {
	console.log(
		'--- ENVIANDO PARA API (MOCK) ---',
		JSON.stringify(ingredientesEnviados, null, 2),
	);

	// Simula um delay de rede de 2 segundos
	await new Promise((resolve) => setTimeout(resolve, 2000));

	console.log('--- RESPOSTA DA API (MOCK) RECEBIDA ---');

	// Simula uma resposta bem-sucedida
	const mockResposta: ApiResponseReceitas = {
		listaReceitas: [
			{
				nome: 'Molho de Tomate Caseiro',
				listaIngredientes: [
					{ nome: 'Tomate', quantidade: '2 unidades' },
					{ nome: 'Cebola', quantidade: '1 unidade' },
					{ nome: 'Alho', quantidade: '3 dentes' },
					{ nome: 'Azeite', quantidade: '2 colheres' },
					{ nome: 'Sal', quantidade: 'a gosto' },
				],
				passos: [
					{
						numero: 1,
						descricao: 'Pique o tomate, a cebola e o alho.',
					},
					{
						numero: 2,
						descricao:
							'Refogue a cebola e o alho no azeite até dourar.',
					},
					{
						numero: 3,
						descricao:
							'Adicione o tomate picado e cozinhe em fogo baixo.',
					},
					{
						numero: 4,
						descricao:
							'Tempere com sal e deixe apurar por 15 minutos.',
					},
				],
			},
		],
	};

	return mockResposta;
};

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
});

// --- O Componente ---
export default function GeradorReceitaScreen() {
	const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
	const [selecionados, setSelecionados] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false); // Loading da lista inicial
	const [isGerando, setIsGerando] = useState(false); // --- NOVO: Loading do botão Gerar

	// Usar useFocusEffect para recarregar quando a tela receber foco
	useFocusEffect(
		React.useCallback(() => {
			carregarIngredientes();
		}, [])
	);

	// carregarIngredientes agora busca da API real
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

	// handleSelecionar (Sem alterações)
	const handleSelecionar = (id: string) => {
		if (selecionados.includes(id)) {
			setSelecionados(selecionados.filter((itemId) => itemId !== id));
		} else {
			setSelecionados([...selecionados, id]);
		}
	};

	// handleToggleSelecionarTudo (Sem alterações)
	const handleToggleSelecionarTudo = () => {
		if (ingredientes.length === 0) return;

		if (selecionados.length === ingredientes.length) {
			setSelecionados([]);
		} else {
			const todosOsIds = ingredientes.map((ing) => ing.id);
			setSelecionados(todosOsIds);
		}
	};

	// --- NOVO: Função para formatar e exibir a receita no Alert ---
	const mostrarReceita = (receita: Receita) => {
		// Formata a string para o Alert
		let mensagem = 'Ingredientes:\n';
		receita.listaIngredientes.forEach((ing) => {
			mensagem += `• ${ing.nome} (${ing.quantidade})\n`;
		});

		mensagem += '\nModo de Preparo:\n';
		receita.passos.forEach((passo) => {
			mensagem += `${passo.numero}. ${passo.descricao}\n`;
		});

		Alert.alert(
			receita.nome, // Título do Alert
			mensagem, // Corpo do Alert
			[{ text: 'OK' }],
			{ cancelable: true },
		);
	};

	// --- MODIFICADO: Antiga handleGerarJson agora é handleGerarReceita e é async ---
	const handleGerarReceita = async () => {
		// 1. Prepara o JSON de *envio*
		const ingredientesFiltrados = ingredientes.filter((ing) =>
			selecionados.includes(ing.id),
		);
		const listaParaJson = ingredientesFiltrados.map((item) => ({
			Ingrediente: item.nome,
			qtd: `${item.qtd} ${item.unidade}`,
		}));

		const jsonRequest = {
			listaIngredientes: listaParaJson,
		};

		// 2. Inicia o loading e chama a API
		try {
			setIsGerando(true); // Ativa o loading do botão
			const resposta = await simularApiGerarReceita(jsonRequest);

			// 3. Processa a resposta
			if (resposta.listaReceitas && resposta.listaReceitas.length > 0) {
				// Pega a primeira receita da lista
				const receitaRecebida = resposta.listaReceitas[0];
				mostrarReceita(receitaRecebida);
			} else {
				Alert.alert(
					'Nenhuma receita',
					'Não foi possível encontrar uma receita com esses ingredientes.',
				);
			}
		} catch (error) {
			console.error(error);
			Alert.alert(
				'Erro',
				'Ocorreu um problema ao se comunicar com o servidor.',
			);
		} finally {
			// 4. Para o loading
			setIsGerando(false);
		}
	};

	// renderIngredienteGrid (Sem alterações)
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
								: require('../../assets/placeholder.jpg') // Verifique se esse caminho está correto
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

	// Variável para o título do botão (Sem alterações)
	const todosSelecionados =
		ingredientes.length > 0 && selecionados.length === ingredientes.length;
	const tituloBotaoMarcar = todosSelecionados
		? 'Desmarcar Todos'
		: 'Selecionar Todos';

	// --- JSX (RETURN) ---
	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				{/* Header e Subtítulo (Sem alterações) */}
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

				{/* Loading Inicial ou Lista (Sem alterações) */}
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
									Nenhum ingrediente encontrado
								</Text>
								<Text style={styles.emptySubText}>
									Vá para a aba "Ingredientes" para adicionar
									ingredientes e poder gerar receitas.
								</Text>
							</View>
						}
						ListFooterComponent={<View style={{ height: 100 }} />}
					/>
				)}

				{/* Botão de Gerar Receita */}
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

				{/* Mensagem quando não há ingredientes suficientes */}
				{!isLoading && ingredientes.length > 0 && selecionados.length < 2 && (
					<View style={styles.botaoGerarContainer}>
						<Text style={{ color: '#666', textAlign: 'center' }}>
							Selecione pelo menos 2 ingredientes para gerar uma receita
						</Text>
					</View>
				)}
			</View>
		</SafeAreaView>
	);
}
