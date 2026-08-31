import { motion } from 'framer-motion';
import { Loader, Lock, Mail, User } from 'lucide-react';
import Input from '../component/Input';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordStrengthMeter from '../component/PasswordStrengthMeter';
import { useAuthStore } from '../store/authStore';
import {
    isValidEmail,
    isPasswordValid,
    validateUsername,
} from '../util/validation';
import toast from 'react-hot-toast';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const navigate = useNavigate();
    const { signup, signupError, isLoading } = useAuthStore();

    const handleSignup = async (e) => {
        e.preventDefault();

        const errors = {};
        const usernameError = validateUsername(name);
        if (usernameError) errors.name = usernameError;
        if (!isValidEmail(mail)) errors.email = 'Enter a valid email address';
        if (!isPasswordValid(password)) {
            errors.password = 'Password does not meet requirements';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});

        try {
            await signup(mail, password, name);
            navigate('/verifyEmail');
        } catch {
            toast.error('Signup failed');
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
                    Create Account
                </h2>

                <form onSubmit={handleSignup} noValidate>
                    <Input
                        icon={User}
                        label="Full name"
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={fieldErrors.name}
                        autoComplete="name"
                    />

                    <Input
                        icon={Mail}
                        label="Email"
                        id="signup-email"
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
                        id="signup-password"
                        type="password"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={fieldErrors.password}
                        showPasswordToggle
                        autoComplete="new-password"
                    />

                    {signupError && (
                        <p className="mt-2 font-semibold text-red-500" role="alert">
                            {signupError}
                        </p>
                    )}

                    <PasswordStrengthMeter password={password} />

                    <motion.button
                        type="submit"
                        className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading || !isPasswordValid(password)}
                    >
                        {isLoading ? (
                            <Loader className="animate-spin mx-auto" size={24} />
                        ) : (
                            'Create Account'
                        )}
                    </motion.button>
                </form>
            </div>

            <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
                <p className="text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-green-400 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </motion.div>
    );
};

export default SignupPage;
