"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Extend Window to include Facebook SDK types
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init: (params: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: { authResponse?: { accessToken: string } }) => void,
        options?: { scope: string }
      ) => void;
    };
  }
}

// Sub-component that uses the Google OAuth hook (must be inside GoogleOAuthProvider)
function GoogleLoginButton({
  onLogin,
  loading,
  disabled,
}: {
  onLogin: (token: string) => Promise<void>;
  loading: boolean;
  disabled: boolean;
}) {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await onLogin(tokenResponse.access_token);
    },
    onError: (error) => {
      console.error("Google login error:", error);
      toast.error("Đăng nhập Google thất bại");
    },
  });

  return (
    <Button
      variant="outline"
      type="button"
      onClick={() => googleLogin()}
      disabled={disabled}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg
          className="mr-2 h-4 w-4"
          aria-hidden="true"
          focusable="false"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
          />
        </svg>
      )}
      Google
    </Button>
  );
}

export default function SocialLoginButtons() {
  const { socialLogin } = useAuth();
  const [loading, setLoading] = useState<"google" | "facebook" | null>(null);
  const [fbReady, setFbReady] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  // Check if OAuth credentials are properly configured
  const isGoogleConfigured = !!(
    googleClientId &&
    googleClientId !== "YOUR_GOOGLE_CLIENT_ID" &&
    googleClientId !== "YOUR_GOOGLE_CLIENT_ID_HERE"
  );
  const isFacebookConfigured = !!(
    fbAppId && fbAppId !== "YOUR_FACEBOOK_APP_ID_HERE"
  );

  // Load Facebook SDK
  useEffect(() => {
    if (!isFacebookConfigured) return;

    window.fbAsyncInit = () => {
      window.FB.init({
        appId: fbAppId!,
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
      setFbReady(true);
    };

    // If FB SDK already loaded (e.g. hot reload), just re-init
    if (window.FB) {
      window.FB.init({
        appId: fbAppId!,
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
      setFbReady(true);
      return;
    }

    // Load the SDK script if not already present
    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [isFacebookConfigured, fbAppId]);

  const handleGoogleLogin = useCallback(
    async (accessToken: string) => {
      try {
        setLoading("google");
        await socialLogin("google", accessToken);
        toast.success("Đăng nhập bằng Google thành công!");
      } catch (error: any) {
        const message =
          error.response?.data?.error || "Đăng nhập Google thất bại";
        toast.error(message);
      } finally {
        setLoading(null);
      }
    },
    [socialLogin]
  );

  const handleFacebookLogin = useCallback(() => {
    if (!window.FB) {
      toast.error("Facebook SDK chưa tải xong, vui lòng thử lại.");
      return;
    }

    setLoading("facebook");
    window.FB.login(
      async (response) => {
        if (response?.authResponse?.accessToken) {
          try {
            await socialLogin("facebook", response.authResponse.accessToken);
            toast.success("Đăng nhập bằng Facebook thành công!");
          } catch (error: any) {
            const message =
              error.response?.data?.error || "Đăng nhập Facebook thất bại";
            toast.error(message);
          } finally {
            setLoading(null);
          }
        } else {
          toast.error("Đăng nhập Facebook bị hủy hoặc thất bại");
          setLoading(null);
        }
      },
      { scope: "public_profile,email" }
    );
  }, [socialLogin]);

  // Don't render social buttons at all if neither provider is configured
  if (!isGoogleConfigured && !isFacebookConfigured) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">
            Hoặc tiếp tục với
          </span>
        </div>
      </div>

      <div
        className={`grid gap-3 mt-2 ${
          isGoogleConfigured && isFacebookConfigured
            ? "grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        {isGoogleConfigured && (
          <GoogleLoginButton
            onLogin={handleGoogleLogin}
            loading={loading === "google"}
            disabled={loading !== null}
          />
        )}

        {isFacebookConfigured && (
          <Button
            variant="outline"
            type="button"
            onClick={handleFacebookLogin}
            disabled={loading !== null || !fbReady}
          >
            {loading === "facebook" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg
                className="mr-2 h-4 w-4 text-[#1877F2]"
                aria-hidden="true"
                focusable="false"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.8 90.69 226.4 209.3 245V327.7h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.3 482.4 504 379.8 504 256z"
                />
              </svg>
            )}
            Facebook
          </Button>
        )}
      </div>
    </div>
  );
}
