import React from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface BannerProps {
  title: string;
  description: string;
  cta: string;
  image: string;
  reverse?: boolean; // If true, image is on the left
  href?: string;
}

const Banner: React.FC<BannerProps> = ({ title, description, cta, image, reverse = false, href }) => {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className={`flex flex-col md:flex-row items-center gap-12 ${reverse ? 'md:flex-row-reverse' : ''}`}>
          
          {/* Content */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {description}
            </p>
            {href ? (
              <Link href={href}>
                <Button size="lg" className="font-bold bg-gray-900 hover:bg-gray-800 text-white px-6">
                  {cta}
                </Button>
              </Link>
            ) : (
              <Button size="lg" className="font-bold bg-gray-900 hover:bg-gray-800 text-white px-6">
                {cta}
              </Button>
            )}
          </div>

          {/* Image */}
          <div className="w-full md:w-1/2">
             <img 
                src={image} 
                alt={title} 
                className="w-full h-auto rounded-lg shadow-md object-cover md:max-h-[400px]"
              />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Banner;
