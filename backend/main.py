from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import json
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app initialization
app = FastAPI(
    title="Epidemiological Data Analytics API",
    description="Analytics API for epidemiological data stored in Apache Druid",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
DRUID_BROKER_URL = "http://localhost:8082"  # Configure your Druid broker URL
DRUID_SQL_ENDPOINT = f"{DRUID_BROKER_URL}/druid/v2/sql"

# Response models
class TrendDataPoint(BaseModel):
    week: str
    cases: int

class TrendResponse(BaseModel):
    state_ut: str
    disease: str
    data: List[TrendDataPoint]

class DiseaseRanking(BaseModel):
    disease: str
    total_cases: int

class TopDiseasesResponse(BaseModel):
    state_ut: str
    week: str
    diseases: List[DiseaseRanking]

class ClimateMetrics(BaseModel):
    avg_temp: float
    avg_precipitation: float
    avg_lai: float

class ClimateDataPoint(BaseModel):
    week: str
    cases: int
    temp: float
    precipitation: float
    lai: float

class ClimateImpactResponse(BaseModel):
    disease: str
    climate_metrics: ClimateMetrics
    time_series: List[ClimateDataPoint]

class MapDataPoint(BaseModel):
    district: str
    state_ut: str
    latitude: float
    longitude: float
    total_cases: int

class MapResponse(BaseModel):
    week: str
    disease: str
    locations: List[MapDataPoint]

# Druid client class
class DruidClient:
    def __init__(self, broker_url: str):
        self.broker_url = broker_url
        self.sql_endpoint = f"{broker_url}/druid/v2/sql"
    
    async def execute_sql(self, query: str) -> List[Dict[str, Any]]:
        """Execute SQL query against Druid"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.sql_endpoint,
                    json={"query": query},
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Druid query failed: {e}")
            raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Initialize Druid client
druid_client = DruidClient(DRUID_BROKER_URL)

@app.get("/", summary="Health Check")
async def root():
    """Health check endpoint"""
    return {"message": "Epidemiological Data Analytics API is running"}

@app.get("/trend", response_model=TrendResponse, summary="Get disease trend over time")
async def get_trend(
    state_ut: str = Query(..., description="State/UT name"),
    disease: str = Query(..., description="Disease name")
):
    """
    Get weekly case trend over time for selected state and disease.
    """
    query = f"""
    SELECT 
        DATE_TRUNC('week', __time) as week,
        SUM(Cases) as total_cases
    FROM inline_data
    WHERE state_ut = '{state_ut}' AND Disease = '{disease}'
    GROUP BY DATE_TRUNC('week', __time)
    ORDER BY week ASC
    """
    
    try:
        result = await druid_client.execute_sql(query)
        
        trend_data = [
            TrendDataPoint(
                week=row["week"],
                cases=int(row["total_cases"]) if row["total_cases"] else 0
            )
            for row in result
        ]
        
        return TrendResponse(
            state_ut=state_ut,
            disease=disease,
            data=trend_data
        )
    
    except Exception as e:
        logger.error(f"Error in get_trend: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/top-diseases", response_model=TopDiseasesResponse, summary="Get top diseases by case count")
async def get_top_diseases(
    state_ut: str = Query(..., description="State/UT name"),
    week: str = Query(None, description="Week in YYYY-MM-DD format (optional)")
):
    """
    Get top 5 diseases by case count for the specified state.
    """
    try:
        # Clean up the state name by trimming spaces
        cleaned_state = state_ut.strip()
        logger.info(f"Fetching top diseases for state: {cleaned_state}")
        
        query = f"""
        SELECT 
            Disease,
            SUM(CASE 
                WHEN Cases IS NULL THEN 0 
                ELSE Cases 
            END) as total_cases
        FROM inline_data
        WHERE TRIM(state_ut) = '{cleaned_state}'
            AND Cases IS NOT NULL
        GROUP BY Disease
        HAVING SUM(CASE 
            WHEN Cases IS NULL THEN 0 
            ELSE Cases 
        END) > 0
        ORDER BY total_cases DESC
        LIMIT 5
        """
        
        # Log the query for debugging
        logger.info(f"Executing query: {query}")
        
        result = await druid_client.execute_sql(query)
        
        # Log the query result for debugging
        logger.info(f"Query returned {len(result)} results")
        logger.info(f"Query result: {result}")
        
        if not result:
            logger.warning(f"No data found for state: {cleaned_state}")
            return TopDiseasesResponse(
                state_ut=cleaned_state,
                week="All Time",
                diseases=[]
            )
        
        diseases = [
            DiseaseRanking(
                disease=row["Disease"],
                total_cases=int(row["total_cases"])
            )
            for row in result
        ]
        
        return TopDiseasesResponse(
            state_ut=cleaned_state,
            week="All Time",
            diseases=diseases
        )
    
    except Exception as e:
        logger.error(f"Error in get_top_diseases: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/climate-impact", response_model=ClimateImpactResponse, summary="Get climate impact on disease")
async def get_climate_impact(
    disease: str = Query(..., description="Disease name")
):
    """
    Get correlation and time series of climate variables (Temp, preci, LAI) for the disease.
    """
    # Query for overall climate metrics
    metrics_query = f"""
    SELECT 
        AVG(Temp) as avg_temp,
        AVG(preci) as avg_precipitation,
        AVG(LAI) as avg_lai
    FROM inline_data
    WHERE Disease = '{disease}'
        AND Temp IS NOT NULL 
        AND preci IS NOT NULL 
        AND LAI IS NOT NULL
    """
    
    # Query for time series data
    timeseries_query = f"""
    SELECT 
        DATE_TRUNC('week', __time) as week,
        SUM(Cases) as total_cases,
        AVG(Temp) as avg_temp,
        AVG(preci) as avg_precipitation,
        AVG(LAI) as avg_lai
    FROM inline_data
    WHERE Disease = '{disease}'
        AND Temp IS NOT NULL 
        AND preci IS NOT NULL 
        AND LAI IS NOT NULL
    GROUP BY DATE_TRUNC('week', __time)
    ORDER BY week ASC
    """
    
    try:
        # Execute both queries
        metrics_result = await druid_client.execute_sql(metrics_query)
        timeseries_result = await druid_client.execute_sql(timeseries_query)
        
        # Parse metrics
        if metrics_result:
            metrics_row = metrics_result[0]
            climate_metrics = ClimateMetrics(
                avg_temp=float(metrics_row["avg_temp"]) - 273.15 if metrics_row["avg_temp"] else 0.0,
                avg_precipitation=float(metrics_row["avg_precipitation"]) if metrics_row["avg_precipitation"] else 0.0,
                avg_lai=float(metrics_row["avg_lai"]) if metrics_row["avg_lai"] else 0.0
            )
        else:
            climate_metrics = ClimateMetrics(avg_temp=0.0, avg_precipitation=0.0, avg_lai=0.0)
        
        # Parse time series
        time_series = [
            ClimateDataPoint(
                week=row["week"],
                cases=int(row["total_cases"]) if row["total_cases"] else 0,
                temp=float(row["avg_temp"]) - 273.15 if row["avg_temp"] else 0.0,
                precipitation=float(row["avg_precipitation"]) if row["avg_precipitation"] else 0.0,
                lai=float(row["avg_lai"]) if row["avg_lai"] else 0.0
            )
            for row in timeseries_result
        ]
        
        return ClimateImpactResponse(
            disease=disease,
            climate_metrics=climate_metrics,
            time_series=time_series
        )
    
    except Exception as e:
        logger.error(f"Error in get_climate_impact: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/map", response_model=MapResponse, summary="Get geographic data for map visualization")
async def get_map_data(
    week: str = Query(..., description="Week in YYYY-MM-DD format"),
    disease: str = Query(..., description="Disease name")
):
    """
    Get list of districts with geo-coordinates and total cases for map heatmap visualization.
    """
    query = f"""
    SELECT 
        district,
        state_ut,
        AVG(Latitude) as latitude,
        AVG(Longitude) as longitude,
        SUM(Cases) as total_cases
    FROM inline_data
    WHERE DATE_TRUNC('week', __time) = TIMESTAMP '{week}'
        AND Disease = '{disease}'
        AND Latitude IS NOT NULL 
        AND Longitude IS NOT NULL
    GROUP BY district, state_ut
    HAVING SUM(Cases) > 0
    ORDER BY total_cases DESC
    """
    
    try:
        result = await druid_client.execute_sql(query)
        
        locations = [
            MapDataPoint(
                district=row["district"],
                state_ut=row["state_ut"],
                latitude=float(row["latitude"]) if row["latitude"] else 0.0,
                longitude=float(row["longitude"]) if row["longitude"] else 0.0,
                total_cases=int(row["total_cases"]) if row["total_cases"] else 0
            )
            for row in result
        ]
        
        return MapResponse(
            week=week,
            disease=disease,
            locations=locations
        )
    
    except Exception as e:
        logger.error(f"Error in get_map_data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Additional utility endpoints
@app.get("/diseases", summary="Get list of all diseases")
async def get_diseases():
    """Get list of all available diseases in the dataset"""
    query = "SELECT DISTINCT Disease FROM inline_data ORDER BY Disease"
    
    try:
        result = await druid_client.execute_sql(query)
        diseases = [row["Disease"] for row in result if row["Disease"]]
        return {"diseases": diseases}
    
    except Exception as e:
        logger.error(f"Error in get_diseases: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/states", summary="Get list of all states/UTs")
async def get_states():
    """Get list of all available states/UTs in the dataset"""
    query = "SELECT DISTINCT state_ut FROM inline_data ORDER BY state_ut"
    
    try:
        result = await druid_client.execute_sql(query)
        states = [row["state_ut"] for row in result if row["state_ut"]]
        return {"states": states}
    
    except Exception as e:
        logger.error(f"Error in get_states: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/weeks", summary="Get available date range")
async def get_date_range():
    """Get the available date range in the dataset"""
    query = """
    SELECT 
        MIN(__time) as min_date,
        MAX(__time) as max_date
    FROM inline_data
    """
    
    try:
        result = await druid_client.execute_sql(query)
        if result:
            return {
                "min_date": result[0]["min_date"],
                "max_date": result[0]["max_date"]
            }
        return {"min_date": None, "max_date": None}
    
    except Exception as e:
        logger.error(f"Error in get_date_range: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)