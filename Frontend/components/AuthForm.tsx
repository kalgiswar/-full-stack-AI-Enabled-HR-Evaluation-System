"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@backend/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });
};

const AuthForm = ({ type, onToggleMode }: { type: FormType; onToggleMode?: () => void }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        // ============================================
        // SIGN UP with Supabase
        // ============================================
        const { name, email, password } = data;

        toast.loading("Creating your account...");
        
        const result = await signUp({
          name: name!,
          email,
          password,
        });

        toast.dismiss();

        if (!result.success) {
          toast.error(result.error || "Failed to create account");
          return;
        }

        toast.success("Account created successfully! Please sign in.");
        
        if (onToggleMode) {
          onToggleMode(); // Switch to sign-in view
        } else {
          router.push("/sign-in");
        }
      } else {
        // ============================================
        // SIGN IN with Supabase
        // ============================================
        const { email, password } = data;

        toast.loading("Signing in...");

        const result = await signIn({
          email,
          password,
        });

        toast.dismiss();

        if (!result.success) {
          toast.error(result.error || "Failed to sign in");
          return;
        }

        toast.success("Signed in successfully!");
        
        // Force full reload to ensure session is established
        window.location.href = "/";
      }
    } catch (error: any) {
      toast.dismiss();
      console.error("Auth error:", error);
      toast.error(error?.message || "An error occurred during authentication");
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        {/* ... Header ... */}
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">Hireguard</h2>
        </div>

        <h3>Practice job interviews with AI</h3>

        <Form {...form}>
           {/* ... Form Fields ... */}
           <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button className="btn" type="submit">
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          {onToggleMode ? (
             <span
                onClick={onToggleMode}
                className="font-bold text-user-primary ml-1 cursor-pointer hover:underline"
             >
                {!isSignIn ? "Sign In" : "Sign Up"}
             </span>
          ) : (
              <Link
                href={!isSignIn ? "/sign-in" : "/sign-up"}
                className="font-bold text-user-primary ml-1"
              >
                {!isSignIn ? "Sign In" : "Sign Up"}
              </Link>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
