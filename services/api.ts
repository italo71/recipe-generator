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
});
