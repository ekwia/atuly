import React, { useState } from "react";
import { 
  X, 
  LogIn, 
  ShieldAlert, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  Mail, 
  Key, 
  RefreshCw, 
  CheckCircle2, 
  User as UserIcon, 
  UserPlus, 
  Eye, 
  EyeOff 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";
import { auth, googleProvider, getUserProfileFromDB, saveUserProfileToDB } from "../firebase";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

type AuthTab = "login" | "register";

export default function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Google Sign-In (Firebase Popup)
  const handleGoogleSignInPopup = async () => {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fUser = result.user;
      
      if (!fUser) {
        throw new Error("No user profile retrieved from Google.");
      }

      const userEmail = (fUser.email || "").toLowerCase().trim();
      const isAtulyaDomain = userEmail.endsWith("@atulyagold.com");
      const isAdminEmail = userEmail === "vaidwanprince@gmail.com" || userEmail === "videads@gmail.com" || userEmail === "atulygold333@gmail.com";
      const isAdmin = isAtulyaDomain || isAdminEmail;

      const profileName = fUser.displayName || userEmail.split("@")[0].charAt(0).toUpperCase() + userEmail.split("@")[0].slice(1);
      
      // Load user profile from database or create it
      let userProfile = await getUserProfileFromDB(fUser.uid);
      if (!userProfile) {
        userProfile = {
          name: profileName,
          email: userEmail,
          picture: fUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userEmail)}`,
          role: isAdmin ? "admin" : "user"
        };
        await saveUserProfileToDB(fUser.uid, userProfile);
      }

      setSuccessMessage("Google authentication successful!");
      onLoginSuccess(userProfile);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      let msg = err.message || String(err);
      if (err.code === "auth/popup-blocked") {
        msg = "The Google Sign-In popup was blocked by your browser. Please allow popups, or open this application in a new tab using the icon at the top right of the viewport.";
      } else if (err.code === "auth/cancelled-popup-request") {
        msg = "Authentication process cancelled. Please try again.";
      } else if (err.code === "auth/network-request-failed") {
        msg = "Network connection failed. Please ensure you are online and try again.";
      } else if (err.code === "auth/unauthorized-domain") {
        msg = `Unauthorized Domain: The current URL domain (${window.location.hostname}) is not added to the Authorized Domains list in your Firebase Console. Please add "${window.location.hostname}" in your Firebase Console -> Authentication -> Settings -> Authorized domains to activate Google login.`;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Email & Password Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const trimmedName = name.trim();
    const trimmedEmail = email.toLowerCase().trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create firebase auth user
      const credentials = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const fUser = credentials.user;

      // 2. Set display name
      await updateProfile(fUser, { displayName: trimmedName });

      // 3. Determine if admin
      const isAtulyaDomain = trimmedEmail.endsWith("@atulyagold.com");
      const isAdminEmail = trimmedEmail === "vaidwanprince@gmail.com" || trimmedEmail === "videads@gmail.com" || trimmedEmail === "atulygold333@gmail.com";
      const isAdmin = isAtulyaDomain || isAdminEmail;

      const userProfile: User = {
        name: trimmedName,
        email: trimmedEmail,
        picture: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(trimmedName)}`,
        role: isAdmin ? "admin" : "user"
      };

      // 4. Save profile in Firestore database
      await saveUserProfileToDB(fUser.uid, userProfile);

      setSuccessMessage("Account created successfully! Welcome to Atulya Jewelers.");
      
      onLoginSuccess(userProfile);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Registration Error:", err);
      let msg = err.message || String(err);
      if (err.code === "auth/email-already-in-use") {
        msg = "This email address is already registered. Please log in instead.";
      } else if (err.code === "auth/invalid-email") {
        msg = "The email address is invalid.";
      } else if (err.code === "auth/operation-not-allowed") {
        msg = "Email/Password sign-in provider is not enabled in your Firebase Console. Please go to your Firebase Console -> Authentication -> Sign-in method, click Add new provider, select Email/Password, and click Enable to activate.";
      } else if (err.code === "auth/weak-password") {
        msg = "The password is too weak. Please choose a stronger password.";
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Email & Password Log In
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const trimmedEmail = email.toLowerCase().trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign in via Firebase Auth
      const credentials = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const fUser = credentials.user;

      // 2. Fetch user profile from Firestore
      let userProfile = await getUserProfileFromDB(fUser.uid);
      
      // Fallback if profile doesn't exist in Firestore database yet
      if (!userProfile) {
        const isAtulyaDomain = trimmedEmail.endsWith("@atulyagold.com");
        const isAdminEmail = trimmedEmail === "vaidwanprince@gmail.com" || trimmedEmail === "videads@gmail.com" || trimmedEmail === "atulygold333@gmail.com";
        const isAdmin = isAtulyaDomain || isAdminEmail;

        const fallbackName = fUser.displayName || trimmedEmail.split("@")[0].charAt(0).toUpperCase() + trimmedEmail.split("@")[0].slice(1);
        userProfile = {
          name: fallbackName,
          email: trimmedEmail,
          picture: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fallbackName)}`,
          role: isAdmin ? "admin" : "user"
        };
        await saveUserProfileToDB(fUser.uid, userProfile);
      }

      setSuccessMessage(`Welcome back, ${userProfile.name}! Logged in successfully.`);
      
      onLoginSuccess(userProfile);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Login Error:", err);
      let msg = err.message || String(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        msg = "Invalid email or password. Please verify and try again.";
      } else if (err.code === "auth/operation-not-allowed") {
        msg = "Email/Password provider is disabled in Firebase. Go to Authentication -> Sign-in method, select Email/Password, and click Enable to activate.";
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-neutral-950/70 backdrop-blur-md">
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.95 }}
        className="bg-[#FAF8F5] rounded-2xl w-full max-w-[345px] xs:max-w-[370px] sm:max-w-md p-4 sm:p-6 md:p-8 border border-amber-100/60 shadow-2xl relative my-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
          disabled={isLoading}
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="space-y-4 sm:space-y-6">
          {/* Logo / Header */}
          <div className="text-center space-y-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100/40 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200/50">
              <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-[#D4AF37] animate-pulse" />
            </div>
            <h2 className="font-serif font-black text-sm sm:text-base md:text-lg text-neutral-900 tracking-tight leading-snug">
              Atulya Secure Portal
            </h2>
            <p className="text-[10px] sm:text-[11px] md:text-xs text-neutral-500 max-w-xs mx-auto leading-normal">
              Sign up or log in to manage your premium jewelry collections, track custom orders, or leave certified reviews.
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200/60">
            <button
              onClick={() => { setActiveTab("login"); setError(""); setSuccessMessage(""); }}
              className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === "login"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Sign In / Log In
            </button>
            <button
              onClick={() => { setActiveTab("register"); setError(""); setSuccessMessage(""); }}
              className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === "register"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Register / Sign Up
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 flex items-start gap-2.5 text-xs whitespace-pre-line">
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 flex-shrink-0 mt-0.5 animate-bounce" />
              <span className="leading-normal font-medium">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="leading-normal font-medium">{successMessage}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "login" ? (
              <motion.div
                key="login-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                {/* Log In Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="e.g., customer@gmail.com"
                      disabled={isLoading}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-400 font-mono text-xs font-semibold disabled:bg-neutral-50 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-400 font-mono text-xs font-semibold disabled:bg-neutral-50 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-neutral-800 transition-all cursor-pointer shadow-md ${
                      isLoading ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"
                    }`}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4 text-[#D4AF37]" />
                    )}
                    <span>{isLoading ? "Logging in..." : "Log In"}</span>
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                {/* Sign Up Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(""); }}
                      placeholder="e.g., Deva Kumar"
                      disabled={isLoading}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-400 text-xs font-semibold disabled:bg-neutral-50 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="e.g., name@gmail.com"
                      disabled={isLoading}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-400 font-mono text-xs font-semibold disabled:bg-neutral-50 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Password (min. 6 chars)</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-400 font-mono text-xs font-semibold disabled:bg-neutral-50 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Confirm Password</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-amber-400 font-mono text-xs font-semibold disabled:bg-neutral-50 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-neutral-800 transition-all cursor-pointer shadow-md ${
                      isLoading ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"
                    }`}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 text-[#D4AF37]" />
                    )}
                    <span>{isLoading ? "Registering..." : "Register"}</span>
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px bg-neutral-100 flex-grow" />
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Or Use Google Single Sign-On</span>
            <div className="h-px bg-neutral-100 flex-grow" />
          </div>

          {/* Google SSO Button */}
          <div className="pt-1">
            <button
              onClick={handleGoogleSignInPopup}
              disabled={isLoading}
              className={`w-full py-3 bg-white hover:bg-neutral-50 text-neutral-800 rounded-xl font-bold border border-neutral-200/80 text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer ${
                isLoading ? "opacity-75 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
            <p className="text-[10px] text-neutral-400 text-center mt-2 font-medium">
              Note: Popups must be allowed to log in via Google.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
