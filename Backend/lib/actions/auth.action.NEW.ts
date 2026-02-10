// ============================================
// 📚 LEARNING: Migrated Auth Actions
// ============================================
// This file shows HOW to convert Firestore code 
// to PostgreSQL + Supabase Auth
//
// Compare this with the old auth.action.ts to see
// the differences between Firebase and Supabase!
// ============================================

"use server";

import { createClient, createAdminClient } from "@database/supabase/server";
import { prisma } from "@database/postgresql/client";
import { cookies } from "next/headers";

// ============================================
// 📝 SIGN UP FUNCTION
// ============================================
// What changed from Firebase:
// 1. Use Supabase Auth instead of Firebase Auth
// 2. Use Prisma to save to PostgreSQL instead of Firestore
// 3. Supabase auto-creates auth.users, we create users in our table

export async function signUp(params: SignUpParams) {
  const { email, password, name } = params;
  console.log(`[Auth] Attempting SignUp for email: ${email}`);

  try {
    const supabase = await createClient();

    // ============================================
    // STEP 1: Create auth user in Supabase
    // ============================================
    // This creates the user in Supabase's auth.users table
    // Supabase handles password hashing, email verification, etc.
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // Store name in auth metadata
        },
      },
    });

    if (authError) {
      console.error("[Auth] Supabase signup error:", authError);
      return {
        success: false,
        message: authError.message || "Failed to create account",
      };
    }

    if (!authData.user) {
      return {
        success: false,
        message: "Failed to create user",
      };
    }

    // ============================================
    // STEP 2: Create user record in PostgreSQL
    // ============================================
    // BEFORE (Firestore):
    // await db.collection("users").doc(uid).set({ name, email })
    //
    // AFTER (Prisma):
    
    await prisma.user.create({
      data: {
        id: authData.user.id, // Use the same ID from Supabase auth
        email,
        name,
        role: "candidate", // Default role
      },
    });

    console.log("[Auth] User created successfully in PostgreSQL");

    return {
      success: true,
      message: "Account created successfully. Please check your email to verify.",
    };

  } catch (error: any) {
    console.error("[Auth] Error creating user:", error);

    // Handle duplicate email error
    if (error.code === "P2002") { // Prisma unique constraint error
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: `Failed to create account: ${error.message || "Unknown Error"}`,
    };
  }
}

// ============================================
// 🔑 SIGN IN FUNCTION
// ============================================
// What changed:
// 1. Use Supabase's built-in password authentication
// 2. No need to manually create session cookies (Supabase does it!)

export async function signIn(params: SignInParams) {
  const { email, password } = params;
  console.log(`[Auth] Attempting SignIn for email: ${email}`);

  try {
    const supabase = await createClient();

    // ============================================
    // Authenticate with Supabase
    // ============================================
    // BEFORE (Firebase):
    // - Verify ID token
    // - Check if user exists in Firestore
    // - Manually create session cookie
    //
    // AFTER (Supabase):
    // - One simple call!
    // - Automatically sets cookies
    // - Automatically refreshes tokens
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[Auth] SignIn error:", error);
      
      // User-friendly error messages
      if (error.message.includes("Invalid login credentials")) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }
      
      return {
        success: false,
        message: error.message || "Failed to sign in",
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: "Authentication failed",
      };
    }

    console.log("[Auth] User signed in successfully");
    
    return { 
      success: true, 
      message: "Signed in successfully",
      user: data.user 
    };

  } catch (error: any) {
    console.error(`[Auth] SignIn Error:`, error);

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// ============================================
// 🚪 SIGN OUT FUNCTION
// ============================================
// Much simpler with Supabase!

export async function signOut() {
  try {
    const supabase = await createClient();
    
    // BEFORE (Firebase): cookieStore.delete("session")
    // AFTER (Supabase): One call handles everything
    
    await supabase.auth.signOut();
    
    return { success: true };
  } catch (error) {
    console.error("[Auth] SignOut error:", error);
    return { success: false };
  }
}

// ============================================
// 👤 GET CURRENT USER FUNCTION
// ============================================
// What changed:
// 1. Get user from Supabase auth session
// 2. Fetch additional data from PostgreSQL

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();

    // ============================================
    // Get authenticated user from Supabase
    // ============================================
    const { data: { user: authUser }, error } = await supabase.auth.getUser();

    if (error || !authUser) {
      return null;
    }

    // ============================================
    // Get full user data from PostgreSQL
    // ============================================
    // BEFORE (Firestore):
    // const userRecord = await db.collection("users").doc(uid).get()
    //
    // AFTER (Prisma):
    
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      // We can also include related data!
      // include: {
      //   interviews: true,
      //   notifications: true,
      // }
    });

    if (!user) {
      // Fallback: return basic info from auth
      return {
        id: authUser.id,
        email: authUser.email || "",
        name: authUser.user_metadata?.name || "User",
        role: "candidate",
      } as User;
    }

    return user as User;

  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// ============================================
// 🔒 CHECK AUTHENTICATION
// ============================================
// Helper function to check if user is logged in

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

// ============================================
// 📚 KEY LEARNING POINTS:
// ============================================
// 
// 1. **Supabase Auth is simpler than Firebase**
//    - Built-in session management
//    - Auto token refresh
//    - One SDK for client & server
//
// 2. **Prisma queries are type-safe**
//    - TypeScript autocomplete
//    - Compile-time error checking
//    - No more typos in field names!
//
// 3. **Separation of concerns**
//    - Supabase handles authentication
//    - PostgreSQL stores application data
//    - Clear, maintainable architecture
//
// 4. **Better error handling**
//    - Structured error codes
//    - Meaningful error messages
//    - Easier debugging
//
// ============================================
