import axios from 'axios';

/**
 * Service de géocodage pour l'Algérie côté backend
 * Utilise OpenStreetMap Nominatim (gratuit)
 */

interface GeocodingResult {
  city: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

/**
 * Obtenir les coordonnées d'une ville algérienne
 */
export const geocodeAlgerianCity = async (city: string): Promise<GeocodingResult | null> => {
  try {
    const response = await axios.get(`${NOMINATIM_API}/search`, {
      params: {
        q: `${city}, Algeria`,
        format: 'json',
        addressdetails: 1,
        limit: 1,
        countrycodes: 'dz', // Code ISO pour l'Algérie
      },
      headers: {
        'User-Agent': 'CovoiturageApp/1.0',
      },
      timeout: 5000, // Timeout de 5 secondes
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        city: result.address.city || result.address.town || result.address.village || result.name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
      };
    }

    return null;
  } catch (error) {
    console.error('Erreur lors du géocodage:', error);
    return null;
  }
};

/**
 * Géocodage inversé : obtenir la ville à partir de coordonnées
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    const response = await axios.get(`${NOMINATIM_API}/reverse`, {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'CovoiturageApp/1.0',
      },
      timeout: 5000,
    });

    if (response.data && response.data.address) {
      const address = response.data.address;
      return address.city || address.town || address.village || address.state || null;
    }

    return null;
  } catch (error) {
    console.error('Erreur lors du géocodage inversé:', error);
    return null;
  }
};

/**
 * Calculer la distance entre deux points (formule de Haversine)
 * Retourne la distance en kilomètres
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convertir des degrés en radians
 */
const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Estimer la durée du trajet en minutes
 * Basé sur une vitesse moyenne de 80 km/h
 */
export const estimateDuration = (distanceKm: number): number => {
  const averageSpeedKmh = 80;
  return Math.round((distanceKm / averageSpeedKmh) * 60);
};

