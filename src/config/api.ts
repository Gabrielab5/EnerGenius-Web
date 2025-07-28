/**
 * API Configuration
 * Centralized configuration for all external API endpoints
 */

export const API_ENDPOINTS = {
  XLSX_TO_TEXT: process.env.REACT_APP_XLSX_TO_TEXT_API as string,
  ELECTRICITY_ANALYSIS: process.env.REACT_APP_ELECTRICITY_ANALYSIS_API as string,
  ELECTRICITY_FORECAST_AI: process.env.REACT_APP_ELECTRICITY_FORECAST_AI_API as string,
} as const;

export type ApiEndpoint = keyof typeof API_ENDPOINTS;