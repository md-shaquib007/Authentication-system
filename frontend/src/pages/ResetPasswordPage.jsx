import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../component/Input';
import { Lock } from 'lucide-react';

const ResetPasswordPage = async () => {
    const [password, setPassword] = useState();
    const [cnfPassword, setCnfPassword] = useState();

    const { isLoading, error, message, resetPassword } = useAuthStore();

    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== cnfPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await resetPassword(token, password);
            toast.success(response.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);

            console.log(response);
        } catch (error) {
            toast.error(error.message || 'Error resetting password');
            console.log(error);
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

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <Input
                        icon={Lock}
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Input
                        icon={Lock}
                        type="password"
                        placeholder="confirm password"
                        value={cnfPassword}
                        onChange={(e) => setCnfPassword(e.target.value)}
                        required
                    />

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Resetting...' : 'Set new password'}
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
};

export default ResetPasswordPage;
