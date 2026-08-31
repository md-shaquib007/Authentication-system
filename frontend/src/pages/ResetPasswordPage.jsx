import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../component/Input';
import PasswordStrengthMeter from '../component/PasswordStrengthMeter';
import { Lock, Loader } from 'lucide-react';
import { isPasswordValid } from '../util/validation';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [cnfPassword, setCnfPassword] = useState('');

    const { isLoading, resetPasswordError, resetPassword } = useAuthStore();

    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isPasswordValid(password)) {
            toast.error('Password does not meet requirements');
            return;
        }

        if (password !== cnfPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const response = await resetPassword(token, password);
            toast.success(response?.message || 'Password reset successfully');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Error resetting password');
        }
    };

    return (
        <motion.div
            className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                    Reset Password
                </h2>

                {resetPasswordError && (
                    <p className="text-red-500 text-sm mb-4" role="alert">
                        {resetPasswordError}
                    </p>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <Input
                        icon={Lock}
                        label="New password"
                        id="reset-password"
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        showPasswordToggle
                        autoComplete="new-password"
                    />

                    <Input
                        icon={Lock}
                        label="Confirm password"
                        id="reset-confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        value={cnfPassword}
                        onChange={(e) => setCnfPassword(e.target.value)}
                        showPasswordToggle
                        autoComplete="new-password"
                    />

                    <PasswordStrengthMeter password={password} />

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-50"
                        type="submit"
                        disabled={isLoading || !isPasswordValid(password)}
                    >
                        {isLoading ? (
                            <Loader className="w-6 h-6 animate-spin mx-auto" />
                        ) : (
                            'Set new password'
                        )}
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
};

export default ResetPasswordPage;
