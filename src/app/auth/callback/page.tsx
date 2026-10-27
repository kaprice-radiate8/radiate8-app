/** WHERE SIGN-IN LINKS LAND (web address: /auth/callback) */
import type { Metadata } from "next";
import { AuthCallback } from "@/components/account/AuthCallback";

export const metadata: Metadata = { title: "Signing in" };

export default function AuthCallbackPage() {
  return <AuthCallback />;
}
