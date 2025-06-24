// lib/api.ts
import { DesignInputBE, DesignResultsBE, MetaDataResponse } from '../types'; // Adjust path

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const fetchMetaData = async (): Promise<MetaDataResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/meta-data`);
  if (!response.ok) {
    throw new Error('Failed to fetch metadata');
  }
  return response.json();
};

export const calculateDesign = async (payload: DesignInputBE): Promise<DesignResultsBE> => {
  const response = await fetch(`${API_BASE_URL}/api/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Calculation failed: ${response.statusText}`);
  }
  return response.json();
};

export const loadExampleData = async (): Promise<DesignInputBE> => {
  const response = await fetch(`${API_BASE_URL}/api/load-example`);
  if (!response.ok) {
    throw new Error('Failed to load example data');
  }
  return response.json();
};

// Add function for /api/ai-report-data if needed for "Export Report"
export const getAIReportData = async (payload: DesignInputBE): Promise<DesignResultsBE> => {
    const response = await fetch(`${API_BASE_URL}/api/ai-report-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to get AI report data: ${response.statusText}`);
    }
    return response.json();
};