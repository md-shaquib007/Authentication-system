import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-xl p-8 text-center"
    >
        <h2 className="text-4xl font-bold text-white mb-2">404</h2>
        <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
        <Link
            to="/login"
            className="inline-block py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition"
        >
            Go to Login
        </Link>
    </motion.div>
);

export default NotFoundPage;
