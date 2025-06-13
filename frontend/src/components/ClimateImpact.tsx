import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ClimateImpactResponse, epidemiologyAPI } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner from './LoadingSpinner';
import { Thermometer, CloudRain, Leaf, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const ClimateImpact = () => {
  const [climateData, setClimateData] = useState<ClimateImpactResponse | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<string>('');
  const [diseases, setDiseases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await epidemiologyAPI.getDiseases();
        setDiseases(response.diseases);
        if (response.diseases.length > 0) {
          setSelectedDisease(response.diseases[0]);
        }
      } catch (error) {
        console.error('Error fetching diseases:', error);
        setError('Failed to load diseases');
      }
    };
    fetchDiseases();
  }, []);

  useEffect(() => {
    if (selectedDisease) {
      fetchClimateData();
    }
  }, [selectedDisease]);

  const fetchClimateData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await epidemiologyAPI.getClimateImpact(selectedDisease);
      setClimateData(response);
    } catch (error) {
      console.error('Error fetching climate data:', error);
      setError('Failed to fetch climate data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!climateData) {
    return null;
  }

  const { climate_metrics, time_series } = climateData;
  const totalCases = time_series.reduce((sum, item) => sum + item.cases, 0);

  return (
    <div className="space-y-6">
      {/* Disease Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Climate Impact Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full md:w-64">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Select Disease
            </label>
            <Select value={selectedDisease} onValueChange={setSelectedDisease}>
              <SelectTrigger>
                <SelectValue placeholder="Select disease" />
              </SelectTrigger>
              <SelectContent>
                {diseases.map((disease) => (
                  <SelectItem key={disease} value={disease}>
                    {disease}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Climate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Avg Temperature</p>
                <p className="text-2xl font-bold text-red-800">{climate_metrics.avg_temp.toFixed(1)}°C</p>
              </div>
              <Thermometer className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Avg Precipitation</p>
                <p className="text-2xl font-bold text-blue-800">{climate_metrics.avg_precipitation.toFixed(1)}mm</p>
              </div>
              <CloudRain className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Avg LAI</p>
                <p className="text-2xl font-bold text-green-800">{climate_metrics.avg_lai.toFixed(2)}</p>
              </div>
              <Leaf className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Cases</p>
                <p className="text-2xl font-bold text-purple-800">{totalCases.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Climate Data Charts */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Climate Factors vs {selectedDisease} Cases Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={time_series} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tickFormatter={(str) => {
                    try {
                      return format(parseISO(str), 'yyyy-MM-dd');
                    } catch {
                      return str;
                    }
                  }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#ef4444" 
                    name="Temperature (°C)"
                    dot={false}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="precipitation" 
                    stroke="#3b82f6" 
                    name="Precipitation (mm)"
                    dot={false}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="cases" 
                    stroke="#10b981" 
                    name="Cases"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leaf Area Index (LAI) Impact Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={time_series} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tickFormatter={(str) => {
                    try {
                      return format(parseISO(str), 'yyyy-MM-dd');
                    } catch {
                      return str;
                    }
                  }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="lai" 
                    stroke="#22c55e" 
                    name="LAI Index"
                    dot={false}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="cases" 
                    stroke="#8b5cf6" 
                    name="Cases"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClimateImpact;
