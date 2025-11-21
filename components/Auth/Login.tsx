
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, Lock, Mail, AlertCircle } from 'lucide-react';

interface LoginProps {
  onRegisterClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Trim inputs to prevent accidental whitespace issues
    const success = await login(email.trim(), password.trim());
    if (!success) {
      setError('Invalid credentials. Check the hints below.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    await loginWithGoogle();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in-up">
        <div className="text-center mb-8">
           <div className="inline-flex bg-brand-600 p-3 rounded-xl shadow-lg shadow-brand-600/20 mb-4">
                <Activity className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
           <p className="text-slate-400 mt-2">Sign in to your WealthOS dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input 
                type="email" 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
             <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
               <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-brand-600 focus:ring-brand-500/50" />
               Remember me
             </label>
             <button type="button" className="text-brand-400 hover:text-brand-300 font-medium">Forgot Password?</button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-500">Or continue with</span>
            </div>
        </div>

        <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                />
                <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                />
                <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                    fill="#FBBC05"
                />
                <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                />
            </svg>
            Sign in with Google
        </button>

        <div className="mt-8 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <button onClick={onRegisterClick} className="text-white font-medium hover:underline decoration-brand-500 underline-offset-4">
            Create Account
          </button>
        </div>

        {/* Demo Credentials Hint */}
        <div className="mt-8 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-500">
            <div className="font-bold text-slate-300 mb-1">Demo Credentials:</div>
            <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-amber-500 font-medium">Super Admin: wailafmohammed@gmail.com</span>
                <span className="text-amber-500 font-medium">Pass: Albasha@49#</span>
            </div>
            <div className="flex justify-between py-1">
                <span>Admin: admin@wealthos.com</span>
                <span>Pass: admin123</span>
            </div>
            <div className="flex justify-between py-1">
                <span>User: user@example.com</span>
                <span>Pass: any</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
