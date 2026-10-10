import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 m-6">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">404 - Not Found</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/dashboard"
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
