import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // بررسی توکن لاگین در سشن
  const token = request.cookies.get('admin_token')?.value;
  const isLoggedIn = Boolean(token);
  
  // اگر درخواست برای مسیر داشبورد است و کاربر لاگین نیست
  if (request.nextUrl.pathname.startsWith('/admin/dashboard') && !isLoggedIn) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // اگر کاربر لاگین است و می‌خواهد به صفحه لاگین برود، به داشبورد ریدایرکت شود
  if (request.nextUrl.pathname === '/admin/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/admin/login']
};
