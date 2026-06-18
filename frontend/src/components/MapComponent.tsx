import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Tour } from '../types';
import 'leaflet/dist/leaflet.css';

// @ts-ignore
const L = window.L || require('leaflet');

// Use inline SVG for marker icon to avoid external dependencies
const svgMarker = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
  <path fill="#3b82f6" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 29 12 29s12-20 12-29c0-6.6-5.4-12-12-12z"/>
  <circle fill="white" cx="12" cy="12" r="5"/>
</svg>
`)}`;

const defaultIcon = L.icon({
  iconUrl: svgMarker,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -35],
});

function MapUpdater({ tours }: { tours: Tour[] }) {
  const map = useMap();
  useEffect(() => {
    if (tours.length > 0) {
      const group = L.featureGroup(tours.map((t: Tour) => L.marker([t.lat, t.lng])));
      map.fitBounds(group.getBounds().pad(0.2));
    }
  }, [tours, map]);
  return null;
}

export default function MapComponent({ tours, height = '400px' }: { tours: Tour[]; height?: string }) {
  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden shadow-lg">
      <MapContainer center={[30, 10]} zoom={2} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution=''
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater tours={tours} />
        {tours.map((tour) => (
          <Marker key={tour.id} position={[tour.lat, tour.lng]} icon={defaultIcon}>
            <Popup>
              <div className="min-w-[200px]">
                <img src={tour.main_image} alt={tour.title} className="w-full h-24 object-cover rounded mb-2" />
                <h3 className="font-bold text-sm">{tour.title}</h3>
                <p className="text-xs text-gray-600">{tour.country.name}</p>
                <p className="text-sm font-semibold text-blue-600 mt-1">
                  {Math.round(tour.price * (1 - tour.discount / 100)).toLocaleString()} ₽
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}