"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeroSearchProps {
  headline?: string;
  subheadline?: string;
  placeholder?: string;
}

const HeroSearch: React.FC<HeroSearchProps> = ({
  headline = "Học kỹ năng mới, mở lối thành công.",
  subheadline = "Tìm kiếm trong hơn 10,000 khóa học về công nghệ, kinh doanh và hơn thế nữa.",
  placeholder = "Bạn muốn học gì hôm nay?"
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="relative w-full py-20 bg-white">
        {/* Abstract minimalistic background shape */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50 -skew-x-12 opacity-50 z-0 hidden lg:block"></div>
        
        <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    {headline}
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    {subheadline}
                </p>
                
                {/* Large Search Bar */}
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto shadow-lg rounded-full">
                    <div className="relative flex items-center w-full h-14 rounded-full focus-within:ring-2 focus-within:ring-purple-600 bg-white border border-gray-300 overflow-hidden">
                        <div className="grid place-items-center h-full w-12 text-gray-400">
                            <Search className="h-5 w-5" />
                        </div>
                        <input
                            className="peer h-full w-full outline-none text-base text-gray-700 bg-transparent pr-4"
                            type="text"
                            placeholder={placeholder}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                         <Button 
                            type="submit"
                            className="h-full rounded-none rounded-r-full px-8 bg-purple-600 hover:bg-purple-700 text-white font-bold text-base"
                         >
                            Tìm kiếm
                         </Button>
                    </div>
                </form>
                
                <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-gray-500">
                    <span>Phổ biến:</span>
                    <button onClick={() => router.push('/categories/python')} className="hover:text-purple-600 underline">Python</button>
                    <button onClick={() => router.push('/categories/excel')} className="hover:text-purple-600 underline">Excel</button>
                    <button onClick={() => router.push('/categories/web-development')} className="hover:text-purple-600 underline">Web Dev</button>
                    <button onClick={() => router.push('/categories/marketing')} className="hover:text-purple-600 underline">Marketing</button>
                </div>
            </div>
        </div>
    </section>
  );
};

export default HeroSearch;
