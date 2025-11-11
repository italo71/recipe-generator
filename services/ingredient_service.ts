import { api } from './api';

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  image_url: string | null;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateIngredientDTO {
  name: string;
  quantity: string;
  unit: string;
  image_url?: string | null;
}

export interface UpdateIngredientDTO {
  name?: string;
  quantity?: string;
  unit?: string;
  image_url?: string | null;
}

/**
 * Lista todos os ingredientes do usuário autenticado
 */
export const listIngredients = async (): Promise<Ingredient[]> => {
  try {
    const response = await api.get('/ingredients/');
    return response.data;
  } catch (error) {
    console.error('Erro ao listar ingredientes:', error);
    throw error;
  }
};

/**
 * Busca um ingrediente específico por ID
 */
export const getIngredient = async (id: string): Promise<Ingredient> => {
  try {
    const response = await api.get(`/ingredients/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar ingrediente ${id}:`, error);
    throw error;
  }
};

/**
 * Cria um novo ingrediente
 */
export const createIngredient = async (
  data: CreateIngredientDTO
): Promise<Ingredient> => {
  try {
    const response = await api.post('/ingredients/', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar ingrediente:', error);
    throw error;
  }
};

/**
 * Atualiza um ingrediente existente
 */
export const updateIngredient = async (
  id: string,
  data: UpdateIngredientDTO
): Promise<Ingredient> => {
  try {
    const response = await api.put(`/ingredients/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar ingrediente ${id}:`, error);
    throw error;
  }
};

/**
 * Remove um ingrediente
 */
export const deleteIngredient = async (id: string): Promise<void> => {
  try {
    await api.delete(`/ingredients/${id}`);
  } catch (error) {
    console.error(`Erro ao deletar ingrediente ${id}:`, error);
    throw error;
  }
};
