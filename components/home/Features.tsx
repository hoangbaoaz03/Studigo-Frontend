import React from 'react';
import { PlayCircle, Star, Clock, LucideIcon } from 'lucide-react';

// Map string icon names to Lucide components
const iconMap: { [key: string]: LucideIcon } = {
  PlayCircle,
  Star,
  Clock
};

interface FeatureItem {
  id: number;
  icon: string;
  title: string;
  description: string;
  color?: string;
}

interface FeaturesProps {
  features?: FeatureItem[];
}

const Features: React.FC<FeaturesProps> = ({ features = [] }) => {
  if (!features || features.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const IconComponent = iconMap[feature.icon] || Star;
            
            return (
              <div key={feature.id} className="flex gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
