import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    const { error, isLoading, verifyMail } = useAuthStore();

    const handleChange = (index, value) => {
        const newCode = [...code];

        // Handle paste
        if (value.length > 1) {
            const pasted = value.slice(0, 6).split('');
            for (let i = 0; i < 6; i++) {
                newCode[i] = pasted[i] || '';
            }
            setCode(newCode);

            const nextIndex = pasted.length >= 6 ? 5 : pasted.length;
            inputRefs.current[nextIndex]?.focus();
            return;
        }

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
            await verifyMail(verificationCode);
            toast.success('Email verified successfully');
            navigate('/');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Verification failed');
        }
    };

    return (
        <div className="bg-gray-900 rounded-3xl m-1 p-1 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-white mb-3">
                        Verify Email
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Enter the 6-digit code sent to your email
                    </p>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                    className="space-y-8"
                >
                    {/* OTP Inputs */}
                    <div className="flex justify-center gap-3">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                value={digit}
                                ref={(el) => (inputRefs.current[index] = el)}
                                onChange={(e) =>
                                    handleChange(index, e.target.value)
                                }
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-14 h-14 text-center text-2xl font-semibold bg-white/10 text-white border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200"
                            />
                        ))}
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center font-medium">
                            {error}
                        </p>
                    )}

                    {/* Button */}
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={isLoading || !code.every((d) => d !== '')}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 text-white font-semibold py-3 rounded-xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
