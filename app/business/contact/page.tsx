'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Building2, Users, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

export default function BusinessContactPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company_name: '',
    team_size: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
       await api.post('/business/leads/', formData);
       setIsSuccess(true);
       toast({
         title: "Request Received",
         description: "Our sales team will contact you shortly.",
         variant: "default",
       });
    } catch (error: any) {
       console.error("Submission failed", error);
       const errorMsg = error.response?.data?.email?.[0] || error.response?.data?.message || "Please try again later.";
       toast({
         title: "Submission Failed",
         description: errorMsg,
         variant: "destructive",
       });
    } finally {
       setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
           <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
           </div>
           <h2 className="text-3xl font-bold text-gray-900">Thank You!</h2>
           <p className="text-gray-600">
             We have received your interest in Studigo Business. A member of our team will be in touch within 24 hours.
           </p>
           <Link href="/business">
             <Button className="w-full">Back to Business Home</Button>
           </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column: Value Props */}
          <div className="space-y-10">
             <div>
                <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1">Contact Sales</Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                   Transform your workforce with Studigo
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                   Get a custom learning plan tailored to your organization's goals. Scale faster with the skills that matter.
                </p>
             </div>

             <div className="space-y-6">
                {[
                   "Unlimited access to 10,000+ top courses",
                   "Custom learning paths for your teams",
                   "Advanced analytics and usage reporting",
                   "Dedicated customer success manager",
                   "SSO and LMS integrations"
                ].map((item, idx) => (
                   <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-lg text-gray-700 font-medium">{item}</span>
                   </div>
                ))}
             </div>

             <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                   <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                         <div key={i} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white" />
                      ))}
                   </div>
                   <div className="font-bold text-gray-900">
                      Trusted by 5,000+ companies
                   </div>
                </div>
                <p className="text-sm text-gray-500">
                   "Studigo Business has completely revolutionized how we upskill our engineering team. The ROI was evident within months."
                </p>
             </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-200 shadow-xl relative top-0 lg:-top-8">
             <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get in touch</h2>
                <p className="text-gray-600">Fill out the form below and we'll help you find the right plan.</p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                   <Label htmlFor="full_name">Full Name</Label>
                   <Input 
                      id="full_name" 
                      name="full_name" 
                      placeholder="John Doe" 
                      required 
                      value={formData.full_name}
                      onChange={handleChange}
                   />
                </div>

                <div>
                   <Label htmlFor="email">Work Email</Label>
                   <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="john@company.com" 
                      required 
                      value={formData.email}
                      onChange={handleChange}
                   />
                </div>

                <div>
                   <Label htmlFor="company_name">Company Name</Label>
                   <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                         id="company_name" 
                         name="company_name" 
                         className="pl-9" 
                         placeholder="Acme Inc." 
                         required 
                         value={formData.company_name}
                         onChange={handleChange}
                      />
                   </div>
                </div>

                <div>
                   <Label htmlFor="team_size">Team Size (Learners)</Label>
                   <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <select
                         id="team_size"
                         name="team_size"
                         className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                         required
                         value={formData.team_size}
                         onChange={handleChange}
                      >
                         <option value="">Select team size...</option>
                         <option value="1-10">1-10 Employees</option>
                         <option value="11-50">11-50 Employees</option>
                         <option value="51-200">51-200 Employees</option>
                         <option value="201-1000">201-1,000 Employees</option>
                         <option value="1000+">1,000+ Employees</option>
                      </select>
                   </div>
                </div>

                <div>
                   <Label htmlFor="message">How can we help?</Label>
                   <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="Tell us about your training needs..." 
                      className="min-h-[100px]"
                      value={formData.message}
                      onChange={handleChange}
                   />
                </div>

                <Button type="submit" className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                   {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                   ) : "Request Demo"}
                </Button>

                <p className="text-xs text-center text-gray-500">
                   By clicking "Request Demo", you agree to our Terms of Service and Privacy Policy.
                </p>
             </form>
          </div>

        </div>
      </div>
    </div>
  );
}
