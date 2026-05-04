'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PlayCircle, Calendar, CheckCircle2, Loader2, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

export default function BusinessDemoPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company_name: '',
    team_size: '',
    request_type: 'DEMO'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
         description: "Our team will contact you to schedule your demo.",
         variant: "default",
         duration: 3000,
       });
    } catch (error) {
       console.error("Submission failed", error);
       toast({
         title: "Submission Failed",
         description: "Please try again later.",
         variant: "destructive",
       });
    } finally {
       setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-lg border-t-4 border-t-purple-600">
           <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-purple-600" />
           </div>
           <h2 className="text-3xl font-bold text-gray-900">Request Sent!</h2>
           <p className="text-gray-600">
             Thanks for your interest. We'll be in touch shortly to schedule a personalized walkthrough of Studigo Business.
           </p>
           <div className="flex flex-col gap-3">
             <Link href="/business">
               <Button variant="outline" className="w-full">Back to Business</Button>
             </Link>
           </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar Placeholder adjustment would happen globally, just simplified layout here */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Video & Value */}
          <div className="space-y-8">
             <div>
                <Badge className="mb-4 bg-purple-900/50 text-purple-300 hover:bg-purple-900/50 border border-purple-700 px-3 py-1">Interactive Demo</Badge>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                   See Studigo in action
                </h1>
                <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                   Watch how leading organizations use our platform to upskill their workforce and drive business results.
                </p>
             </div>

             {/* Video Placeholder */}
             <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl group cursor-pointer hover:border-purple-500/50 transition-colors">
                <div className="absolute inset-0 flex items-center justify-center z-10">
                   <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-10 h-10 text-white" fill="currentColor" />
                   </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop" 
                  alt="Platform Preview" 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                />
                <div className="absolute bottom-4 left-4 right-4 z-20">
                   <div className="flex items-center gap-2 text-sm font-medium">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Platform Walkthrough (2:14)
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                   <CheckCircle2 className="w-4 h-4 text-purple-400" />
                   <span>Admin Dashboard Tour</span>
                </div>
                 <div className="flex items-center gap-2">
                   <CheckCircle2 className="w-4 h-4 text-purple-400" />
                   <span>Team Management</span>
                </div>
                 <div className="flex items-center gap-2">
                   <CheckCircle2 className="w-4 h-4 text-purple-400" />
                   <span>Analytics & Reporting</span>
                </div>
                 <div className="flex items-center gap-2">
                   <CheckCircle2 className="w-4 h-4 text-purple-400" />
                   <span>Learning Paths</span>
                </div>
             </div>
          </div>

          {/* Right Column: Scheduling Form */}
          <div className="bg-white text-gray-900 p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200">
             <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Book a Live Demo</h2>
                <p className="text-gray-600">
                   Get a personalized tour from our sales team.
                </p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input 
                         id="full_name" 
                         name="full_name" 
                         placeholder="Jane Smith" 
                         required 
                         className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                         value={formData.full_name}
                         onChange={handleChange}
                      />
                   </div>
                   <div className="space-y-2">
                      <Label htmlFor="email">Work Email</Label>
                      <Input 
                         id="email" 
                         name="email" 
                         type="email" 
                         placeholder="jane@company.com" 
                         required 
                         className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                         value={formData.email}
                         onChange={handleChange}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label htmlFor="company_name">Company Name</Label>
                   <Input 
                      id="company_name" 
                      name="company_name" 
                      placeholder="Acme Global" 
                      required 
                      className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      value={formData.company_name}
                      onChange={handleChange}
                   />
                </div>

                <div className="space-y-2">
                   <Label htmlFor="team_size">Team Size</Label>
                   <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <select
                         id="team_size"
                         name="team_size"
                         className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9 focus:bg-white transition-colors"
                         required
                         value={formData.team_size}
                         onChange={handleChange}
                      >
                         <option value="">Select number of learners...</option>
                         <option value="1-10">1-10 Employees</option>
                         <option value="11-50">11-50 Employees</option>
                         <option value="51-200">51-200 Employees</option>
                         <option value="201-1000">201-1,000 Employees</option>
                         <option value="1000+">1,000+ Employees</option>
                      </select>
                   </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20" disabled={isLoading}>
                   {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Scheduling...
                      </>
                   ) : "Schedule Demo"}
                </Button>

                <p className="text-xs text-center text-gray-400 mt-4">
                   Prefer to email? <a href="#" className="underline hover:text-purple-600">sales@studigo.com</a>
                </p>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
}
