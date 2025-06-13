import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendResponse, TopDiseasesResponse, epidemiologyAPI } from '@/services/api';
import FilterSection from './FilterSection';
import LoadingSpinner from './LoadingSpinner';
import { Activity, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Dashboard = () => {
  const [trendData, setTrendData] = useState<TrendResponse | null>(null);
  const [topDiseases, setTopDiseases] = useState<TopDiseasesResponse | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDisease, setSelectedDisease] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const dateRange = await epidemiologyAPI.getDateRange();
        if (dateRange.max_date) {
          setSelectedWeek(dateRange.max_date);
        }
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error fetching date range:', error);
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedState && selectedWeek) {
      fetchTopDiseases();
    }
  }, [selectedState, selectedWeek]);

  useEffect(() => {
    if (selectedState && selectedDisease) {
      fetchTrendData();
    }
  }, [selectedState, selectedDisease]);

  const fetchTrendData = async () => {
    if (!selectedState || !selectedDisease) return;
    
    setLoading(true);
    setError(null);
    try {
      const trendResponse = await epidemiologyAPI.getTrendData(selectedState, selectedDisease);
      setTrendData(trendResponse);
      console.log('Trend Response:', trendResponse);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      setError('Failed to fetch trend data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopDiseases = async () => {
    if (!selectedState || !selectedWeek) return;
    
    setLoading(true);
    setError(null);
    try {
      const topDiseasesResponse = await epidemiologyAPI.getTopDiseases(selectedState, selectedWeek);
      setTopDiseases(topDiseasesResponse);
      console.log('Top Diseases Response:', topDiseasesResponse);
      
      if (!topDiseasesResponse.diseases || topDiseasesResponse.diseases.length === 0) {
        console.warn('No top diseases data available for the selected parameters');
      }
    } catch (error) {
      console.error('Error fetching top diseases:', error);
      setError('Failed to fetch top diseases data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedState('');
    setSelectedDisease('');
    setSelectedWeek('');
    setTrendData(null);
    setTopDiseases(null);
  };

  if (!initialLoadComplete) {
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

  const totalCases = trendData?.data.reduce((sum, item) => sum + item.cases, 0) || 0;
  const weeklyAverage = Math.round(totalCases / (trendData?.data.length || 1));

  return (
    <div className="space-y-6">
      <FilterSection
        selectedState={selectedState}
        selectedDisease={selectedDisease}
        selectedWeek={selectedWeek}
        onStateChange={setSelectedState}
        onDiseaseChange={setSelectedDisease}
        onWeekChange={setSelectedWeek}
        onReset={handleReset}
        showWeek={true}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCases.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weeklyAverage.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Disease Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData?.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" tickFormatter={(str) => {
                        try {
                          return format(parseISO(str), 'yyyy-MM-dd');
                        } catch {
                          return str;
                        }
                      }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="cases" stroke="#8884d8" name="Cases" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Diseases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {topDiseases?.diseases && topDiseases.diseases.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topDiseases.diseases}
                          dataKey="total_cases"
                          nameKey="disease"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {topDiseases.diseases.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No disease data available for the selected parameters</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
