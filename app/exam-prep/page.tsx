'use client';

import React, { useEffect, useState } from 'react';
import { ExamPrepHero } from '@/components/certification/ExamPrepHero';
import { FilterSidebar } from '@/components/certification/FilterSidebar';
import { CertificationCard } from '@/components/certification/CertificationCard';
import { certificationApi } from '@/lib/api/certification';
import { Certification, CertificationProvider } from '@/types/certification';

export default function ExamPrepPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [providers, setProviders] = useState<CertificationProvider[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [certsData, providersData] = await Promise.all([
          certificationApi.getCertifications(),
          certificationApi.getProviders()
        ]);
        setCertifications(certsData);
        setProviders(providersData);
      } catch (error) {
        console.error("Failed to fetch exam prep data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Client-side filtering for simplicity (or use API params)
  const filteredCerts = certifications.filter(cert => {
    if (selectedProvider && cert.provider.slug !== selectedProvider) return false;
    if (selectedLevel && cert.level !== selectedLevel) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ExamPrepHero />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <FilterSidebar 
              providers={providers}
              selectedProvider={selectedProvider}
              onSelectProvider={setSelectedProvider}
              selectedLevel={selectedLevel}
              onSelectLevel={setSelectedLevel}
            />
          </aside>

          {/* Main Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {filteredCerts.length} Certifications Available
              </h2>
              {/* Sort dropdown could go here */}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredCerts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCerts.map(cert => (
                  <CertificationCard key={cert.id} certification={cert} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No certifications found matching filters.</p>
                <button 
                  onClick={() => {setSelectedProvider(null); setSelectedLevel(null);}}
                  className="mt-4 text-blue-600 font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
