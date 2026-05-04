'use client';

import React from 'react';
import { CertificationProvider } from '@/types/certification';

interface FilterSidebarProps {
  providers: CertificationProvider[];
  selectedProvider: string | null;
  onSelectProvider: (slug: string | null) => void;
  selectedLevel: string | null;
  onSelectLevel: (level: string | null) => void;
}

const LEVELS = ['Beginner', 'Associate', 'Professional', 'Expert'];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  providers, 
  selectedProvider, 
  onSelectProvider,
  selectedLevel,
  onSelectLevel
}) => {
  return (
    <div className="w-64 flex-shrink-0 space-y-8">
      {/* Providers Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Certification Provider</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              name="provider" 
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              checked={selectedProvider === null}
              onChange={() => onSelectProvider(null)}
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-900">All Providers</span>
          </label>
          
          {providers.map((provider) => (
            <label key={provider.id} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="provider" 
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                checked={selectedProvider === provider.slug}
                onChange={() => onSelectProvider(provider.slug)}
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">{provider.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Levels Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Experience Level</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              name="level" 
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              checked={selectedLevel === null}
              onChange={() => onSelectLevel(null)}
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-900">All Levels</span>
          </label>

          {LEVELS.map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="level" 
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                checked={selectedLevel === level}
                onChange={() => onSelectLevel(level)}
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">{level}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
