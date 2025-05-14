import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiRefreshCw, FiLayers } from 'react-icons/fi';

// Fix Leaflet's icon loading issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom drone icon
const createDroneIcon = (status = 'active', heading = 0) => {
  const iconColor = 
    status === 'active' ? '#3B82F6' : // blue
    status === 'warning' ? '#F59E0B' : // yellow
    status === 'error' ? '#EF4444' : // red
    status === 'offline' ? '#6B7280' : // gray
    '#3B82F6'; // default blue
    
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path transform="rotate(${heading}, 16, 16)" d="M16,4 L20,16 L16,28 L12,16 Z" fill="${iconColor}" stroke="white" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="4" fill="white" stroke="${iconColor}" stroke-width="1.5" />
    </svg>
  `;
  
  return L.divIcon({
    className: 'custom-drone-icon',
    html: svg,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Component to handle map view updates
const MapControls = ({ onRecenter, onChangeLayer }) => {
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState('streets');
  
  const handleLayerChange = (layer) => {
    setSelectedLayer(layer);
    onChangeLayer(layer);
    setLayerMenuOpen(false);
  };
  
  return (
    <div className="absolute top-2 right-2 z-[1000] flex flex-col items-end">
      <div className="bg-white rounded-md shadow-md mb-2">
        <button
          onClick={onRecenter}
          className="p-2 hover:bg-gray-100 rounded-md"
          title="Center map on drone"
        >
          <FiRefreshCw className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      <div className="relative">
        <button
          onClick={() => setLayerMenuOpen(!layerMenuOpen)}
          className="p-2 bg-white hover:bg-gray-100 rounded-md shadow-md"
          title="Change map layer"
        >
          <FiLayers className="h-5 w-5 text-gray-600" />
        </button>
        
        {layerMenuOpen && (
          <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg overflow-hidden z-50 w-32">
            <button
              className={`block w-full text-left px-4 py-2 text-sm ${selectedLayer === 'streets' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => handleLayerChange('streets')}
            >
              Streets
            </button>
            <button
              className={`block w-full text-left px-4 py-2 text-sm ${selectedLayer === 'satellite' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => handleLayerChange('satellite')}
            >
              Satellite
            </button>
            <button
              className={`block w-full text-left px-4 py-2 text-sm ${selectedLayer === 'hybrid' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => handleLayerChange('hybrid')}
            >
              Hybrid
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Component to update view when center changes
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom]);
  return null;
};

/**
 * MapView component for displaying drone location and path
 * 
 * @param {Object} props
 * @param {Object} props.dronePosition - Current drone position {lat, lng, alt, heading}
 * @param {Array} props.missionPath - Array of waypoints for the mission
 * @param {Array} props.flightPath - Array of points showing the actual flight path
 * @param {boolean} props.showControls - Whether to show map controls
 * @param {Object} props.center - Center coordinates for the map
 * @param {number} props.zoom - Zoom level for the map
 * @param {string} props.droneStatus - Status of the drone (active, warning, error, offline)
 * @param {Object} props.mapStyle - Style object for the map container
 */
const MapView = ({
  dronePosition,
  missionPath = [],
  flightPath = [],
  showControls = true,
  center = null,
  zoom = 15,
  droneStatus = 'active',
  mapStyle = { height: '100%', width: '100%' }
}) => {
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapLayer, setMapLayer] = useState('streets');
  
  // Update center if drone position changes
  useEffect(() => {
    if (dronePosition && !center) {
      setMapCenter([dronePosition.lat, dronePosition.lng]);
    }
  }, [dronePosition, center]);
  
  // Default center if none provided
  const defaultCenter = () => {
    if (mapCenter) return mapCenter;
    if (dronePosition) return [dronePosition.lat, dronePosition.lng];
    if (missionPath.length > 0) {
      return [missionPath[0].lat, missionPath[0].lng];
    }
    return [21.7679, 78.8718]; // Default center (India)
  };
  
  // Recenter map on drone
  const handleRecenter = () => {
    if (dronePosition) {
      setMapCenter([dronePosition.lat, dronePosition.lng]);
    }
  };

  return (
    <div className="relative" style={{ height: '100%', width: '100%' }}>
      <MapContainer 
        center={defaultCenter()} 
        zoom={zoom} 
        style={mapStyle}
        ref={mapRef}
      >
        <ChangeView center={mapCenter} zoom={zoom} />
        
        {/* Map layer */}
        {mapLayer === 'satellite' ? (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          />
        ) : mapLayer === 'hybrid' ? (
          <>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            />
            <TileLayer
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.png"
              attribution="Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap"
            />
          </>
        ) : (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
        )}
        
        {/* Mission path (waypoints) */}
        {missionPath.length > 1 && (
          <Polyline
            positions={missionPath.map(wp => [wp.lat, wp.lng])}
            pathOptions={{ color: '#6366F1', dashArray: '5, 5', weight: 3 }}
          />
        )}
        
        {/* Actual flight path */}
        {flightPath.length > 1 && (
          <Polyline
            positions={flightPath}
            pathOptions={{ color: '#3B82F6', weight: 3 }}
          />
        )}
        
        {/* Waypoint markers */}
        {missionPath.map((waypoint, index) => (
          <Marker
            key={`waypoint-${index}`}
            position={[waypoint.lat, waypoint.lng]}
            icon={L.divIcon({
              className: 'custom-waypoint-icon',
              html: `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs border-2 border-white">${index + 1}</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium">Waypoint {index + 1}</div>
                <div>Altitude: {waypoint.alt || 0}m</div>
                <div>Lat: {waypoint.lat.toFixed(6)}</div>
                <div>Lng: {waypoint.lng.toFixed(6)}</div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Drone marker */}
        {dronePosition && (
          <Marker
            position={[dronePosition.lat, dronePosition.lng]}
            icon={createDroneIcon(droneStatus, dronePosition.heading || 0)}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium">Current Position</div>
                <div>Altitude: {dronePosition.alt || 0}m</div>
                <div>Heading: {dronePosition.heading || 0}°</div>
                <div>Lat: {dronePosition.lat.toFixed(6)}</div>
                <div>Lng: {dronePosition.lng.toFixed(6)}</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Map controls */}
      {showControls && (
        <MapControls 
          onRecenter={handleRecenter}
          onChangeLayer={setMapLayer}
        />
      )}
    </div>
  );
};

export default MapView;