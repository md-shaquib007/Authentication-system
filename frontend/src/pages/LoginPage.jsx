import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../component/Input';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { isValidEmail } from '../util/validation';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const { isLoading, loginError, login } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const errors = {};
        if (!isValidEmail(mail)) errors.email = 'Enter a valid email address';
        if (!password) errors.password = 'Password is required';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});

        try {
            const user = await login(mail, password);
            navigate(user?.isVerified ? '/' : '/verifyEmail');
        } catch {
            toast.error('Login failed');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
        >
            <div className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                    Welcome Back
                </h2>

                <form onSubmit={handleLogin} noValidate>
                    <Input
                        icon={Mail}
                        label="Email"
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={mail}
                        onChange={(e) => setMail(e.target.value)}
                        error={fieldErrors.email}
                        autoComplete="email"
                    />

                    <Input
                        icon={Lock}
                        label="Password"
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={fieldErrors.password}
                        showPasswordToggle
                        autoComplete="current-password"
                    />

                    <div className="flex items-center mb-6 -mt-2">
                        <Link
                            to="/forgetPassword"
                            className="text-sm text-green-400 hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {loginError && (
                        <p className="mb-2 text-red-500 font-semibold" role="alert">
                            {loginError}
                        </p>
                    )}

                    <motion.button
                        type="submit"
                        className="mt-2 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader className="w-6 h-6 animate-spin mx-auto" />
                        ) : (
                            'Login'
                        )}
                    </motion.button>
                </form>
            </div>

            <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
                <p className="text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link
                        to="/signup"
                        className="text-green-400 hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </motion.div>
    );
};

export default LoginPage;
