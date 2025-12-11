/**
 * Mesafe Hesaplama Utility'si
 * Haversine formülü kullanarak iki nokta arasındaki mesafeyi hesaplar
 * (Havadan düz mesafe - karayolu uzunluğu değildir)
 */

/**
 * Haversine formülü ile iki koordinat arasındaki mesafeyi km cinsinden hesapla
 * @param {number} lat1 - Başlangıç noktası enlem
 * @param {number} lon1 - Başlangıç noktası boylam
 * @param {number} lat2 - Bitiş noktası enlem
 * @param {number} lon2 - Bitiş noktası boylam
 * @returns {number} Mesafe kilometre cinsinden
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Dünya yarıçapı (km)
  
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(2));
};

/**
 * GeoJSON coordinates'ten mesafe hesapla
 * @param {array} coordinates1 - [longitude, latitude]
 * @param {array} coordinates2 - [longitude, latitude]
 * @returns {number} Mesafe kilometre cinsinden
 */
const calculateDistanceFromCoordinates = (coordinates1, coordinates2) => {
  if (!coordinates1 || !coordinates2) {
    throw new Error('Koordinatlar gereklidir');
  }

  const [lon1, lat1] = coordinates1;
  const [lon2, lat2] = coordinates2;
  
  return calculateHaversineDistance(lat1, lon1, lat2, lon2);
};

/**
 * Tahmini karayolu mesafesi hesapla (Haversine × 1.3 faktörü)
 * Havadan mesafe ile karayolu mesafesi arasında yaklaşık 1.3x fark vardır
 * @param {array} coordinates1 - [longitude, latitude]
 * @param {array} coordinates2 - [longitude, latitude]
 * @returns {number} Tahmini karayolu mesafesi kilometre cinsinden
 */
const calculateEstimatedRoadDistance = (coordinates1, coordinates2) => {
  const straightDistance = calculateDistanceFromCoordinates(coordinates1, coordinates2);
  const roadDistanceFactor = 1.3; // Ortalama yol sapması
  
  return parseFloat((straightDistance * roadDistanceFactor).toFixed(2));
};

/**
 * Tahmini sürü hesapla (km başına ortalama 20 dakika)
 * @param {number} distanceKm - Mesafe kilometre cinsinden
 * @returns {number} Tahmini süre dakika cinsinden
 */
const calculateEstimatedTime = (distanceKm) => {
  const timePerKm = 3; // Ortalama 3 dakika/km (şehir içi)
  return Math.ceil(distanceKm * timePerKm);
};

/**
 * Kurye ile tüketici arasında mesafe ve tahmini sürü hesapla
 * @param {object} courierLocation - { type: 'Point', coordinates: [lon, lat] }
 * @param {object} consumerLocation - { type: 'Point', coordinates: [lon, lat] }
 * @returns {object} { distance, estimatedTime, distanceCategory }
 */
const getDeliveryDistance = (courierLocation, consumerLocation) => {
  try {
    if (!courierLocation?.coordinates || !consumerLocation?.coordinates) {
      throw new Error('Konum bilgisi eksik');
    }

    const straightDistance = calculateDistanceFromCoordinates(
      courierLocation.coordinates,
      consumerLocation.coordinates
    );
    
    const roadDistance = calculateEstimatedRoadDistance(
      courierLocation.coordinates,
      consumerLocation.coordinates
    );
    
    const estimatedTime = calculateEstimatedTime(roadDistance);
    
    // Mesafeyi kategorize et
    let distanceCategory = 'close'; // 0-2 km
    if (roadDistance > 2 && roadDistance <= 5) distanceCategory = 'medium';
    if (roadDistance > 5 && roadDistance <= 10) distanceCategory = 'far';
    if (roadDistance > 10) distanceCategory = 'very_far';
    
    return {
      straightDistanceKm: straightDistance,
      estimatedRoadDistanceKm: roadDistance,
      estimatedTimeMinutes: estimatedTime,
      distanceCategory,
      timestamp: new Date()
    };
  } catch (error) {
    throw new Error(`Mesafe hesaplama hatası: ${error.message}`);
  }
};

/**
 * Restorant ile tüketici arasında mesafe hesapla
 * @param {object} restaurantLocation - { type: 'Point', coordinates: [lon, lat] }
 * @param {object} consumerLocation - { type: 'Point', coordinates: [lon, lat] }
 * @returns {object} { distance, estimatedDeliveryTime }
 */
const getRestaurantToConsumerDistance = (restaurantLocation, consumerLocation) => {
  try {
    if (!restaurantLocation?.coordinates || !consumerLocation?.coordinates) {
      throw new Error('Konum bilgisi eksik');
    }

    const roadDistance = calculateEstimatedRoadDistance(
      restaurantLocation.coordinates,
      consumerLocation.coordinates
    );
    
    const estimatedTime = calculateEstimatedTime(roadDistance);
    
    return {
      distanceKm: roadDistance,
      estimatedDeliveryTimeMinutes: estimatedTime
    };
  } catch (error) {
    throw new Error(`Mesafe hesaplama hatası: ${error.message}`);
  }
};

module.exports = {
  calculateHaversineDistance,
  calculateDistanceFromCoordinates,
  calculateEstimatedRoadDistance,
  calculateEstimatedTime,
  getDeliveryDistance,
  getRestaurantToConsumerDistance
};
