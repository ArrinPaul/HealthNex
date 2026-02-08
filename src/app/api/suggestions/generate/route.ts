import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate personalized suggestions based on the request
    const suggestions = await generatePersonalizedSuggestions(body);
    
    return NextResponse.json({
      suggestions,
      generatedAt: new Date(),
      refreshInterval: 30,
      success: true
    });
    
  } catch (error) {
    console.error('Suggestions API error:', error);
    
    // Return fallback suggestions
    return NextResponse.json({
      suggestions: getFallbackSuggestions(),
      generatedAt: new Date(),
      refreshInterval: 30,
      fallback: true
    });
  }
}

async function generatePersonalizedSuggestions(requestData: any) {
  const { location, healthProfile, preferences } = requestData;
  
  const suggestions = [];
  
  // Health-based suggestions
  suggestions.push({
    id: 'health-1',
    type: 'health',
    priority: 'high',
    title: 'Daily Health Check',
    description: 'Monitor your vital signs and track any symptoms. Early detection is key to better health outcomes.',
    action: 'Start Health Tracking',
    actionUrl: '/health-data',
    timestamp: new Date(),
    category: 'preventive'
  });
  
  // Water quality suggestions
  suggestions.push({
    id: 'water-1',
    type: 'water',
    priority: 'medium',
    title: 'Water Quality Monitoring',
    description: 'Check your local water quality reports and ensure proper filtration at home.',
    action: 'View Water Quality',
    actionUrl: '/water-quality',
    timestamp: new Date(),
    category: 'safety'
  });
  
  // AI-powered suggestions
  suggestions.push({
    id: 'ai-1',
    type: 'ai',
    priority: 'low',
    title: 'AI Health Assistant',
    description: 'Get personalized health advice and recommendations from our AI-powered health assistant.',
    action: 'Chat with AI',
    actionUrl: '/ai-features',
    timestamp: new Date(),
    category: 'assistance'
  });
  
  return suggestions;
}

function getFallbackSuggestions() {
  const currentHour = new Date().getHours();
  const currentMonth = new Date().getMonth();
  
  const suggestions = [
    {
      id: 'fallback-1',
      type: 'water',
      priority: 'medium',
      title: 'Daily Water Safety Check',
      description: 'Ensure your drinking water is properly purified before consumption. Check color, smell, and taste.',
      action: 'Learn More',
      actionUrl: '/education',
      timestamp: new Date(),
      category: 'water_safety',
      icon: 'Droplet'
    },
    {
      id: 'fallback-2',
      type: 'health',
      priority: 'low',
      title: 'Health Monitoring Reminder',
      description: 'Regular health monitoring helps in early detection of potential health issues.',
      action: 'View Health Data',
      actionUrl: '/health-data',
      timestamp: new Date(),
      category: 'preventive_care',
      icon: 'Heart'
    }
  ];

  // Add time-based suggestions
  if (currentHour >= 6 && currentHour <= 8) {
    suggestions.unshift({
      id: 'fallback-time',
      type: 'health',
      priority: 'high',
      title: 'Morning Water Safety',
      description: 'Peak contamination period detected. Ensure extra precaution with water consumption.',
      action: 'Set Reminder',
      actionUrl: '/education',
      timestamp: new Date(),
      category: 'time_based',
      icon: 'Clock'
    });
  }

  // Add seasonal suggestions
  if (currentMonth >= 5 && currentMonth <= 8) { // Monsoon season
    suggestions.push({
      id: 'fallback-season',
      type: 'emergency',
      priority: 'high',
      title: 'Monsoon Health Protocol',
      description: 'Increased risk of waterborne diseases during monsoon. Follow enhanced safety measures.',
      action: 'View Protocol',
      actionUrl: '/education',
      timestamp: new Date(),
      category: 'seasonal',
      icon: 'Activity'
    });
  }

  return suggestions;
}