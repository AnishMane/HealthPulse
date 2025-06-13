import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { epidemiologyAPI } from '@/services/api';

interface FilterSectionProps {
  selectedState?: string;
  selectedDisease?: string;
  selectedWeek?: string;
  onStateChange?: (state: string) => void;
  onDiseaseChange?: (disease: string) => void;
  onWeekChange?: (week: string) => void;
  onReset?: () => void;
  showWeek?: boolean;
}

const FilterSection = ({
  selectedState,
  selectedDisease,
  selectedWeek,
  onStateChange,
  onDiseaseChange,
  onWeekChange,
  onReset,
  showWeek = false,
}: FilterSectionProps) => {
  const [states, setStates] = useState<string[]>([]);
  const [diseases, setDiseases] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchFilterData = async () => {
      if (initialLoadComplete) return;
      
      setLoading(true);
      setError(null);
      try {
        const [statesResponse, diseasesResponse, dateRangeResponse] = await Promise.all([
          epidemiologyAPI.getStates(),
          epidemiologyAPI.getDiseases(),
          epidemiologyAPI.getDateRange()
        ]);

        if (!isMounted) return;

        setStates(statesResponse.states);
        setDiseases(diseasesResponse.diseases);
        
        // Generate weeks from date range
        if (dateRangeResponse.min_date && dateRangeResponse.max_date) {
          const minDate = new Date(dateRangeResponse.min_date);
          const maxDate = new Date(dateRangeResponse.max_date);
          const weekList: string[] = [];
          
          let currentDate = new Date(minDate);
          while (currentDate <= maxDate) {
            weekList.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 7);
          }
          
          setWeeks(weekList);

          // Set initial week if not already set
          if (onWeekChange && !selectedWeek) {
            onWeekChange(dateRangeResponse.max_date);
          }
        }

        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error fetching filter data:', error);
        if (isMounted) {
          setError('Failed to load filter options');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFilterData();

    return () => {
      isMounted = false;
    };
  }, [initialLoadComplete, onWeekChange, selectedWeek]);

  if (loading && !initialLoadComplete) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !initialLoadComplete) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center justify-between">
          Filters
          {onReset && (
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {onStateChange && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">State/UT</label>
              <Select value={selectedState || ""} onValueChange={onStateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {onDiseaseChange && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Disease</label>
              <Select value={selectedDisease || ""} onValueChange={onDiseaseChange}>
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
          )}

          {showWeek && onWeekChange && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Week</label>
              <Select value={selectedWeek || ""} onValueChange={onWeekChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
                <SelectContent>
                  {weeks.map((week) => (
                    <SelectItem key={week} value={week}>
                      {new Date(week).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterSection;
