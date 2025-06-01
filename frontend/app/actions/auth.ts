"use server";

import { cookies } from 'next/headers';

export async function signUp(formData: { name: string; email: string; password: string }) {
  try {
    const response = await fetch('https://relearnai.onrender.com/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || '註冊失敗' };
    }

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: '系統錯誤，請稍後再試' };
  }
}

export async function signIn(formData: { email: string; password: string }) {
  try {
    const response = await fetch('https://relearnai.onrender.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || '登入失敗' };
    }

    const data = await response.json();
    
    // Store the token in a secure HTTP-only cookie
    if (data.token) {
      // Use the proper Next.js cookies API
      const cookieStore = await cookies();
      cookieStore.set({
        name: 'token',
        value: data.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        // Set an appropriate expiration time
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: '系統錯誤，請稍後再試' };
  }
}

export async function signOut() {
  // Clear the token cookie using the proper Next.js cookies API
  const cookieStore = await cookies();
  cookieStore.delete('token');
  return { success: true };
}
