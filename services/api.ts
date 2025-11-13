import axios from 'axios';

// Defina a URL base da sua API (ex: http://localhost:8000)
// Altere para o IP da sua máquina se estiver testando no emulador ou dispositivo físico
// ipconfig no Windows ou ifconfig no Mac/Linux para descobrir seu IP local (endereço IPv4)
const API_BASE_URL = 'http://172.20.10.6:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
