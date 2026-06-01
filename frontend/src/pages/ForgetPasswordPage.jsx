import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Loader, Mail } from 'lucide-react';
import Input from '../component/Input';
import { Link } from 'react-router-dom';

const ForgetPasswordPage = () => {
    const [mail, setMail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { isLoading, forgetPassword, error } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await forgetPassword(mail);
            setIsSubmitted(true);
        } catch (error) {
            console.log(error);
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
                    Forget Password
                </h2>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit}>
                        <p className="text-gray-300 mb-6 text-center">
                            Enter your email address and we'll send you a link
                            to reset your password.
                        </p>

                        <Input
                            icon={Mail}
                            type="email"
                            placeholder="Enter your email"
                            value={mail}
                            onChange={(e) => setMail(e.target.value)}
                        />

                        {error && (
                            <p className="text-red-500 font-semibold text-center text-sm mb-4">
                                {error}
                            </p>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-500 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                            {isLoading ? (
                                <Loader className="size-6 animate-spin mx-auto" />
                            ) : (
                                'Send reset link'
                            )}
                        </motion.button>
                    </form>
                ) : (
                    <div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: 'spring',
                                stiffness: 500,
                                dumping: 30,
                            }}
                            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <Mail className="h-8 w-8 text-white" />
                        </motion.div>

                        <p className="text-gray-300 mb-6">
                            if an account exists for {mail} , you will receive a
                            password reset link shortly
                        </p>
                    </div>
                )}
            </div>

            <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
                <Link
                    to={'/login'}
                    className="text-sm text-green-400 hover:underline flex items-center"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to login
                </Link>
            </div>
        </motion.div>
    );
};

export default ForgetPasswordPage;
