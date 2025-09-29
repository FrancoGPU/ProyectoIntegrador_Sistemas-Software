export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api', // Cambiado para apuntar al backend Java con contexto /api
  googleMapsApiKey: 'TU_GOOGLE_MAPS_API_KEY_AQUI',
  features: {
    useGoogleMaps: false, // Por defecto usamos OpenStreetMap
    enableAnalytics: false,
    debugMode: true
  }
};