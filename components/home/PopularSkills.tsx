"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

interface Skill {
  name: string;
  slug: string;
}

interface PopularSkillsProps {
  skills?: Skill[];
}

const PopularSkills: React.FC<PopularSkillsProps> = ({ skills = [] }) => {
  const { t } = useLanguage();

  if (!skills || skills.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t.home.exploreTopSkills}</h2>
            <Link href="/categories" className="text-purple-600 font-bold hover:text-purple-700 flex items-center text-sm">
                {t.home.viewAll} <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {skills.map((skill) => (
            <Link 
                key={skill.slug} 
                href={`/categories/${skill.slug}`}
                className="bg-white border border-gray-300 rounded-full px-5 py-3 font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors shadow-sm"
            >
              {skill.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularSkills;
