import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

interface CaseStudyData {
    company: string;
    title: string;
    quote: string;
    logo: string;
    image: string;
}

const CaseStudy: React.FC<{ data: CaseStudyData }> = ({ data }) => {
    const { t } = useLanguage();

    return (
        <section className="py-12 px-4 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
                 <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                    {/* Image Area - darker bg to make image pop if transparent, or just cover */}
                    <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-full">
                         <img 
                            src={data.image} 
                            alt="Case Study" 
                            className="absolute inset-0 w-full h-full object-cover"
                         />
                    </div>

                    {/* Content Area */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                        <div className="mb-6">
                             <img src={data.logo} alt={data.company} className="h-10 object-contain object-left mb-4" />
                             <h3 className="text-2xl font-bold text-gray-900 leading-snug">
                                {data.title}
                            </h3>
                        </div>
                        
                         <blockquote className="text-lg text-gray-700 italic border-l-4 border-purple-600 pl-4 mb-8">
                            "{data.quote}"
                        </blockquote>

                        <Link href="/business/case-studies" className="inline-flex items-center text-purple-700 font-bold hover:text-purple-900 transition-colors group self-start">
                            {t.home.readFullStory} 
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"/>
                        </Link>
                    </div>
                 </div>
            </div>
        </section>
    );
};

export default CaseStudy;
