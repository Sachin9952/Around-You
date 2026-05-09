
const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

/**
 * Fetch suggestions from Geoapify Autocomplete API
 * @param {string} text - The search query
 * @param {object} location - { lat, lng } for bias
 */
export async function getGeoapifySuggestions(text, location = null) {
  if (!text || text.length < 2) return [];

  let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&apiKey=${GEOAPIFY_API_KEY}&limit=10&format=json`;

  if (location && location.lat && location.lng) {
    url += `&bias=proximity:${location.lng},${location.lat}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results) {
      return data.results.map(item => ({
        id: item.place_id,
        mainText: item.name || item.address_line1,
        secondaryText: item.address_line2 || item.formatted,
        fullAddress: item.formatted,
        lat: item.lat,
        lng: item.lon,
        distance: item.distance, // distance in meters if proximity bias is used
        type: item.category || item.type,
        raw: item
      }));
    }
    return [];
  } catch (error) {
    console.error('Geoapify Autocomplete error:', error);
    return [];
  }
}

/**
 * Reverse geocode coordinates using Geoapify
 * @param {number} lat 
 * @param {number} lng 
 */
export async function reverseGeocodeGeoapify(lat, lng) {
  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}&format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const item = data.results[0];
      return {
        address: item.formatted,
        placeName: item.name || '',
        placeId: item.place_id,
        lat: item.lat,
        lng: item.lon,
        raw: item
      };
    }
    return null;
  } catch (error) {
    console.error('Geoapify Reverse Geocode error:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates in km
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
