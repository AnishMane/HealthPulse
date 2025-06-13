import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Database, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Documentation = () => {
  const columns = [
    {
      name: 'week_of_outbreak',
      type: 'string',
      description: 'The week when the disease outbreak was reported. This helps track the temporal progression of diseases across different regions.',
      significance: 'Crucial for understanding disease patterns over time and identifying seasonal trends.'
    },
    {
      name: 'state_ut',
      type: 'string',
      description: 'The state or Union Territory where the disease outbreak occurred. India has 36 states and UTs.',
      significance: 'Helps in geographical analysis and understanding disease distribution across different administrative regions.'
    },
    {
      name: 'district',
      type: 'string',
      description: 'The specific district within a state/UT where the outbreak was reported. There are 791 unique districts in the dataset.',
      significance: 'Enables granular analysis of disease spread at the local level.'
    },
    {
      name: 'Disease',
      type: 'string',
      description: 'The name of the disease that was reported. The dataset covers 22 different diseases.',
      significance: 'Identifies which diseases are being tracked and their prevalence.'
    },
    {
      name: 'Cases',
      type: 'string',
      description: 'The number of reported cases for the specific disease in that district during that week.',
      significance: 'Primary metric for measuring disease burden and outbreak severity.'
    },
    {
      name: 'Deaths',
      type: 'float',
      description: 'The number of deaths reported due to the disease. Note: This data is only available for 2,554 out of 8,985 records.',
      significance: 'Indicates the severity and mortality impact of the disease.'
    },
    {
      name: 'Latitude',
      type: 'float',
      description: 'The geographical latitude of the district center. Values range from 8.08°N to 34.61°N.',
      significance: 'Used for mapping and spatial analysis of disease spread.'
    },
    {
      name: 'Longitude',
      type: 'float',
      description: 'The geographical longitude of the district center. Values range from 68.97°E to 95.95°E.',
      significance: 'Used for mapping and spatial analysis of disease spread.'
    },
    {
      name: 'preci',
      type: 'float',
      description: 'Precipitation data in millimeters. Average value is 0.46mm with a range from 0.000002mm to 5.68mm.',
      significance: 'Environmental factor that can influence disease spread, especially for water-borne diseases.'
    },
    {
      name: 'LAI',
      type: 'float',
      description: 'Leaf Area Index, a measure of vegetation density. Values range from 0 to 62, with an average of 10.91.',
      significance: 'Indicates vegetation cover which can affect disease vectors and environmental conditions.'
    },
    {
      name: 'Temp',
      type: 'float',
      description: 'Temperature in Kelvin (K). To convert to Celsius, subtract 273.15. Average temperature is 304.52K (31.37°C).',
      significance: 'Important environmental factor affecting disease spread and vector activity.'
    },
    {
      name: '__time',
      type: 'string',
      description: 'Timestamp of the data entry. The dataset contains 3,384 unique timestamps.',
      significance: 'Used for temporal analysis and tracking disease progression over time.'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
          <Database className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Dataset Documentation</h1>
          <p className="text-muted-foreground">Comprehensive guide to understanding the epidemiological dataset</p>
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">About the Dataset</AlertTitle>
        <AlertDescription className="text-blue-700">
          This documentation provides detailed information about the epidemiological dataset used in this application.
          The dataset contains 8,985 records with information about disease outbreaks across India, including environmental
          factors and geographical data.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Records</p>
                <p className="text-2xl font-bold text-blue-800">8,985</p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">States/UTs</p>
                <p className="text-2xl font-bold text-green-800">36</p>
              </div>
              <Database className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Districts</p>
                <p className="text-2xl font-bold text-purple-800">791</p>
              </div>
              <Database className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Diseases</p>
                <p className="text-2xl font-bold text-orange-800">22</p>
              </div>
              <Database className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Column Descriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Column Name</TableHead>
                  <TableHead className="w-[100px]">Data Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Significance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columns.map((column) => (
                  <TableRow key={column.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {column.name}
                        <Badge variant="outline" className="text-xs">
                          {column.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{column.type}</TableCell>
                    <TableCell className="max-w-md">{column.description}</TableCell>
                    <TableCell className="max-w-md">{column.significance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Quality Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Missing Data Points</AlertTitle>
              <AlertDescription>
                The dataset has some missing values that should be considered when analyzing the data:
              </AlertDescription>
            </Alert>
            <ul className="list-disc pl-6 space-y-2">
              <li className="flex items-center gap-2">
                <Badge variant="destructive">71.6%</Badge>
                <span>Deaths data is only available for 2,554 records</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="destructive">1.5%</Badge>
                <span>Precipitation data is missing for 136 records</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="destructive">24.4%</Badge>
                <span>LAI (Leaf Area Index) data is missing for 2,195 records</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="destructive">10.4%</Badge>
                <span>Temperature data is missing for 938 records</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documentation; 