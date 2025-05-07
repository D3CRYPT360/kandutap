'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Check credentials
    if (username === 'admin' && password === 'root') {
      // Set session storage to indicate admin is logged in
      sessionStorage.setItem('adminAuthenticated', 'true');
      router.push('/admin');
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-cyan-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Admin Login</h1>
        
        {error && (
          <div className="bg-red-500/20 text-red-100 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-blue-100 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl 
                text-white placeholder-blue-200 focus:outline-none focus:ring-2 
                focus:ring-cyan-400"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-blue-100 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl 
                text-white placeholder-blue-200 focus:outline-none focus:ring-2 
                focus:ring-cyan-400"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 
              hover:from-blue-600 hover:to-cyan-500 rounded-xl text-white font-bold
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
