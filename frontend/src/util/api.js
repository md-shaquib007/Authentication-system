import axios from 'axios';

export const API_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === 'development'
        ? 'http://localhost:5000/api/auth'
        : '/api/auth');

axios.defaults.withCredentials = true;

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = () => {
    refreshSubscribers.forEach((callback) => callback());
    refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
    refreshSubscribers.push(callback);
};

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/refresh') &&
            !originalRequest.url?.includes('/login') &&
            !originalRequest.url?.includes('/signup') &&
            !originalRequest.url?.includes('/logout')
        ) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    addRefreshSubscriber(() => resolve(axios(originalRequest)));
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post(`${API_URL}/refresh`);
                isRefreshing = false;
                onRefreshed();
                return axios(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = [];
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axios;
