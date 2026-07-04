import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Mail, Lock, User, LogIn, UserPlus, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export default function AuthModal({ isOpen, onClose, onToast }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        onToast("Account created successfully!");
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onToast("Successfully logged in!");
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = err.message;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMessage = "Invalid email or password.";
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = "This email is already registered.";
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = "Please enter a valid email address.";
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = "Password should be at least 6 characters.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onToast("Successfully logged in with Google!");
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        onToast("Sign in cancelled.");
      } else {
        console.error("Google sign-in error:", err);
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-6 shadow-2xl border border-stone-100 overflow-hidden z-10"
          >
            {/* Ambient decorative elements */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full filter blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-lime-400/10 rounded-full filter blur-xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {success ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                </motion.div>
                <h3 className="text-lg font-black text-stone-900 mb-1">
                  {isSignUp ? 'Welcome!' : 'Welcome Back!'}
                </h3>
                <p className="text-xs text-stone-500 font-semibold">
                  {isSignUp ? 'Your Eco-kitchen is ready.' : 'Synchronizing your pantry...'}
                </p>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow-md mx-auto mb-3">
                    🥗
                  </div>
                  <h3 className="text-lg font-black text-stone-900">
                    {isSignUp ? 'Create Eco Account' : 'Welcome Back'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 font-semibold">
                    {isSignUp ? 'Save your storage & meals in the cloud' : 'Access your customized waste-reducing plans'}
                  </p>
                </div>

                {/* Tab selector */}
                <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl mb-5">
                  <button
                    onClick={() => { if (isSignUp) handleToggleMode(); }}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      !isSignUp ? 'bg-white text-stone-900 shadow-3xs' : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { if (!isSignUp) handleToggleMode(); }}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      isSignUp ? 'bg-white text-stone-900 shadow-3xs' : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="text-[11px] font-semibold leading-normal">{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label className="text-[10px] font-extrabold text-stone-400 block mb-1 uppercase tracking-wider font-mono">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="chef@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-200 bg-stone-50/50 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all text-stone-800 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="text-[10px] font-extrabold text-stone-400 block mb-1 uppercase tracking-wider font-mono">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-200 bg-stone-50/50 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all text-stone-800 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Confirm Password (only for Sign Up) */}
                  {isSignUp && (
                    <div>
                      <label className="text-[10px] font-extrabold text-stone-400 block mb-1 uppercase tracking-wider font-mono">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 text-xs border border-stone-200 bg-stone-50/50 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all text-stone-800 font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isSignUp ? (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Create Account</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex py-3.5 items-center">
                  <div className="flex-grow border-t border-stone-200"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-stone-400 font-extrabold uppercase font-mono">Or</span>
                  <div className="flex-grow border-t border-stone-200"></div>
                </div>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 border border-stone-200 hover:bg-stone-50 disabled:bg-stone-100 text-stone-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs"
                >
                  <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 0, 0)">
                      <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48C21.68,11.97 21.56,11.51 21.35,11.1z" fill="#4285F4" />
                      <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.58c-0.91,0.61 -2.08,0.98 -3.3,0.98c-2.34,0 -4.32,-1.58 -5.03,-3.7H2.94v2.66C4.42,18.73 7.96,20.6 12,20.6z" fill="#34A853" />
                      <path d="M6.97,13.1c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.04H2.94C2.33,8.25 2,9.63 2,11.1c0,1.47 0.33,2.85 0.94,4.06l4.03,-3.06z" fill="#FBBC05" />
                      <path d="M12,5.2c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,2.5 14.43,1.6 12,1.6c-4.04,0 -7.58,1.87 -9.06,4.84l4.03,3.11c0.71,-2.12 2.69,-3.75 5.03,-3.75z" fill="#EA4335" />
                    </g>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
