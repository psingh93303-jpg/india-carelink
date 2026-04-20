import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

const pickerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  const lastRef = useRef<string>("");
  useEffect(() => {
    if (lat == null || lng == null) return;
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (lastRef.current === key) return;
    lastRef.current = key;
    map.setView([lat, lng], Math.max(map.getZoom(), 13));
  }, [lat, lng, map]);
  return null;
}

export function LocationPicker({
  lat,
  lng,
  onChange,
  height = 280,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  height?: number;
}) {
  const center = useMemo<[number, number]>(
    () => (lat != null && lng != null ? [lat, lng] : [26.85, 80.95]),
    [lat, lng]
  );

  return (
    <div
      style={{ height }}
      className="w-full overflow-hidden rounded-xl border border-border"
    >
      <MapContainer
        center={center}
        zoom={lat != null && lng != null ? 13 : 5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        <Recenter lat={lat} lng={lng} />
        {lat != null && lng != null && (
          <Marker
            position={[lat, lng]}
            icon={pickerIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target as L.Marker;
                const p = m.getLatLng();
                onChange(p.lat, p.lng);
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
