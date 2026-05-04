"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LearningProvider } from "@/context/LearningContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

export function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Only wrap with GoogleOAuthProvider if a valid client ID is configured
  const isGoogleConfigured = !!(
    googleClientId &&
    googleClientId !== "YOUR_GOOGLE_CLIENT_ID" &&
    googleClientId !== "YOUR_GOOGLE_CLIENT_ID_HERE"
  );

  const content = (
    <AuthProvider>
      <CartProvider>
        <LearningProvider>{children}</LearningProvider>
      </CartProvider>
    </AuthProvider>
  );

  if (isGoogleConfigured) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {content}
      </GoogleOAuthProvider>
    );
  }

  // Without valid Google credentials, render without the OAuth wrapper
  // Google login button will show an appropriate message when clicked
  return content;
}
