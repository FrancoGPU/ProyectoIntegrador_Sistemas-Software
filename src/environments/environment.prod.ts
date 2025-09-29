export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080', // Backend Java para producción
  googleMapsApiKey: 'TU_GOOGLE_MAPS_API_KEY_PRODUCTION',
  features: {
    useGoogleMaps: true, // En producción podrías usar Google Maps
    enableAnalytics: true,
    debugMode: false
  }
};