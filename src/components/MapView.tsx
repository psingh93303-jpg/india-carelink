import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix default icon paths (Leaflet expects assets at known URLs)
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const emergencyIcon = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;border-radius:9999px;background:oklch(0.6 0.24 25);border:3px solid white;box-shadow:0 0 0 3px oklch(0.6 0.24 25 / 0.35);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

type MapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  emergency?: boolean;
};

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);
  return null;
}

export function MapView({
  points,
  height = 360,
  userLocation,
}: {
  points: MapPoint[];
  height?: number;
  userLocation?: { lat: number; lng: number } | null;
}) {
  const center: [number, number] = points[0]
    ? [points[0].lat, points[0].lng]
    : [26.85, 80.95];

  return (
    <div style={{ height }} className="w-full overflow-hidden rounded-xl border border-border shadow-soft">
      <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={p.emergency ? emergencyIcon : DefaultIcon}>
            <Popup>
              <strong>{p.name}</strong>
            </Popup>
          </Marker>
        ))}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: "",
              html: `<div style="width:18px;height:18px;border-radius:9999px;background:oklch(0.55 0.18 165);border:3px solid white;box-shadow:0 0 0 4px oklch(0.55 0.18 165 / 0.3);"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            })}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}
        <FitBounds points={userLocation ? [...points, { id: "me", name: "You", lat: userLocation.lat, lng: userLocation.lng }] : points} />
      </MapContainer>
    </div>
  );
}
