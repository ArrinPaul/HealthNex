import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseFacility(element: OverpassElement, userLat: number, userLng: number) {
  const tags = element.tags || {};
  const lat = element.lat || element.center?.lat || 0;
  const lng = element.lon || element.center?.lon || 0;
  const distance = haversineDistance(userLat, userLng, lat, lng);

  const name = tags.name || tags['name:en'] || tags['name:hi'] || 'Unknown Facility';
  const address = [tags['addr:street'], tags['addr:city'], tags['addr:state'], tags['addr:postcode']]
    .filter(Boolean)
    .join(', ') || tags.description || '';

  const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || '';
  const website = tags.website || tags['contact:website'] || '';
  const openingHours = tags.opening_hours || '';

  let isOpen: boolean | null = null;
  if (openingHours) {
    try {
      const now = new Date();
      const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      const today = dayNames[now.getDay()];
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const todayRange = openingHours.match(new RegExp(`${today}.*?(\\d{2}:\\d{2})-(\\d{2}:\\d{2})`));
      if (todayRange) {
        isOpen = timeStr >= todayRange[1] && timeStr <= todayRange[2];
      } else if (openingHours.includes('24/7')) {
        isOpen = true;
      }
    } catch {
      isOpen = null;
    }
  }

  const facilityType = tags.amenity === 'hospital'
    ? (tags.healthcare === 'hospital' || !tags.healthcare ? 'hospital' :
       tags.healthcare === 'clinic' ? 'clinic' :
       tags.healthcare === 'centre' ? 'health_center' : 'hospital')
    : tags.amenity === 'pharmacy' ? 'pharmacy'
    : tags.healthcare === 'laboratory' ? 'laboratory'
    : 'hospital';

  const specialties: string[] = [];
  if (tags.healthcare_specialty) {
    specialties.push(...tags.healthcare_specialty.split(';').map(s => s.trim()));
  }
  if (tags.emergency === 'yes') specialties.push('Emergency');
  if (tags['healthcare:speciality']) {
    specialties.push(...tags['healthcare:speciality'].split(';').map(s => s.trim()));
  }

  return {
    id: `${element.type}/${element.id}`,
    name,
    type: facilityType,
    address,
    phone,
    website,
    lat,
    lng,
    distance: Math.round(distance * 100) / 100,
    isOpen,
    openingHours,
    specialties,
    operator: tags.operator || tags.network || '',
    beds: tags.beds ? parseInt(tags.beds) : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '28.6139');
    const lng = parseFloat(searchParams.get('lng') || '77.2090');
    const radius = parseFloat(searchParams.get('radius') || '10');
    const type = searchParams.get('type') || 'all';

    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));
    const bbox = `${lat - latDelta},${lng - lngDelta},${lat + latDelta},${lng + lngDelta}`;

    const amenityFilter = type === 'pharmacy'
      ? '["amenity"="pharmacy"]'
      : type === 'hospital'
        ? '["amenity"="hospital"]'
        : '["amenity"~"hospital|pharmacy"]';

    const query = `
      [out:json][timeout:15];
      (
        node${amenityFilter}(${bbox});
        way${amenityFilter}(${bbox});
        relation${amenityFilter}(${bbox});
      );
      out center;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Overpass API returned ${response.status}`);
    }

    const data = await response.json();
    const elements: OverpassElement[] = data.elements || [];

    const facilities = elements
      .filter(el => el.tags?.name || (el.lat || el.center?.lat))
      .map(el => parseFacility(el, lat, lng))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 50);

    return NextResponse.json({
      facilities,
      meta: {
        center: { lat, lng },
        radius,
        count: facilities.length,
        source: 'OpenStreetMap',
      },
    });
  } catch (error: any) {
    console.error('Hospital API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hospital data', facilities: [] },
      { status: 500 }
    );
  }
}
