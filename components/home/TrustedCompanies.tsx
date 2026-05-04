import React from 'react';
import Image from 'next/image';

interface Company {
  name: string;
  logo: string;
}

interface TrustedCompaniesProps {
  companies?: Company[];
  title?: string;
}

const TrustedCompanies: React.FC<TrustedCompaniesProps> = ({ 
  companies = [], 
  title = "Được hơn 15,000 công ty và hàng triệu người học tin dùng" 
}) => {
  // If no companies provided, use defaults or return null
  if (!companies || companies.length === 0) return null;

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">{title}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
          {companies.map((company, index) => (
            <div key={index} className="relative h-12 w-32 filter hover:brightness-110">
               {/* Using simple img tag for external SVGs to avoid next/image domain config issues for now */}
              <img 
                src={company.logo} 
                alt={company.name} 
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedCompanies;
