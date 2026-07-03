import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('lat');
    const longitude = searchParams.get('lon');

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const weatherProvider = process.env.NEXT_PUBLIC_WEATHER_PROVIDER || 'open-meteo';

    let weatherData;

    if (weatherProvider === 'openweathermap') {
      weatherData = await getOpenWeatherMapData(latitude, longitude);
    } else {
      weatherData = await getOpenMeteoData(latitude, longitude);
    }

    return NextResponse.json(weatherData);

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

async function getOpenMeteoData(latitude: string, longitude: string) {
  const weatherUrl = `${process.env.NEXT_PUBLIC_WEATHER_API_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,windspeed_10m,precipitation,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;

  const response = await fetch(weatherUrl);
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data from Open-Meteo');
  }

  const data = await response.json();

  return {
    provider: 'open-meteo',
    current: {
      temperature: data.current_weather.temperature,
      humidity: data.hourly?.relative_humidity_2m?.[0] || 0,
      windSpeed: data.current_weather.windspeed,
      windDirection: data.current_weather.winddirection,
      weatherCode: data.current_weather.weathercode,
      condition: getOpenMeteoWeatherCondition(data.current_weather.weathercode),
      timestamp: data.current_weather.time
    },
    hourly: {
      time: data.hourly.time.slice(0, 24),
      temperature: data.hourly.temperature_2m.slice(0, 24),
      humidity: data.hourly.relative_humidity_2m.slice(0, 24),
      windSpeed: data.hourly.windspeed_10m.slice(0, 24),
      precipitation: data.hourly.precipitation.slice(0, 24),
      weatherCode: data.hourly.weathercode.slice(0, 24)
    },
    daily: {
      time: data.daily.time,
      temperatureMax: data.daily.temperature_2m_max,
      temperatureMin: data.daily.temperature_2m_min,
      weatherCode: data.daily.weathercode
    },
    location: {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    }
  };
}

async function getOpenWeatherMapData(latitude: string, longitude: string) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenWeatherMap API key not configured');
  }

  // Current weather
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
  
  // 5-day forecast
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

  const [currentResponse, forecastResponse] = await Promise.all([
    fetch(currentUrl),
    fetch(forecastUrl)
  ]);

  if (!currentResponse.ok || !forecastResponse.ok) {
    throw new Error('Failed to fetch weather data from OpenWeatherMap');
  }

  const currentData = await currentResponse.json();
  const forecastData = await forecastResponse.json();

  return {
    provider: 'openweathermap',
    current: {
      temperature: Math.round(currentData.main.temp),
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
      windDirection: currentData.wind.deg,
      weatherCode: currentData.weather[0].id,
      condition: currentData.weather[0].description,
      icon: currentData.weather[0].icon,
      timestamp: new Date(currentData.dt * 1000).toISOString()
    },
    hourly: {
      time: forecastData.list.slice(0, 8).map((item: any) => new Date(item.dt * 1000).toISOString()),
      temperature: forecastData.list.slice(0, 8).map((item: any) => Math.round(item.main.temp)),
      humidity: forecastData.list.slice(0, 8).map((item: any) => item.main.humidity),
      windSpeed: forecastData.list.slice(0, 8).map((item: any) => Math.round(item.wind.speed * 3.6)),
      precipitation: forecastData.list.slice(0, 8).map((item: any) => item.rain?.['3h'] || 0),
      condition: forecastData.list.slice(0, 8).map((item: any) => item.weather[0].description)
    },
    daily: {
      // OpenWeatherMap free tier only gives 5-day/3-hour forecast
      // We'll group by day for daily data
      time: [...new Set<string>(forecastData.list.map((item: any) => new Date(item.dt * 1000).toDateString()))]
        .slice(0, 5)
        .map((date: string) => new Date(date).toISOString().split('T')[0]),
      temperatureMax: groupDailyTemperatures(forecastData.list, 'max'),
      temperatureMin: groupDailyTemperatures(forecastData.list, 'min'),
      condition: groupDailyConditions(forecastData.list)
    },
    location: {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      city: currentData.name,
      country: currentData.sys.country
    }
  };
}

function groupDailyTemperatures(list: any[], type: 'max' | 'min') {
  const dailyTemps: { [key: string]: number[] } = {};
  
  list.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!dailyTemps[date]) dailyTemps[date] = [];
    dailyTemps[date].push(item.main.temp);
  });

  return Object.values(dailyTemps)
    .slice(0, 5)
    .map(temps => Math.round(type === 'max' ? Math.max(...temps) : Math.min(...temps)));
}

function groupDailyConditions(list: any[]) {
  const dailyConditions: { [key: string]: string } = {};
  
  list.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!dailyConditions[date]) {
      dailyConditions[date] = item.weather[0].description;
    }
  });

  return Object.values(dailyConditions).slice(0, 5);
}

function getOpenMeteoWeatherCondition(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };

  return weatherCodes[code] || 'Unknown';
}

function getWeatherCondition(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };

  return weatherCodes[code] || 'Unknown';
}