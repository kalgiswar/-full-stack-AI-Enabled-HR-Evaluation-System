// ============================================
// 📚 LEARNING: Supabase Client (Client-Side)
// ============================================
// This client is used in BROWSER/FRONTEND code
// (React components, hooks, etc.)
// 
// It uses the PUBLIC anon key (safe to expose)
// and handles authentication with cookies

import { createBrowserClient } from '@supabase/ssr'

// ============================================
// Environment Variables Check
// ============================================
// These must be available in the browser
// That's why they start with NEXT_PUBLIC_

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Missing Supabase environment variables!\n' +
    'Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
  )
}

// ============================================
// Create Browser Client
// ============================================
// This client automatically:
// - Stores auth tokens in cookies
// - Refreshes expired tokens
// - Handles auth state changes

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// ============================================
// 📚 HOW TO USE IN COMPONENTS:
// ============================================
// 
// import { supabase } from '@database/supabase/client';
//
// // Sign up
// const { data, error } = await supabase.auth.signUp({
//   email: 'user@example.com',
//   password: 'password123'
// });
//
// // Sign in
// const { data, error } = await supabase.auth.signInWithPassword({
//   email: 'user@example.com',
//   password: 'password123'
// });
//
// // Get current user
// const { data: { user } } = await supabase.auth.getUser();
//
// // Sign out
// await supabase.auth.signOut();
//
// ============================================
