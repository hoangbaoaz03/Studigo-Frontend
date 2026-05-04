"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setError("");
    try {
      await register(formData);
    } catch (err: any) {
      if (err.response?.data) {
        const data = err.response.data;
        // Handle DRF object errors { field: [errors], ... }
        if (typeof data === 'object') {
            const messages = Object.entries(data).map(([key, value]) => {
                const msg = Array.isArray(value) ? value.join(' ') : value;
                return `${key}: ${msg}`;
            });
            setError(messages.join(' | '));
        } else {
             setError(String(data));
        }
      } else {
        setError("Registration failed. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 py-10">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle>Sign up and start learning</CardTitle>
          <CardDescription>Join our global community of learners.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                   <Label htmlFor="first_name">First Name</Label>
                   <Input id="first_name" value={formData.first_name} onChange={handleChange} required />
                </div>
                <div className="flex flex-col space-y-1.5">
                   <Label htmlFor="last_name">Last Name</Label>
                   <Input id="last_name" value={formData.last_name} onChange={handleChange} required />
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>
               <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password2">Confirm Password</Label>
                <Input id="password2" type="password" value={formData.password2} onChange={handleChange} required />
              </div>
              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            </div>
            <Button className="w-full mt-6 font-bold" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign Up"}
            </Button>
          </form>
          <SocialLoginButtons />
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
            <p className="text-sm text-gray-600">
                Already have an account? <Link href="/login" className="font-bold text-slate-900 hover:underline">Log in</Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
