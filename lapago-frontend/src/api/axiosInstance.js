import axios from 'axios';

// Ganti IP di bawah dengan IPv4 laptop Anda yang didapat dari ipconfig
const API_URL = 'http://192.168.1.7:3000/api'; 

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 5000, // Timeout 5 detik
    headers: {
        'Content-Type': 'application/json',
    }
});

export default axiosInstance;