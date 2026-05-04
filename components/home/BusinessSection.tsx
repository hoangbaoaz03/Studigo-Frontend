import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface BusinessData {
    title: string;
    description: string;
    cta: string;
    image: string;
}

interface BusinessSectionProps {
    data?: BusinessData
}

const BusinessSection: React.FC<BusinessSectionProps> = ({ data }) => {
    if (!data) return null;

    return (
        <section className="py-16 bg-white border-t border-gray-100">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-12 bg-gray-900 rounded-2xl overflow-hidden p-8 md:p-12 text-white">
                    <div className="w-full md:w-1/2 order-2 md:order-1">
                        <h2 className="text-3xl font-bold mb-4">{data.title}</h2>
                        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                            {data.description}
                        </p>
                        <Link href="/business">
                            <Button size="lg" className="font-bold bg-white text-gray-900 hover:bg-gray-100 px-8">
                                {data.cta}
                            </Button>
                        </Link>
                    </div>
                     <div className="w-full md:w-1/2 order-1 md:order-2">
                        <img 
                            src={data.image}
                            alt="Studigo Business" 
                            className="w-full h-auto rounded-lg shadow-lg object-cover opacity-90"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BusinessSection;
