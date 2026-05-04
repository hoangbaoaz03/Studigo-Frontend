import axios from 'axios';
import { Certification, CertificationDetail, CertificationProvider } from '@/types/certification';

// Use the existing axios instance if available, or create a simple one
// Assuming generic axios usage for now based on project structure
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const certificationApi = {
  async getCertifications(params?: any): Promise<Certification[]> {
    const response = await axios.get(`${API_URL}/certification/certifications/`, { params });
    return response.data.results || response.data;
  },

  async getCertificationBySlug(slug: string): Promise<CertificationDetail> {
    const response = await axios.get(`${API_URL}/certification/certifications/${slug}/`);
    return response.data;
  },

  async getProviders(): Promise<CertificationProvider[]> {
    const response = await axios.get(`${API_URL}/certification/providers/`);
    return response.data.results || response.data;
  }
};
