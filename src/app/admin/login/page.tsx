'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import Cookies from 'js-cookie';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const generateToken = (username: string) => {
    // در یک پروژه واقعی، این توکن باید در سمت سرور و با استفاده از JWT ایجاد شود
    return btoa(`${username}-${Date.now()}`);
  };

  const validateCredentials = async (username: string, password: string) => {
    const ADMIN_USERNAME = 'hotelmanager';
    const ADMIN_PASSWORD = 'Hotel@Menu#2025';
    
    // تاخیر تصادفی برای جلوگیری از حملات timing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 500));
    
    return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // اعتبارسنجی ورودی‌ها
      if (!username || !password) {
        throw new Error('لطفاً نام کاربری و رمز عبور را وارد کنید');
      }

      if (username.length < 5) {
        throw new Error('نام کاربری باید حداقل 5 کاراکتر باشد');
      }

      if (password.length < 8) {
        throw new Error('رمز عبور باید حداقل 8 کاراکتر باشد');
      }

      const isValid = await validateCredentials(username, password);

      if (isValid) {
        // ایجاد توکن و ذخیره در کوکی
        const token = generateToken(username);
        
        // تنظیم کوکی با گزینه‌های امنیتی متناسب با محیط
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        Cookies.set('admin_token', token, {
          expires: 1, // منقضی شدن بعد از 1 روز
          secure: !isDevelopment, // فقط در HTTPS برای محیط تولید
          sameSite: isDevelopment ? 'lax' : 'strict' // تنظیم متناسب با محیط
        });

        // اضافه کردن تاخیر کوتاه برای اطمینان از ذخیره شدن کوکی
        await new Promise(resolve => setTimeout(resolve, 100));
        
        router.push('/admin/dashboard');
        router.refresh(); // بازخوانی کامل صفحه برای اطمینان از اعمال تغییرات
      } else {
        throw new Error('نام کاربری یا رمز عبور اشتباه است');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('خطای ناشناخته');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4">
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleLogin}
          className="bg-zinc-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-zinc-700/30 space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <FiUser className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">ورود به پنل مدیریت</h2>
            <p className="text-sm text-zinc-400">لطفاً برای ادامه وارد شوید</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 block">نام کاربری</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="نام کاربری خود را وارد کنید"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 pl-10 rounded-xl bg-zinc-700/50 border border-zinc-600/50 focus:border-emerald-500/50 focus:bg-zinc-700/80 focus:outline-none transition-all"
                  disabled={loading}
                />
                <FiUser className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 block">رمز عبور</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="رمز عبور خود را وارد کنید"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pl-10 rounded-xl bg-zinc-700/50 border border-zinc-600/50 focus:border-emerald-500/50 focus:bg-zinc-700/80 focus:outline-none transition-all"
                  disabled={loading}
                />
                <FiLock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 p-3 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            <FiLogIn className="w-5 h-5" />
            {loading ? 'در حال بررسی...' : 'ورود به پنل'}
          </button>
        </form>
      </div>
    </main>
  );
}