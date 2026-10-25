/**
 * Tạo link tìm kiếm vị trí quán trên Google Maps
 */
export const getGoogleMapsSearchUrl = (location) => {
  if (!location) return 'https://www.google.com/maps';
  if (location.googleMapsUrl && location.googleMapsUrl.trim() !== '') {
    return location.googleMapsUrl.trim();
  }
  const query = encodeURIComponent(`${location.name || ''} ${location.address || ''}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

/**
 * Tạo link chỉ đường trực tiếp (Directions) từ vị trí hiện tại tới địa chỉ quán trên Google Maps
 */
export const getGoogleMapsDirectionsUrl = (location) => {
  if (!location) return 'https://www.google.com/maps';
  const destination = encodeURIComponent(`${location.name || ''}, ${location.address || ''}`.trim());
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
};

/**
 * Mở thẳng Google Maps ở tab mới khi người dùng chọn đi đến địa điểm
 */
export const openLocationInGoogleMaps = (location, mode = 'directions') => {
  const url =
    mode === 'directions'
      ? getGoogleMapsDirectionsUrl(location)
      : getGoogleMapsSearchUrl(location);
  window.open(url, '_blank', 'noopener,noreferrer');
};

