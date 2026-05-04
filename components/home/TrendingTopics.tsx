"use client";

import React from 'react';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

interface Topic {
  id: number;
  name: string;
  slug: string;
}

interface TrendingTopicsProps {
  topics?: Topic[];
}

const TrendingTopics: React.FC<TrendingTopicsProps> = ({ topics = [] }) => {
  if (!topics || topics.length === 0) return null;

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            Xu hướng hiện nay
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {topics.map((topic) => (
            <Link 
                key={topic.id} 
                href={`/categories/${topic.slug}`}
                className="group flex flex-col justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow h-24"
            >
              <span className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors line-clamp-2">
                {topic.name}
              </span>
              <span className="text-xs text-gray-500 mt-2">2M+ người học</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingTopics;
