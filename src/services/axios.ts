import axios from 'axios';

const axiosInstance = axios.create({
  baseURL:import.meta.env.VITE_PROD_API_URL || import.meta.env.VITE_API_URL_NGROK || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});


// function hitBackend() {
//   fetch(import.meta.env.VITE_PROD_API_URL + "/h")
//     .then(r => r.text())
//     .then(console.log)
//     .catch(console.error);
// }


// setInterval(hitBackend, 300000);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // console.log('📥 API Response:', {
    //   url: response.config.url,
    //   status: response.status,
    //   data: response.data
    // });
    return response;

  },
  async (error) => {
    // console.log('📤 API Error:', {
    //   url: error.config.url,
    //   status: error.response?.status,
    //   data: error.response?.data
    // });
    if (error.response?.status === 401) {
     
      window.location.href = '/login?=expired=1';
    }
    throw error;
  }
);

export default axiosInstance;
