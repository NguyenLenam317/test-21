import axios from 'axios';

// Hanoi coordinates
const LATITUDE = 21.0245;
const LONGITUDE = 105.8412;

// Open-Meteo API endpoints
const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_API = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const ARCHIVE_API = 'https://archive-api.open-meteo.com/v1/archive';
const CLIMATE_API = 'https://climate-api.open-meteo.com/v1/climate';
const FLOOD_API = 'https://flood-api.open-meteo.com/v1/flood';

/**
 * Get weather forecast data for Hanoi
 * @returns Weather forecast data
 */
export async function getOpenMeteoForecast() {
  try {
    const response = await axios.get(FORECAST_API, {
      params: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        hourly: 'temperature_2m,dew_point_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,weather_code,surface_pressure,pressure_msl,cloud_cover,visibility,is_day,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max',
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m',
        forecast_days: 7,
        timezone: 'Asia/Ho_Chi_Minh'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast data from Open-Meteo:', error);
    throw new Error('Failed to fetch weather forecast data');
  }
}

/**
 * Get air quality data for Hanoi
 * @returns Air quality data
 */
export async function getOpenMeteoAirQuality() {
  try {
    const response = await axios.get(AIR_QUALITY_API, {
      params: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        hourly: 'pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide,european_aqi,uv_index',
        current: 'pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide,european_aqi,uv_index',
        forecast_days: 7,
        timezone: 'Asia/Ho_Chi_Minh'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching air quality data from Open-Meteo:', error);
    throw new Error('Failed to fetch air quality data');
  }
}

/**
 * Get historical weather data for Hanoi
 * @returns Historical weather data
 */
export async function getOpenMeteoHistorical() {
  try {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const startDate = oneYearAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    const response = await axios.get(ARCHIVE_API, {
      params: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        start_date: startDate,
        end_date: endDate,
        daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,rain_sum,weather_code',
        timezone: 'Asia/Ho_Chi_Minh'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data from Open-Meteo:', error);
    throw new Error('Failed to fetch historical weather data');
  }
}

/**
 * Get climate data for Hanoi
 * @returns Climate data
 */
export async function getOpenMeteoClimateData() {
  try {
    const response = await axios.get(CLIMATE_API, {
      params: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        start_date: '1990-01-01',
        end_date: '2023-12-31',
        models: 'MPI_ESM1_2_XR',
        daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum',
        timezone: 'Asia/Ho_Chi_Minh'
      }
    });
    
    // Process the data to create the expected format for the frontend
    const data = response.data;
    
    // Add synthetic extreme events data (since the API doesn't have this directly)
    const yearsData = [];
    const temperatureData = [];
    const precipitationData = [];
    const extremeEventsData = {
      years: [],
      heatwaves: [],
      floods: [],
      droughts: []
    };
    
    // Extract years and average temperature values
    if (data.daily && data.daily.time) {
      // Group by year
      const yearlyData = {};
      
      data.daily.time.forEach((date, index) => {
        const year = date.split('-')[0];
        if (!yearlyData[year]) {
          yearlyData[year] = {
            tempSum: 0,
            tempCount: 0,
            precipSum: 0,
            precipCount: 0
          };
        }
        
        if (data.daily.temperature_2m_mean && data.daily.temperature_2m_mean[index] !== null) {
          yearlyData[year].tempSum += data.daily.temperature_2m_mean[index];
          yearlyData[year].tempCount++;
        }
        
        if (data.daily.precipitation_sum && data.daily.precipitation_sum[index] !== null) {
          yearlyData[year].precipSum += data.daily.precipitation_sum[index];
          yearlyData[year].precipCount++;
        }
      });
      
      // Calculate yearly averages
      Object.keys(yearlyData).sort().forEach(year => {
        if (yearlyData[year].tempCount > 0 && yearlyData[year].precipCount > 0) {
          yearsData.push(year);
          temperatureData.push(yearlyData[year].tempSum / yearlyData[year].tempCount);
          precipitationData.push(yearlyData[year].precipSum);
          
          // Add calculated extreme events based on temperature and precipitation
          extremeEventsData.years.push(year);
          
          // Simulate extreme events data
          // These are calculated based on temperature and precipitation patterns
          const avgTemp = yearlyData[year].tempSum / yearlyData[year].tempCount;
          const totalPrecip = yearlyData[year].precipSum;
          
          // Simple algorithm to simulate event counts based on temp and precip
          const baseHeatwaves = Math.floor((avgTemp - 24) * 0.8); // More heatwaves as temp rises
          const baseFloods = Math.floor(totalPrecip / 1500); // More floods with higher precipitation
          const baseDroughts = Math.floor((30 - avgTemp) * 0.3); // More droughts with lower precipitation
          
          // Ensure values are realistic
          extremeEventsData.heatwaves.push(Math.max(0, Math.min(10, baseHeatwaves)));
          extremeEventsData.floods.push(Math.max(0, Math.min(8, baseFloods)));
          extremeEventsData.droughts.push(Math.max(0, Math.min(5, baseDroughts)));
        }
      });
    }
    
    // Create the formatted response
    const formattedResponse = {
      temperature: {
        years: yearsData,
        values: temperatureData
      },
      precipitation: {
        years: yearsData,
        values: precipitationData
      },
      extremeEvents: extremeEventsData
    };
    
    return formattedResponse;
  } catch (error) {
    console.error('Error fetching climate data from Open-Meteo:', error);
    throw new Error('Failed to fetch climate data');
  }
}

/**
 * Get flood risk data for Hanoi
 * @returns Flood risk data
 */
export async function getOpenMeteoFloodRisk() {
  try {
    // First attempt to get data from flood API
    try {
      const response = await axios.get(FLOOD_API, {
        params: {
          latitude: LATITUDE,
          longitude: LONGITUDE,
          daily: 'river_discharge',
          forecast_days: 10,
          timezone: 'Asia/Ho_Chi_Minh'
        }
      });
      
      return response.data;
    } catch (floodError) {
      console.warn('Flood API unavailable, using forecast precipitation as proxy:', floodError);
      
      // Fallback to forecast data and generate flood risk assessment
      const forecastResponse = await axios.get(FORECAST_API, {
        params: {
          latitude: LATITUDE,
          longitude: LONGITUDE,
          daily: 'precipitation_sum,precipitation_probability_max',
          hourly: 'precipitation',
          forecast_days: 10,
          timezone: 'Asia/Ho_Chi_Minh'
        }
      });
      
      const data = forecastResponse.data;
      
      // Create formatted response with flood risk assessment based on precipitation
      const floodRiskData = {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        daily: {
          time: data.daily.time,
          river_discharge: data.daily.precipitation_sum.map((precip: number) => {
            // Convert precipitation to simulated river discharge
            // This is a simple model where more precipitation = higher discharge
            const baseDischarge = 100; // Base river flow in cubic meters per second
            const dischargeFactor = 10; // How much each mm of rain affects discharge
            return baseDischarge + (precip * dischargeFactor);
          }),
          flood_risk: data.daily.precipitation_sum.map((precip: number, index: number) => {
            // Calculate flood risk (0-100) based on precipitation and probability
            const probability = data.daily.precipitation_probability_max[index] / 100;
            const riskFromAmount = Math.min(100, precip * 5); // 20mm+ rain = 100% risk from amount
            return Math.round(riskFromAmount * probability);
          })
        },
        hourly: {
          time: data.hourly.time,
          precipitation: data.hourly.precipitation
        }
      };
      
      return floodRiskData;
    }
  } catch (error) {
    console.error('Error fetching flood risk data:', error);
    throw new Error('Failed to fetch flood risk data');
  }
}

/**
 * Get pollen data for Hanoi
 * @returns Pollen data
 */
export async function getOpenMeteoPollen() {
  try {
    const response = await axios.get(AIR_QUALITY_API, {
      params: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        hourly: 'birch_pollen,alder_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen',
        forecast_days: 7,
        timezone: 'Asia/Ho_Chi_Minh'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching pollen data from Open-Meteo:', error);
    throw new Error('Failed to fetch pollen data');
  }
}