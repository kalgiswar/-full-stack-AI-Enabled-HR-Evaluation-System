// ============================================
// 📚 LEARNING: Supabase Server Client
// ============================================
// This client is used in SERVER-SIDE code
// (Server Actions, API Routes, Server Components)
//
// It uses cookies() to read auth tokens securely
// This is important for Next.js App Router

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// ============================================
// Create Server Client Function
// ============================================
// We create a NEW client for each request
// because cookies are request-specific

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// ============================================
// Admin Client (Full Access)
// ============================================
// This uses the SERVICE_ROLE key which bypasses
// Row Level Security (RLS) - use with caution!
// Only use for admin operations like user management

export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Full access key
    {
      cookies: {},
    }
  )
}

// ============================================
// 📚 HOW TO USE IN SERVER ACTIONS:
// ============================================
//
// import { createClient } from '@database/supabase/server';
//
// export async function myServerAction() {
//   'use server';
//   
//   const supabase = await createClient();
//   
//   // Get authenticated user
//   const { data: { user } } = await supabase.auth.getUser();
//   
//   if (!user) {
//     return { error: 'Not authenticated' };
//   }
//   
//   // Do database operations...
// }
//
// ============================================
