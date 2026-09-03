import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, Mail } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { maskEmail } from '../util/validation';
import Input from '../component/Input';
import toast from 'react-hot-toast';

const RESEND_COOLDOWN = 60;

const VerifyEmail = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [customEmail, setCustomEmail] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    const { user, verifyError, isLoading, verifyMail, resendVerification, logout } =
        useAuthStore();

    const targetEmail = user?.email || customEmail;

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    const handleChange = (index, value) => {
        const newCode = [...code];

        if (value.length > 1) {
            const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
            for (let i = 0; i < 6; i++) {
                newCode[i] = pasted[i] || '';
            }
            setCode(newCode);

            const nextIndex = pasted.length >= 6 ? 5 : pasted.length;
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        if (value && !/^\d$/.test(value)) return;

        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async () => {
        if (isLoading) return;

        const verificationCode = code.join('');

        if (verificationCode.length !== 6) {
            toast.error('Please enter the complete 6-digit code');
            return;
        }

        try {
            await verifyMail(verificationCode, targetEmail);
            toast.success('Email verified successfully');
            navigate('/');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Verification failed');
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || isLoading) return;

        if (!targetEmail) {
            toast.error('Please enter your email address to resend code');
            return;
        }

        try {
            const data = await resendVerification(targetEmail);
            toast.success(data?.message || 'New code sent');
            setCooldown(RESEND_COOLDOWN);
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to resend code');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
        >
            <div className="p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                        Verify Email
                    </h2>
                    {user?.email ? (
                        <p className="text-gray-400 text-sm">
                            We sent a 6-digit code to{' '}
                            <span className="text-green-400 font-medium">
                                {maskEmail(user.email)}
                            </span>
                        </p>
                    ) : (
                        <p className="text-gray-400 text-sm">
                            Enter your registered email and the 6-digit verification code sent to your inbox.
                        </p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                        Code expires in 24 hours
                    </p>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                    className="space-y-6"
                >
                    {!user?.email && (
                        <Input
                            icon={Mail}
                            label="Registered Email Address"
                            id="verify-custom-email"
                            type="email"
                            placeholder="you@example.com"
                            value={customEmail}
                            onChange={(e) => setCustomEmail(e.target.value)}
                            autoComplete="email"
                        />
                    )}
                    <div
                        className="flex justify-center gap-3"
                        role="group"
                        aria-label="Verification code"
                    >
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                inputMode="numeric"
                                maxLength="6"
                                value={digit}
                                ref={(el) => (inputRefs.current[index] = el)}
                                onChange={(e) =>
                                    handleChange(index, e.target.value)
                                }
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                aria-label={`Digit ${index + 1} of 6`}
                                className="w-12 h-14 text-center text-xl font-semibold bg-gray-800 bg-opacity-50 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all duration-200"
                            />
                        ))}
                    </div>

                    {verifyError && (
                        <p className="text-red-400 text-sm text-center font-medium" role="alert">
                            {verifyError}
                        </p>
                    )}

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading || !code.every((d) => d !== '')}
                        className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition duration-200"
                    >
                        {isLoading ? (
                            <Loader className="w-6 h-6 animate-spin mx-auto" />
                        ) : (
                            'Verify Email'
                        )}
                    </motion.button>

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={cooldown > 0 || isLoading}
                        className="w-full text-sm text-green-400 hover:text-green-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {cooldown > 0
                            ? `Resend code in ${cooldown}s`
                            : 'Resend verification code'}
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Use a different account
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default VerifyEmail;
