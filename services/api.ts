import axios from 'axios';

// Defina a URL base da sua API (ex: http://localhost:8000)
// Altere para o IP da sua máquina se estiver testando no emulador ou dispositivo físico
// ipconfig no Windows ou ifconfig no Mac/Linux para descobrir seu IP local (endereço IPv4)
const API_BASE_URL = 'http://192.168.19.162:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para logs de debug
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Fazendo requisição:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Timeout na requisição:', error.config?.url);
    } else if (error.message === 'Network Error') {
      console.error('🌐 Erro de rede - verifique se o backend está rodando e acessível');
    } else {
      console.error('❌ Erro na resposta:', error.response?.status, error.message);
    }
    return Promise.reject(error);
  }
);
