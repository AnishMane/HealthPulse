import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to format date for API calls
const formatDateForAPI = (date: string): string => {
  // If the date is already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  // Otherwise, try to parse and format it
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return date;
  }
};

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorMessage = error.response?.data?.detail || error.message;
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: errorMessage,
    });
    return Promise.reject(new Error(errorMessage));
  }
);

export interface TrendDataPoint {
  week: string;
  cases: number;
}

export interface TrendResponse {
  state_ut: string;
  disease: string;
  data: TrendDataPoint[];
}

export interface DiseaseRanking {
  disease: string;
  total_cases: number;
}

export interface TopDiseasesResponse {
  state_ut: string;
  week: string;
  diseases: DiseaseRanking[];
}

export interface ClimateMetrics {
  avg_temp: number;
  avg_precipitation: number;
  avg_lai: number;
}

export interface ClimateDataPoint {
  week: string;
  cases: number;
  temp: number;
  precipitation: number;
  lai: number;
}

export interface ClimateImpactResponse {
  disease: string;
  climate_metrics: ClimateMetrics;
  time_series: ClimateDataPoint[];
}

export interface MapDataPoint {
  district: string;
  state_ut: string;
  latitude: number;
  longitude: number;
  total_cases: number;
}

export interface MapResponse {
  week: string;
  disease: string;
  locations: MapDataPoint[];
}

export const epidemiologyAPI = {
  getTrendData: async (state_ut: string, disease: string): Promise<TrendResponse> => {
    try {
      const response = await api.get(`/trend?state_ut=${encodeURIComponent(state_ut)}&disease=${encodeURIComponent(disease)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trend data:', error);
      throw error;
    }
  },

  getTopDiseases: async (state_ut: string, week: string): Promise<TopDiseasesResponse> => {
    try {
      const formattedWeek = formatDateForAPI(week);
      const response = await api.get(`/top-diseases?state_ut=${encodeURIComponent(state_ut)}&week=${encodeURIComponent(formattedWeek)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top diseases:', error);
      throw error;
    }
  },

  getClimateImpact: async (disease: string): Promise<ClimateImpactResponse> => {
    try {
      const response = await api.get(`/climate-impact?disease=${encodeURIComponent(disease)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching climate impact:', error);
      throw error;
    }
  },

  getMapData: async (week: string, disease: string): Promise<MapResponse> => {
    try {
      const formattedWeek = formatDateForAPI(week);
      const response = await api.get(`/map?week=${encodeURIComponent(formattedWeek)}&disease=${encodeURIComponent(disease)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching map data:', error);
      throw error;
    }
  },

  getDiseases: async (): Promise<{ diseases: string[] }> => {
    try {
      const response = await api.get('/diseases');
      if (!response.data?.diseases) {
        throw new Error('Invalid response format from diseases endpoint');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching diseases:', error);
      throw error;
    }
  },

  getStates: async (): Promise<{ states: string[] }> => {
    try {
      const response = await api.get('/states');
      if (!response.data?.states) {
        throw new Error('Invalid response format from states endpoint');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching states:', error);
      throw error;
    }
  },

  getDateRange: async (): Promise<{ min_date: string; max_date: string }> => {
    try {
      const response = await api.get('/weeks');
      if (!response.data?.min_date || !response.data?.max_date) {
        throw new Error('Invalid response format from date range endpoint');
      }
      return {
        min_date: formatDateForAPI(response.data.min_date),
        max_date: formatDateForAPI(response.data.max_date)
      };
    } catch (error) {
      console.error('Error fetching date range:', error);
      throw error;
    }
  },
};

// Mock data for development
export const mockData = {
  states: ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan'],
  diseases: ['Dengue', 'Malaria', 'Chikungunya', 'H1N1', 'Typhoid', 'Hepatitis'],
  weeks: ['2024-W01', '2024-W02', '2024-W03', '2024-W04', '2024-W05'],
  
  generateTrendData: (): TrendDataPoint[] => {
    const data: TrendDataPoint[] = [];
    mockData.states.forEach(state => {
      mockData.diseases.forEach(disease => {
        mockData.weeks.forEach(week => {
          data.push({
            week,
            cases: Math.floor(Math.random() * 1000) + 50,
          });
        });
      });
    });
    return data;
  },

  generateTopDiseases: (): DiseaseRanking[] => [
    { disease: 'Dengue', total_cases: 1250 },
    { disease: 'Malaria', total_cases: 980 },
    { disease: 'Chikungunya', total_cases: 650 },
    { disease: 'H1N1', total_cases: 420 },
    { disease: 'Typhoid', total_cases: 250 },
  ],

  generateClimateData: (): ClimateDataPoint[] => 
    mockData.states.map(state => ({
      week: mockData.weeks[Math.floor(Math.random() * mockData.weeks.length)],
      cases: Math.floor(Math.random() * 1000) + 100,
      temp: 25 + Math.random() * 15,
      precipitation: Math.random() * 200,
      lai: Math.random() * 5,
    })),

  generateMapData: (): MapDataPoint[] => {
    const data: MapDataPoint[] = [];
    mockData.states.forEach(state => {
      for (let i = 0; i < 5; i++) {
        data.push({
          district: `${state} District ${i + 1}`,
          state_ut: state,
          latitude: 20 + Math.random() * 15,
          longitude: 70 + Math.random() * 15,
          total_cases: Math.floor(Math.random() * 500) + 10,
        });
      }
    });
    return data;
  },
};
