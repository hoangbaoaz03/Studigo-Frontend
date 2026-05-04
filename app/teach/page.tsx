"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  GraduationCap, 
  DollarSign, 
  Users, 
  Globe, 
  Video, 
  BarChart3, 
  CheckCircle,
  ArrowRight
} from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Earn Money",
    description: "Get paid for every student who enrolls in your course. Set your own pricing."
  },
  {
    icon: Users,
    title: "Reach Millions",
    description: "Access our global community of learners eager to learn new skills."
  },
  {
    icon: Globe,
    title: "Teach Globally",
    description: "Share your knowledge with students from over 180 countries."
  },
  {
    icon: Video,
    title: "Easy Tools",
    description: "Our platform makes it simple to create and upload video content."
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description: "Get detailed analytics on your courses and student engagement."
  },
  {
    icon: GraduationCap,
    title: "Support",
    description: "Access our instructor community and resources to help you succeed."
  }
];

const steps = [
  {
    number: "1",
    title: "Plan your curriculum",
    description: "Start with your passion and knowledge. Choose a topic you're an expert in."
  },
  {
    number: "2",
    title: "Record your video",
    description: "Use basic tools like a smartphone or webcam to record engaging content."
  },
  {
    number: "3",
    title: "Launch your course",
    description: "Publish your course on our marketplace and start earning."
  }
];

export default function TeachPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Come teach with us
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Become an instructor and change lives — including your own
          </p>
          <Link href={user ? (user.is_instructor ? "/instructor/dashboard" : "/teach/apply") : "/register?redirect=/teach/apply"}>
            <Button size="lg" className="text-lg px-8 py-6 bg-white text-slate-900 hover:bg-gray-100">
              {user?.is_instructor ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary mb-2">75M+</p>
              <p className="text-gray-600">Students worldwide</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">70K+</p>
              <p className="text-gray-600">Instructors</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">$1B+</p>
              <p className="text-gray-600">Paid to instructors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            So many reasons to start
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <benefit.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            How to begin
          </h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">
            Become an instructor today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join one of the world's largest online learning marketplaces.
          </p>
          <Link href={user ? (user.is_instructor ? "/instructor/dashboard" : "/teach/apply") : "/register?redirect=/teach/apply"}>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              {user?.is_instructor ? "Go to Dashboard" : "Start Teaching Today"}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
