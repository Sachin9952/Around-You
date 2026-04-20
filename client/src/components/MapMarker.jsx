import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Import local assets to bypass CDN tracking prevention
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { HiStar } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

// Fix for default Leaflet icon not showing in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Create a custom highlighted icon
const highlightIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapMarker = ({ service, isHighlighted }) => {
  const navigate = useNavigate();

  if (!service.location || typeof service.location !== 'object' || !service.location.lat || !service.location.lng) {
    return null;
  }

  return (
    <Marker 
      position={[service.location.lat, service.location.lng]}
      icon={isHighlighted ? highlightIcon : defaultIcon}
      zIndexOffset={isHighlighted ? 1000 : 0}
    >
      <Popup className="nearby-popup">
        <div className="font-sans">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#E0F5F3] text-[#45B1A8] text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-full">
              {service.category}
            </span>
            <div className="flex items-center gap-0.5 ml-auto">
              <HiStar className="w-3 h-3 text-[#45B1A8]" />
              <span className="text-[10px] font-bold text-[#1A2B2A]">
                {service.averageRating ? service.averageRating.toFixed(1) : 'New'}
              </span>
            </div>
          </div>
          
          <h4 className="text-sm font-black text-[#1A2B2A] leading-tight mb-1">{service.title}</h4>
          <p className="text-[11px] text-[#4A5568] mb-2">{service.provider?.name || 'Provider'}</p>
          
          <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2">
            <span className="text-sm font-bold text-[#1A2B2A]">₹{service.price}</span>
            <button
               onClick={(e) => {
                 e.stopPropagation();
                 navigate(`/services/${service._id}`);
               }}
               className="bg-[#45B1A8] text-white text-[10px] px-2 py-1 rounded-md font-bold hover:bg-[#3a9990]"
            >
              View
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default MapMarker;
