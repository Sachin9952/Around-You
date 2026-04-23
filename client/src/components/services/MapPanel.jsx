import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapMarker from '../MapMarker';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      // Use requestAnimationFrame to ensure the map is in a stable state
      requestAnimationFrame(() => {
        try {
          map.invalidateSize();
          map.setView(center, zoom || 13, {
            animate: true,
            duration: 1
          });
        } catch (err) {
          console.warn('Leaflet setView failed, falling back to panTo', err);
          map.panTo(center);
        }
      });
    }
  }, [center, zoom, map]);
  return null;
};

const MapPanel = ({ 
  services, 
  userLocation, 
  hoveredServiceId, 
  selectedServiceId,
  onMarkerClick 
}) => {
  // Default map center (India coords)
  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629];
  const mapZoom = userLocation ? 13 : 5;

  return (
    <div className="w-full h-full relative overflow-hidden rounded-[2rem] border border-slate-200 shadow-xl bg-slate-100">
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        whenReady={(mapInstance) => {
          // Force invalidate size after mount animation completes
          setTimeout(() => {
            mapInstance.target.invalidateSize();
          }, 500);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        
        <RecenterMap center={mapCenter} zoom={mapZoom} />
        
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} zIndexOffset={500}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {services.map((service) => (
          <MapMarker 
            key={service._id} 
            service={service} 
            isHighlighted={hoveredServiceId === service._id || selectedServiceId === service._id}
          />
        ))}
      </MapContainer>

      {/* Floating Info (Optional) */}
      <div className="absolute bottom-4 left-4 z-10 hidden md:block">
        <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 shadow-lg">
          Click markers to view details
        </div>
      </div>
    </div>
  );
};

export default MapPanel;
