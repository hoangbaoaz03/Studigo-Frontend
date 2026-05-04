import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CtaData {
    title: string;
    description: string;
    cta: string;
}

interface CallToActionProps {
    data?: CtaData
}

const CallToAction: React.FC<CallToActionProps> = ({ data }) => {
    if (!data) return null;

    return (
        <section className="py-20 bg-gray-900 text-center">
            <div className="container mx-auto px-6 max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    {data.title}
                </h2>
                <p className="text-lg text-gray-300 mb-8">
                    {data.description}
                </p>
                <Link href="/register">
                    <Button size="lg" className="font-bold bg-purple-600 hover:bg-purple-700 px-8 text-lg py-6 h-auto">
                        {data.cta}
                    </Button>
                </Link>
            </div>
        </section>
    );
};

export default CallToAction;
