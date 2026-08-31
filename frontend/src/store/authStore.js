import { create } from 'zustand';
import axios, { API_URL } from '../util/api.js';

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isLoggingOut: false,
    isChangingPassword: false,
    isCheckingAuth: true,
    signupError: null,
    loginError: null,
    verifyError: null,
    forgetPasswordError: null,
    resetPasswordError: null,
    changePasswordError: null,
    message: null,

    clearAuthError: (field) => set({ [field]: null }),

    signup: async (email, password, username) => {
        set({ isLoading: true, signupError: null });

        try {
            const response = await axios.post(`${API_URL}/signup`, {
                email,
                password,
                username,
            });

            const user = response?.data?.user;

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
            return user;
        } catch (error) {
            set({
                user: null,
                isAuthenticated: false,
                signupError: error?.response?.data?.message || 'Signup failed',
                isLoading: false,
            });
            throw error;
        }
    },

    verifyMail: async (code) => {
        set({ isLoading: true, verifyError: null });

        try {
            const response = await axios.post(`${API_URL}/verifyEmail`, {
                code,
            });

            const user = response?.data?.user;

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
            return user;
        } catch (error) {
            set({
                verifyError:
                    error?.response?.data?.message ||
                    'Email verification failed',
                isLoading: false,
            });
            throw error;
        }
    },

    resendVerification: async () => {
        set({ isLoading: true, verifyError: null });

        try {
            const response = await axios.post(`${API_URL}/resendVerification`);
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({
                verifyError:
                    error?.response?.data?.message ||
                    'Failed to resend verification code',
                isLoading: false,
            });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, loginError: null });

        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password,
            });

            const user = response?.data?.user;

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
            return user;
        } catch (error) {
            set({
                user: null,
                isAuthenticated: false,
                loginError: error?.response?.data?.message || 'Login failed',
                isLoading: false,
            });
            throw error;
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true });

        const setAuthenticated = (user) => {
            set({
                user,
                isAuthenticated: true,
                isCheckingAuth: false,
            });
        };

        const setUnauthenticated = () => {
            set({
                user: null,
                isAuthenticated: false,
                isCheckingAuth: false,
            });
        };

        try {
            const response = await axios.get(`${API_URL}/refreshServer`);
            const user = response?.data?.user;
            if (!user) throw new Error('No user found');
            setAuthenticated(user);
        } catch {
            try {
                const response = await axios.post(`${API_URL}/refresh`);
                const user = response?.data?.user;
                if (!user) throw new Error('No user found');
                setAuthenticated(user);
            } catch {
                setUnauthenticated();
            }
        }
    },

    logout: async () => {
        set({ isLoggingOut: true });

        try {
            await axios.post(`${API_URL}/logout`);
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            set({
                user: null,
                isAuthenticated: false,
                isLoggingOut: false,
            });
        }
    },

    forgetPassword: async (email) => {
        set({ isLoading: true, forgetPasswordError: null, message: null });

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
                forgetPasswordError:
                    error?.response?.data?.message ||
                    'Failed to send reset email',
                isLoading: false,
            });
            throw error;
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, resetPasswordError: null, message: null });

        try {
            const response = await axios.post(
                `${API_URL}/resetPassword/${token}`,
                { password }
            );

            set({
                message: response?.data?.message,
                isLoading: false,
                user: null,
                isAuthenticated: false,
            });
            return response.data;
        } catch (error) {
            set({
                resetPasswordError:
                    error?.response?.data?.message || 'Password reset failed',
                isLoading: false,
            });
            throw error;
        }
    },

    changePassword: async (currentPassword, newPassword) => {
        set({ isChangingPassword: true, changePasswordError: null });

        try {
            const response = await axios.post(`${API_URL}/changePassword`, {
                currentPassword,
                newPassword,
            });

            const user = response?.data?.user;

            set({
                user,
                isChangingPassword: false,
            });
            return response.data;
        } catch (error) {
            set({
                changePasswordError:
                    error?.response?.data?.message ||
                    'Failed to change password',
                isChangingPassword: false,
            });
            throw error;
        }
    },
}));
