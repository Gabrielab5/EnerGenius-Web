/**
 * API Configuration
 * Centralized configuration for all external API endpoints
 */

export const API_ENDPOINTS = {
  XLSX_TO_TEXT: 'https://xlsxtotext-160356915851.us-central1.run.app',
  ELECTRICITY_ANALYSIS: 'https://electricalculation-160356915851.europe-west1.run.app',
  ELECTRICITY_FORECAST_AI: 'https://electricforcastai-160356915851.us-central1.run.app',
} as const;

export type ApiEndpoint = keyof typeof API_ENDPOINTS;