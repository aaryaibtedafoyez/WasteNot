/**
 * MOCK ROUTE OPTIMIZATION
 * ------------------------
 * The pitch calls for Google Maps/OSRM-based route optimization between
 * a restaurant's pickup location and an NGO. A real OSRM/Maps Directions
 * call needs an API key and a routing server; this computes straight-line
 * (haversine) distance and derives a plausible driving ETA from it, which
 * is the same shape `{ distanceKm, etaMinutes }` a real routing call
 * returns.
 *
 * Swap point: replace `estimateRoute` with a fetch to OSRM's
 * `/route/v1/driving/{lng1},{lat1};{lng2},{lat2}` endpoint or the Google
 * Maps Directions API, then map its response onto the same return shape.
 */

const EARTH_RADIUS_KM = 6371;
const AVG_CITY_SPEED_KMH = 22; // Dhaka traffic-adjusted average

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm([lng1, lat1], [lng2, lat2]) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function estimateRoute(pickupCoords, dropoffCoords) {
  const straightLineKm = haversineKm(pickupCoords, dropoffCoords);
  // Real roads are never straight lines - apply a routing-factor fudge,
  // consistent with what's typically seen comparing haversine to OSRM output.
  const distanceKm = Math.round(straightLineKm * 1.35 * 10) / 10;
  const etaMinutes = Math.max(5, Math.round((distanceKm / AVG_CITY_SPEED_KMH) * 60));

  return {
    distanceKm,
    etaMinutes,
    provider: "mock_osrm",
    computedAt: new Date(),
  };
}

// Given one donation's pickup point and a list of candidate NGOs (each with
// a .location.coordinates), returns NGOs sorted nearest-first with route info.
export function rankNgosByProximity(pickupCoords, ngos) {
  return ngos
    .map((ngo) => ({
      ngo,
      route: estimateRoute(pickupCoords, ngo.location.coordinates),
    }))
    .sort((a, b) => a.route.distanceKm - b.route.distanceKm);
}
