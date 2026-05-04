import React from 'react';
import { Quote } from 'lucide-react';

interface TestimonialItem {
  id: number;
  content: string;
  author: string;
  course: string;
}

interface TestimonialsProps {
  testimonials?: TestimonialItem[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials = [] }) => {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((item) => (
        <div key={item.id} className="bg-gray-50/50 p-8 rounded-2xl hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-gray-100 flex flex-col h-full group">
          <div className="mb-6">
            <Quote className="h-10 w-10 text-blue-100 fill-current group-hover:text-blue-500 transition-colors duration-300" />
          </div>
          <p className="text-gray-700 mb-8 flex-grow font-medium text-lg leading-relaxed italic">"{item.content}"</p>
          <div className="flex items-center gap-4 mt-auto">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                {item.author.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">{item.author}</p>
              <p className="text-sm text-gray-500 font-medium">{item.course}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Testimonials;
