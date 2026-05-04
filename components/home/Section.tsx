import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  hasBorder?: boolean;
  className?: string; // Additional custom classes if needed
}

const Section: React.FC<SectionProps> = ({ 
  children, 
  hasBorder = true,
  className = "" 
}) => {
  return (
    <section 
      className={`
        w-full 
        py-12 md:py-16 
        ${hasBorder ? 'border-t border-gray-200' : ''} 
        ${className}
      `}
    >
      <div className="container mx-auto px-6 max-w-[1340px]">
        {children}
      </div>
    </section>
  );
};

export default Section;
