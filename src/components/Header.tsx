import { useState } from 'react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup, User } from 'firebase/auth';
import { UserProfile } from '../types.ts';
import { LogIn, LogOut, ShieldAlert, Compass, Sparkles, AlertCircle, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import CocLogo from './CocLogo.tsx';

interface HeaderProps {
  user: any;
  profile: UserProfile | null;
  loadingAuth: boolean;
  onRefreshProfile: () => void;
  onLogout?: () => void;
  onSimulatedLogin?: (role: 'student' | 'admin') => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

export default function Header({ 
  user, 
  profile, 
  loadingAuth, 
  onRefreshProfile, 
  onLogout, 
  onSimulatedLogin,
  theme = 'dark',
  toggleTheme
}: HeaderProps) {
  const [authError, setAuthError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleAuthProvider);
      onRefreshProfile();
    } catch (error: any) {
      console.error("Login failed:", error);
      if (
        error?.code === 'auth/cancelled-popup-request' || 
        error?.message?.includes('cancelled-popup-request') ||
        error?.code === 'auth/popup-blocked'
      ) {
        setAuthError("Google Login popup bị trình duyệt hoặc Iframe chặn. Thử dùng nút 'Quick Login' nhé!");
      } else {
        setAuthError(error.message || "Không thể mở cửa sổ đăng nhập Google.");
      }
    }
  };

  const handleLogoutClick = async () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <CocLogo size="md" className="shrink-0" />
          <div className="min-w-0">
            <h1 className="font-display font-black text-sm sm:text-lg md:text-xl text-[#fafafa] tracking-tight flex items-center gap-1 hover:opacity-90 duration-200 whitespace-nowrap">
              Cóc Food Map <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent text-xs sm:text-base md:text-lg">💸</span>
            </h1>
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest hidden sm:block truncate">
              Chi tiêu thông minh - Ăn no cày deadline
            </p>
          </div>
        </div>

        {/* User Auth control */}
        <div className="flex items-center gap-2 shrink-0">
          {authError && (
            <div className="text-[9px] sm:text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1 max-w-[120px] sm:max-w-[260px] truncate hidden md:flex">
              <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-4">
            {/* Theme Togglor */}
            <button
              onClick={toggleTheme}
              id="theme-toggle-btn"
              className="p-2 text-neutral-400 hover:text-emerald-400 rounded-xl hover:bg-white/5 transition duration-300 cursor-pointer flex items-center justify-center shrink-0"
              title={theme === 'light' ? "Chuyển sang Giao diện Tối" : "Chuyển sang Giao diện Sáng"}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {loadingAuth ? (
              <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-emerald-500 animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-1.5 sm:gap-3">
                {/* Role Badge */}
                <div 
                  className={`py-1.5 px-2.5 sm:px-3 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 border shrink-0 ${
                    profile?.role === 'admin' 
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {profile?.role === 'admin' ? (
                    <>
                      <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Admin 🛠️</span>
                      <span className="inline sm:hidden">🛠️</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Sinh viên 🎓</span>
                      <span className="inline sm:hidden">🎓</span>
                    </>
                  )}
                </div>

                {/* User Avatar with Hover Aura */}
                <div className="flex items-center gap-1 sm:gap-2 group relative shrink-0">
                  {/* Aura Bloom Background on Hover */}
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#f7d6c8] via-[#e0aa96] to-[#f1bfae] opacity-0 group-hover:opacity-75 blur-md transition duration-500" />
                  
                  <div className="relative flex items-center gap-1 sm:gap-2 bg-black/40 py-1 px-1.5 sm:px-2.5 rounded-full border border-white/10 shrink-0">
                    {!avatarError && user.photoURL && !user.photoURL.includes('[#f1bfae]') ? (
                      <img 
                        referrerPolicy="no-referrer"
                        src={user.photoURL} 
                        alt={user.displayName || 'Avatar'} 
                        onError={() => setAvatarError(true)}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-white/20 shadow-sm object-cover shrink-0 aspect-square"
                      />
                    ) : (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-[10px] sm:text-xs border border-white/20 shadow-sm shrink-0 aspect-square">
                        {profile?.role === 'admin' ? '🛠️' : '🎓'}
                      </div>
                    )}
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-200 hidden md:block group-hover:text-amber-600 dark:group-hover:text-[#f7d6c8] transition duration-300 cursor-default">
                      {user.displayName?.split(' ')[user.displayName.split(' ').length - 1] || 'Cóc ẩn danh'}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogoutClick}
                  id="logout-btn"
                  className="p-1.5 sm:p-2 text-neutral-400 hover:text-red-400 rounded-xl hover:bg-white/5 transition duration-300 cursor-pointer shrink-0"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  onClick={() => onSimulatedLogin?.('student')}
                  id="simulate-student-btn"
                  className="flex items-center gap-1 bg-neutral-900 border border-white/10 text-neutral-200 hover:bg-neutral-800 hover:text-white transition duration-200 active:scale-95 py-1.5 px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-bold cursor-pointer shrink-0"
                  title="Đăng nhập giả lập để vượt rào cản Pop-up Sandbox"
                >
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span><span className="hidden sm:inline">Dùng Thử </span>Quick⚡</span>
                </button>

                <button
                  onClick={handleLogin}
                  id="login-btn"
                  className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 transition duration-300 active:scale-95 py-1.5 px-2 sm:px-4 rounded-lg text-[10px] sm:text-xs font-bold shadow-[0_4px_12px_rgba(16,185,129,0.3)] cursor-pointer shrink-0"
                >
                  <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span>Google Login</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
