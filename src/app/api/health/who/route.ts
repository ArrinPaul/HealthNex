import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const disease = searchParams.get('disease') || 'cholera'; // cholera or malaria

    const indicatorCode = disease === 'malaria' ? 'MDG_0000000016' : 'WHS3_48';
    
    // Query WHO OData endpoint filtered by India (IND)
    const whoUrl = `https://ghoapi.azureedge.net/api/${indicatorCode}?$filter=SpatialDim eq 'IND'`;

    const response = await fetch(whoUrl, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`WHO GHO API returned status: ${response.status}`);
    }

    const data = await response.json();
    
    // Sort and clean WHO OData records
    const records = (data.value || [])
      .map((item: any) => ({
        year: parseInt(item.TimeDim) || item.TimeDim,
        cases: parseFloat(item.NumericValue) || 0,
        country: 'India',
        source: 'WHO Global Health Observatory'
      }))
      .sort((a: any, b: any) => b.year - a.year); // Latest years first

    return NextResponse.json({
      success: true,
      disease,
      records: records.slice(0, 15) // Return last 15 years
    });

  } catch (error: any) {
    console.error('WHO Health API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch WHO data' },
      { status: 500 }
    );
  }
}
