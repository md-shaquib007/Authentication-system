import { motion } from 'framer-motion';
import { useState } from 'react';
import { Loader, ShieldCheck, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import Input from '../component/Input';
import PasswordStrengthMeter from '../component/PasswordStrengthMeter';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../util/util_date';
import { useNavigate } from 'react-router-dom';
import { isPasswordValid } from '../util/validation';
import toast from 'react-hot-toast';

const HomePage = () => {
    const { user, logout, isLoggingOut, changePassword, isChangingPassword, changePasswordError } =
        useAuthStore();
    const navigate = useNavigate();

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    if (!user) return null;

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch {
            toast.error('Logout failed');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!isPasswordValid(newPassword)) {
            toast.error('New password does not meet requirements');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            await changePassword(currentPassword, newPassword);
            toast.success('Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowChangePassword(false);
        } catch (err) {
            toast.error(
                err?.response?.data?.message || 'Failed to change password'
            );
        }
    };

    return (
        <motion.div
            className="max-w-md w-full mx-auto mt-10 p-8 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-transparent bg-clip-text">
                    Dashboard
                </h2>
                {user.isVerified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full">
                        <ShieldCheck className="size-3.5" />
                        Verified
                    </span>
                )}
            </div>

            <div className="space-y-6">
                <motion.div
                    className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-xl font-semibold text-green-400 mb-3">
                        Profile Information
                    </h3>
                    <p className="text-gray-300">Name: {user.username}</p>
                    <p className="text-gray-300">Email: {user.email}</p>
                </motion.div>

                <motion.div
                    className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="text-xl font-semibold text-green-400 mb-3">
                        Account Activity
                    </h3>

                    <p className="text-gray-300">
                        <span className="font-bold">Joined: </span>
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>

                    <p className="text-gray-300">
                        <span className="font-bold">Last Login: </span>
                        {formatDate(user.lastLogin)}
                    </p>
                </motion.div>

                <motion.div
                    className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <button
                        type="button"
                        onClick={() => setShowChangePassword((prev) => !prev)}
                        className="w-full flex items-center justify-between text-left"
                    >
                        <h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
                            <Lock className="size-5" />
                            Change Password
                        </h3>
                        {showChangePassword ? (
                            <ChevronUp className="size-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="size-5 text-gray-400" />
                        )}
                    </button>

                    {showChangePassword && (
                        <form
                            onSubmit={handleChangePassword}
                            className="mt-4 space-y-1"
                            noValidate
                        >
                            <Input
                                icon={Lock}
                                label="Current password"
                                id="current-password"
                                type="password"
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                showPasswordToggle
                                autoComplete="current-password"
                            />

                            <Input
                                icon={Lock}
                                label="New password"
                                id="new-password"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                showPasswordToggle
                                autoComplete="new-password"
                            />

                            <Input
                                icon={Lock}
                                label="Confirm new password"
                                id="confirm-new-password"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                showPasswordToggle
                                autoComplete="new-password"
                            />

                            <PasswordStrengthMeter password={newPassword} />

                            {changePasswordError && (
                                <p className="text-red-400 text-sm" role="alert">
                                    {changePasswordError}
                                </p>
                            )}

                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={
                                    isChangingPassword ||
                                    !currentPassword ||
                                    !isPasswordValid(newPassword) ||
                                    newPassword !== confirmPassword
                                }
                                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                            >
                                {isChangingPassword ? (
                                    <Loader className="w-6 h-6 animate-spin mx-auto" />
                                ) : (
                                    'Update Password'
                                )}
                            </motion.button>
                        </form>
                    )}
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                    {isLoggingOut ? (
                        <Loader className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                        'Logout'
                    )}
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default HomePage;
