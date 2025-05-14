import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiLayers, FiTrash2, FiCrosshair, FiPlus } from 'react-icons/fi';

// Fix Leaflet's icon loading issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Helper component to handle map events and polygon drawing
const DrawingLayer = ({ onChange, readOnly, initialPositions = [] }) => {
  const [positions, setPositions] = useState(initialPositions);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Handle map clicks for drawing
  const map = useMapEvents({
    click: (e) => {
      if (readOnly) return;
      
      if (isDrawing) {
        const newPosition = [e.latlng.lat, e.latlng.lng];
        const newPositions = [...positions, newPosition];
        setPositions(newPositions);
        
        if (onChange) {
          onChange({
            type: 'polygon',
            coordinates: newPositions,
            // Simple area calculation (very rough approximation)
            area: calculateSimpleArea(newPositions)
          });
        }
      }
    }
  });
  
  // Rough estimate of polygon area (not geodesic, simplified for this component)
  const calculateSimpleArea = (coords) => {
    if (coords.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i][0] * coords[j][1];
      area -= coords[j][0] * coords[i][1];
    }
    
    // Convert to square meters (very approximate)
    const areaInSquareMeters = Math.abs(area) * 111319.9 * 111319.9 / 2;
    return areaInSquareMeters;
  };
  
  // Start drawing mode
  const startDrawing = () => {
    setIsDrawing(true);
    setPositions([]);
    if (onChange) {
      onChange(null);
    }
  };
  
  // Complete the polygon
  const completePolygon = () => {
    if (positions.length >= 3) {
      setIsDrawing(false);
    }
  };
  
  // Reset the polygon
  const resetPolygon = () => {
    setPositions([]);
    setIsDrawing(false);
    if (onChange) {
      onChange(null);
    }
  };
  
  // Initialize with provided boundary
  useEffect(() => {
    if (initialPositions && initialPositions.length > 0) {
      setPositions(initialPositions);
      setIsDrawing(false);
    }
  }, []);

  return (
    <>
      {/* Show the polygon if we have enough points */}
      {positions.length >= 3 && (
        <Polygon
          positions={positions}
          pathOptions={{
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.2,
            weight: 2
          }}
        />
      )}
      
      {/* Drawing controls */}
      {!readOnly && (
        <div className="absolute bottom-20 right-4 z-[1000] bg-white rounded-md shadow-md p-2 flex flex-col space-y-2">
          {!isDrawing ? (
            <button
              onClick={startDrawing}
              className="flex items-center justify-center bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              title="Start drawing"
            >
              <FiPlus className="mr-1" /> Draw Area
            </button>
          ) : (
            <>
              <div className="text-xs text-gray-500 mb-1">
                Click on map to add points
              </div>
              <button
                onClick={completePolygon}
                disabled={positions.length < 3}
                className={`flex items-center justify-center p-2 rounded ${
                  positions.length < 3 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                Complete
              </button>
              <button
                onClick={resetPolygon}
                className="flex items-center justify-center bg-red-500 text-white p-2 rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </>
          )}
          
          {!isDrawing && positions.length > 0 && (
            <button
              onClick={resetPolygon}
              className="flex items-center justify-center bg-gray-200 p-2 rounded hover:bg-gray-300"
            >
              <FiTrash2 className="mr-1" /> Clear
            </button>
          )}
        </div>
      )}
    </>
  );
};

/**
 * MapDrawingTool component for drawing and editing polygons on a map
 * Compatible with React 19+
 * 
 * @param {Object} props
 * @param {Array} props.initialBoundary - Initial polygon boundary points [[lat, lng], ...]
 * @param {Function} props.onChange - Callback when boundary is changed
 * @param {Object} props.center - Center position {lat, lng}
 * @param {number} props.zoom - Initial zoom level
 * @param {boolean} props.readOnly - Whether map is in read-only mode
 * @param {boolean} props.showControls - Whether to show map controls
 * @param {Object} props.mapStyle - Style object for the map container
 */
const MapDrawingTool = ({
  initialBoundary = null,
  onChange,
  center = { lat: 21.7679, lng: 78.8718 }, // Default to center of India
  zoom = 5,
  readOnly = false,
  showControls = true,
  mapStyle = { height: '500px' }
}) => {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapLayers, setMapLayers] = useState('streets'); // streets, satellite, hybrid, terrain
  
  // Get user's current location
  const handleGetLocation = () => {
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15);
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLoadingLocation(false);
        alert("Could not get your location. Please check your location permissions.");
      },
      { enableHighAccuracy: true }
    );
  };
  
  // Change map layer type
  const handleChangeMapLayer = (type) => {
    setMapLayers(type);
  };

  return (
    <div className="relative">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={mapStyle}
        ref={mapRef}
      >
        {/* Base map layer */}
        {mapLayers === 'satellite' ? (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          />
        ) : mapLayers === 'hybrid' ? (
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
        ) : mapLayers === 'terrain' ? (
          <TileLayer
            url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png"
            attribution="Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap"
          />
        ) : (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
        )}
        
        {/* Drawing layer */}
        <DrawingLayer 
          onChange={onChange} 
          readOnly={readOnly}
          initialPositions={initialBoundary || []}
        />
      </MapContainer>
      
      {/* Controls overlay */}
      {showControls && (
        <div className="absolute top-4 left-4 z-[1000] flex flex-col space-y-2">
          <div className="bg-white rounded-md shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => handleChangeMapLayer('streets')}
              className={`p-2 text-sm font-medium ${
                mapLayers === 'streets' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Streets
            </button>
            <button
              type="button"
              onClick={() => handleChangeMapLayer('satellite')}
              className={`p-2 text-sm font-medium ${
                mapLayers === 'satellite' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => handleChangeMapLayer('hybrid')}
              className={`p-2 text-sm font-medium ${
                mapLayers === 'hybrid' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Hybrid
            </button>
            <button
              type="button"
              onClick={() => handleChangeMapLayer('terrain')}
              className={`p-2 text-sm font-medium ${
                mapLayers === 'terrain' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Terrain
            </button>
          </div>
          
          {!readOnly && (
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLoadingLocation}
                className="flex items-center justify-center bg-white p-3 rounded-md shadow-md text-gray-700 hover:bg-gray-50"
                title="Use my location"
              >
                <FiCrosshair className={`${isLoadingLocation ? 'animate-pulse' : ''}`} />
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Instructions */}
      {!readOnly && (
        <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-80 text-sm p-2 rounded shadow z-[1000]">
          <p>Draw a polygon to define your survey area. Click on the map to add points and complete the shape.</p>
        </div>
      )}
    </div>
  );
};

export default MapDrawingTool;