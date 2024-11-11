/**
 * Transforme les coordonnées de EPSG:4326 (WGS84) vers EPSG:3857 (Web Mercator)
 * @param lon Longitude en WGS84
 * @param lat Latitude en WGS84
 * @returns [x, y] Coordonnées en Web Mercator (EPSG:3857)
 */
export function transformTo3857(lon: number, lat: number): [number, number] {
    // Conversion des degrés en radians
    const lonRad = (lon * Math.PI) / 180;
    const latRad = (lat * Math.PI) / 180;
  
    // Constante pour la projection Web Mercator
    const earthRadius = 6378137.0; // Rayon de la Terre en mètres
  
    // Calcul des coordonnées en Web Mercator
    const x = earthRadius * lonRad;
    const y = earthRadius * Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  
    return [x, y];
  }
  
  /**
   * Transforme les coordonnées de EPSG:3857 (Web Mercator) vers EPSG:4326 (WGS84)
   * @param x Coordonnée X en Web Mercator
   * @param y Coordonnée Y en Web Mercator
   * @returns [lon, lat] Coordonnées en WGS84
   */
  export function transformTo4326(x: number, y: number): [number, number] {
    // Constante pour la projection Web Mercator
    const earthRadius = 6378137.0; // Rayon de la Terre en mètres
  
    // Conversion de Web Mercator vers WGS84
    const lon = (x / earthRadius) * (180 / Math.PI);
    const lat = (Math.atan(Math.exp(y / earthRadius)) * 2 - Math.PI / 2) * (180 / Math.PI);
  
    return [lon, lat];
  }