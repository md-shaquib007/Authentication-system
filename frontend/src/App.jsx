import FloatingShapes from './component/FloatingShape';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import VerifyEmail from './pages/VerifyEmail';
import LoadingSpinner from './pages/LoadingSpinner';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForgetPasswordPage from './pages/ForgetPasswordPage';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import HomePage from './pages/HomePage';

// protect routes that require authentication
const ProtectedRoutes = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user?.isVerified) {
        return <Navigate to="/verifyEmail" replace />;
    }

    return children;
};

// redirect authenticated user to the home page
const RedirectAuthenticatedUser = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated) {
        if (user?.isVerified) {
            return <Navigate to="/" replace />;
        } else {
            return <Navigate to="/verifyEmail" replace />;
        }
    }

    return children;
};

function App() {
    const { isCheckingAuth, checkAuth, isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                await checkAuth();
            } catch (error) {
                console.error('Error checking authentication:', error);
            }
        };

        verifyAuth();
    }, [checkAuth]);

    if (isCheckingAuth) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 via-green-950 to-emerald-900 flex items-center justify-center relative overflow-hidden">
            <FloatingShapes
                color="bg-emerald-500"
                size="w-64 h-64"
                top="-5%"
                left="10%"
                delay={0}
            />

            <FloatingShapes
                color="bg-emerald-500"
                size="w-48 h-48"
                top="70%"
                left="80%"
                delay={5}
            />

            <FloatingShapes
                color="bg-emerald-500"
                size="w-32 h-32"
                top="40%"
                left="-10%"
                delay={2}
            />

            <Routes>
                <Route
                    path="/"
                    element={
                        <ProtectedRoutes>
                            <HomePage />
                        </ProtectedRoutes>
                    }
                />

                <Route
                    path="/signup"
                    element={
                        <RedirectAuthenticatedUser>
                            <SignupPage />
                        </RedirectAuthenticatedUser>
                    }
                />

                <Route
                    path="/login"
                    element={
                        <RedirectAuthenticatedUser>
                            <LoginPage />
                        </RedirectAuthenticatedUser>
                    }
                />

                <Route
                    path="/verifyEmail"
                    element={
                        !isAuthenticated ? (
                            <Navigate to="/login" replace />
                        ) : user?.isVerified ? (
                            <Navigate to="/" replace />
                        ) : (
                            <VerifyEmail />
                        )
                    }
                />

                <Route
                    path="/forgetPassword"
                    element={
                        <RedirectAuthenticatedUser>
                            <ForgetPasswordPage />
                        </RedirectAuthenticatedUser>
                    }
                />

                <Route
                    path="/resetPassword/:token"
                    element={
                        <RedirectAuthenticatedUser>
                            <ResetPasswordPage />
                        </RedirectAuthenticatedUser>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <Toaster />
        </div>
    );
}

export default App;
