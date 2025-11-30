export const environment = {
  production: false,
  apiUrl: '/api', // Usar path relativo para que funcione el proxy de Angular
  googleMapsApiKey: 'TU_GOOGLE_MAPS_API_KEY_AQUI',
  features: {
    useGoogleMaps: false, // Por defecto usamos OpenStreetMap
    enableAnalytics: false,
    debugMode: true
  }
};