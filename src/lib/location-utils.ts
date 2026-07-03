// Shared state/district coordinate lookup for India
export const STATE_DISTRICTS: Record<string, Array<{ name: string; lat: number; lng: number }>> = {
  "Andhra Pradesh": [
    { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
    { name: "Vijayawada", lat: 16.5062, lng: 80.6480 },
    { name: "Guntur", lat: 16.3067, lng: 80.4365 }
  ],
  "Arunachal Pradesh": [
    { name: "Itanagar", lat: 27.0844, lng: 93.6053 },
    { name: "Tawang", lat: 27.5860, lng: 91.8594 }
  ],
  "Assam": [
    { name: "Guwahati", lat: 26.1445, lng: 91.7362 },
    { name: "Dibrugarh", lat: 27.4728, lng: 94.9120 },
    { name: "Silchar", lat: 24.8333, lng: 92.7789 },
    { name: "Jorhat", lat: 26.7509, lng: 94.2037 }
  ],
  "Bihar": [
    { name: "Patna", lat: 25.5941, lng: 85.1376 },
    { name: "Gaya", lat: 24.7955, lng: 84.9994 },
    { name: "Muzaffarpur", lat: 26.1209, lng: 85.3647 }
  ],
  "Chhattisgarh": [
    { name: "Raipur", lat: 21.2514, lng: 81.6296 },
    { name: "Bilaspur", lat: 22.0790, lng: 82.1391 }
  ],
  "Goa": [
    { name: "Panaji", lat: 15.4909, lng: 73.8278 },
    { name: "Margao", lat: 15.2736, lng: 73.9580 }
  ],
  "Gujarat": [
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    { name: "Surat", lat: 21.1702, lng: 72.8311 },
    { name: "Vadodara", lat: 22.3072, lng: 73.1812 },
    { name: "Rajkot", lat: 22.3039, lng: 70.8022 }
  ],
  "Haryana": [
    { name: "Gurugram", lat: 28.4595, lng: 77.0266 },
    { name: "Faridabad", lat: 28.4089, lng: 77.3178 },
    { name: "Ambala", lat: 30.3782, lng: 76.7767 }
  ],
  "Himachal Pradesh": [
    { name: "Shimla", lat: 31.1048, lng: 77.1734 },
    { name: "Dharamshala", lat: 32.2190, lng: 76.3234 }
  ],
  "Jharkhand": [
    { name: "Ranchi", lat: 23.3441, lng: 85.3096 },
    { name: "Jamshedpur", lat: 22.8046, lng: 86.2029 }
  ],
  "Karnataka": [
    { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
    { name: "Mysuru", lat: 12.2958, lng: 76.6394 },
    { name: "Hubballi", lat: 15.3647, lng: 75.1240 },
    { name: "Mangaluru", lat: 12.9141, lng: 74.8560 }
  ],
  "Kerala": [
    { name: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366 },
    { name: "Kochi", lat: 9.9312, lng: 76.2673 },
    { name: "Kozhikode", lat: 11.2588, lng: 75.7804 }
  ],
  "Madhya Pradesh": [
    { name: "Bhopal", lat: 23.2599, lng: 77.4126 },
    { name: "Indore", lat: 22.7196, lng: 75.8577 },
    { name: "Gwalior", lat: 26.2183, lng: 78.1828 }
  ],
  "Maharashtra": [
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 },
    { name: "Nagpur", lat: 21.1458, lng: 79.0882 },
    { name: "Nashik", lat: 19.9975, lng: 73.7898 }
  ],
  "Manipur": [
    { name: "Imphal", lat: 24.8170, lng: 93.9368 }
  ],
  "Meghalaya": [
    { name: "Shillong", lat: 25.5788, lng: 91.8933 },
    { name: "Tura", lat: 25.5141, lng: 90.2201 }
  ],
  "Mizoram": [
    { name: "Aizawl", lat: 23.7307, lng: 92.7173 }
  ],
  "Nagaland": [
    { name: "Kohima", lat: 25.6751, lng: 94.1086 },
    { name: "Dimapur", lat: 25.9080, lng: 93.7259 }
  ],
  "Odisha": [
    { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
    { name: "Cuttack", lat: 20.4625, lng: 85.8830 },
    { name: "Rourkela", lat: 22.2604, lng: 84.8536 }
  ],
  "Punjab": [
    { name: "Ludhiana", lat: 30.9010, lng: 75.8573 },
    { name: "Amritsar", lat: 31.6340, lng: 74.8723 },
    { name: "Jalandhar", lat: 31.3260, lng: 75.5762 }
  ],
  "Rajasthan": [
    { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
    { name: "Jodhpur", lat: 26.2389, lng: 73.0243 },
    { name: "Udaipur", lat: 24.5854, lng: 73.7125 },
    { name: "Kota", lat: 25.2138, lng: 75.8648 }
  ],
  "Sikkim": [
    { name: "Gangtok", lat: 27.3314, lng: 88.6138 }
  ],
  "Tamil Nadu": [
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
    { name: "Madurai", lat: 9.9252, lng: 78.1198 }
  ],
  "Telangana": [
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
    { name: "Warangal", lat: 17.9784, lng: 79.5941 }
  ],
  "Tripura": [
    { name: "Agartala", lat: 23.8315, lng: 91.2868 }
  ],
  "Uttar Pradesh": [
    { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
    { name: "Kanpur", lat: 26.4499, lng: 80.3319 },
    { name: "Varanasi", lat: 25.3176, lng: 82.9739 },
    { name: "Agra", lat: 27.1767, lng: 78.0081 },
    { name: "Noida", lat: 28.5355, lng: 77.3910 }
  ],
  "Uttarakhand": [
    { name: "Dehradun", lat: 30.3165, lng: 78.0322 },
    { name: "Haridwar", lat: 29.9457, lng: 78.1642 }
  ],
  "West Bengal": [
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { name: "Darjeeling", lat: 27.0410, lng: 88.2627 },
    { name: "Siliguri", lat: 26.7271, lng: 88.3953 }
  ],
  "Delhi (UT)": [
    { name: "New Delhi", lat: 28.6139, lng: 77.2090 },
    { name: "Dwarka", lat: 28.5823, lng: 77.0500 }
  ],
  "Jammu & Kashmir": [
    { name: "Srinagar", lat: 34.0837, lng: 74.7973 },
    { name: "Jammu", lat: 32.7266, lng: 74.8570 }
  ],
  "Ladakh": [
    { name: "Leh", lat: 34.1526, lng: 77.5771 }
  ],
  "Puducherry": [
    { name: "Puducherry", lat: 11.9416, lng: 79.8083 }
  ]
};

export function lookupCoordsFromLocation(state?: string, district?: string): { lat: number; lng: number } | null {
  if (!state) return null;
  const districts = STATE_DISTRICTS[state];
  if (!districts) return null;
  if (district) {
    const match = districts.find(d => d.name.toLowerCase() === district.toLowerCase());
    if (match) return { lat: match.lat, lng: match.lng };
  }
  // Return the first (capital/main) district as fallback
  return { lat: districts[0].lat, lng: districts[0].lng };
}
