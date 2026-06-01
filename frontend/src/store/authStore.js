import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000/api/auth' : '/api/auth';

// allow cookies (httpOnly refresh token)
axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    // ---------------- STATE ----------------
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isCheckingAuth: true,
    error: null,
    message: null,

    // ---------------- SIGNUP ----------------
    signup: async (email, password, username) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.post(`${API_URL}/signup`, {
                email,
                password,
                username,
            });

            const user = response?.data?.user || response?.data;

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({
                user: null,
                isAuthenticated: false,
                error: error?.response?.data?.message || 'Signup failed',
                isLoading: false,
            });
            throw error;
        }
    },

    // ---------------- VERIFY EMAIL ----------------
    verifyMail: async (code) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.post(`${API_URL}/verifyEmail`, {
                code,
            });

            const user = response?.data?.user || response?.data;

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({
                error:
                    error?.response?.data?.message ||
                    'Email verification failed',
                isLoading: false,
            });
            throw error;
        }
    },

    // ---------------- LOGIN ----------------
    login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password,
            });

            const user = response?.data?.user || response?.data;

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({
                user: null,
                isAuthenticated: false,
                error: error?.response?.data?.message || 'Login failed',
                isLoading: false,
            });
            throw error;
        }
    },

    // ---------------- CHECK AUTH (REFRESH) ----------------
    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });

        try {
            const response = await axios.get(`${API_URL}/refreshServer`);

            const user = response?.data?.user || response?.data;

            if (!user) throw new Error('No user found');

            set({
                user,
                isAuthenticated: true,
                isCheckingAuth: false,
            });
        } catch (error) {
            set({
                user: null,
                isAuthenticated: false,
                isCheckingAuth: false,
            });
        }
    },

    // ---------------- LOGOUT ----------------
    logout: async () => {
        try {
            await axios.post(`${API_URL}/logout`);
        } catch (error) {
            // even if API fails, clear frontend state
            console.error('Logout failed:', error);
        } finally {
            set({
                user: null,
                isAuthenticated: false,
            });
        }
    },

    // ---------------- FORGET PASSWORD ----------------
    forgetPassword: async (email) => {
        set({ isLoading: true, error: null, message: null });

        try {
            const response = await axios.post(`${API_URL}/forgetPassword`, {
                email,
            });

            set({
                message: response?.data?.message,
                isLoading: false,
            });
            return response.data;
        } catch (error) {
            set({
                error:
                    error?.response?.data?.message ||
                    'Failed to send reset email',
                isLoading: false,
            });
            throw error;
        }
    },

    // ---------------- RESET PASSWORD ----------------
    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null, message: null });

        try {
            const response = await axios.post(
                `${API_URL}/resetPassword/${token}`,
                { password }
            );

            set({
                message: response?.data?.message,
                isLoading: false,
            });
            return response.data;
        } catch (error) {
            set({
                error:
                    error?.response?.data?.message || 'Password reset failed',
                isLoading: false,
            });
            throw error;
        }
    },
}));
