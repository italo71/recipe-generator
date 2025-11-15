import { api } from './api';
import * as SecureStore from 'expo-secure-store';

// Tipos
export interface RecipeIngredient {
  nome: string;
  quantidade: string;
}

export interface RecipeStep {
  numero: number;
  descricao: string;
}

export interface GeneratedRecipe {
  nome: string;
  listaIngredientes: RecipeIngredient[];
  passos: RecipeStep[];
}

export interface GenerateRecipeRequest {
  listaIngredientes: { Ingrediente: string; qtd: string }[];
}

export interface GenerateRecipeResponse {
  listaReceitas: GeneratedRecipe[];
}

// Para salvar receita
export interface SaveRecipeRequest {
  name: string;
  instructions: string; // JSON string dos passos
  ingredients: {
    name: string;
    quantity: string;
    order: number;
  }[];
}

export interface SavedRecipe {
  id: string;
  user_id: string;
  name: string;
  instructions: string;
  created_at: string;
  updated_at?: string;
  recipe_ingredients: {
    id: string;
    recipe_id: string;
    name: string;
    quantity: string;
    order: number;
  }[];
}

export interface RecipeListItem {
  id: string;
  name: string;
  created_at: string;
  ingredients_count: number;
}

/**
 * Gera uma receita usando IA com base nos ingredientes fornecidos
 */
export async function generateRecipe(
  ingredients: { Ingrediente: string; qtd: string }[]
): Promise<GeneratedRecipe> {
  try {
    const token = await SecureStore.getItemAsync('token');
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }
    
    const response = await api.post<GenerateRecipeResponse>(
      '/recipes/generate',
      { listaIngredientes: ingredients },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.listaReceitas && response.data.listaReceitas.length > 0) {
      return response.data.listaReceitas[0];
    }

    throw new Error('Nenhuma receita foi gerada');
  } catch (error: any) {
    console.error('Erro ao gerar receita:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Salva uma receita gerada no banco de dados
 */
export async function saveRecipe(recipe: GeneratedRecipe): Promise<SavedRecipe> {
  try {
    const token = await SecureStore.getItemAsync('token');

    // Converte os passos para JSON string
    const instructionsJson = JSON.stringify(recipe.passos);

    // Prepara os ingredientes
    const ingredients = recipe.listaIngredientes.map((ing, index) => ({
      name: ing.nome,
      quantity: ing.quantidade,
      order: index,
    }));

    const requestData: SaveRecipeRequest = {
      name: recipe.nome,
      instructions: instructionsJson,
      ingredients: ingredients,
    };

    const response = await api.post<SavedRecipe>('/recipes/save', requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Erro ao salvar receita:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Lista todas as receitas salvas do usuário
 */
export async function listRecipes(): Promise<RecipeListItem[]> {
  try {
    const token = await SecureStore.getItemAsync('token');

    const response = await api.get<RecipeListItem[]>('/recipes/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Erro ao listar receitas:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Busca uma receita específica por ID
 */
export async function getRecipe(recipeId: string): Promise<SavedRecipe> {
  try {
    const token = await SecureStore.getItemAsync('token');

    const response = await api.get<SavedRecipe>(`/recipes/${recipeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar receita:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Deleta uma receita
 */
export async function deleteRecipe(recipeId: string): Promise<void> {
  try {
    const token = await SecureStore.getItemAsync('token');

    await api.delete(`/recipes/${recipeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error('Erro ao deletar receita:', error.response?.data || error.message);
    throw error;
  }
}
