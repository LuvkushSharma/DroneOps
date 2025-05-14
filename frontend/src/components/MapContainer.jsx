import React, { useEffect, useRef, useState } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { FiZoomIn, FiZoomOut, FiCrosshair, FiLayers, FiTrash2 } from 'react-icons/fi';

// Fix for Leaflet marker icons on webpack build
// This is necessary to correctly display map markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom drone icon
const droneIcon = new L.Icon({
  iconUrl: '/drone-icon.png', // Replace with your drone icon path
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Map Control Components
const MapControls = ({ onZoomIn, onZoomOut, onLocate, onClearDrawing }) => (
  <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md overflow-hidden z-50">
    <button
      onClick={onZoomIn}
      className="p-2 hover:bg-gray-100 border-b border-gray-200 w-10 h-10 flex items-center justify-center"
      title="Zoom In"
    >
      <FiZoomIn className="text-gray-600" />
    </button>
    <button
      onClick={onZoomOut}
      className="p-2 hover:bg-gray-100 border-b border-gray-200 w-10 h-10 flex items-center justify-center"
      title="Zoom Out"
    >
      <FiZoomOut className="text-gray-600" />
    </button>
    <button
      onClick={onLocate}
      className="p-2 hover:bg-gray-100 border-b border-gray-200 w-10 h-10 flex items-center justify-center"
      title="Center Map"
    >
      <FiCrosshair className="text-gray-600" />
    </button>
    <button
      onClick={onClearDrawing}
      className="p-2 hover:bg-gray-100 w-10 h-10 flex items-center justify-center"
      title="Clear Drawing"
    >
      <FiTrash2 className="text-gray-600" />
    </button>
  </div>
);

// Layer Selector Component
const LayerSelector = ({ activeLayer, onLayerChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const layers = [
    { id: 'osm', name: 'OpenStreetMap' },
    { id: 'satellite', name: 'Satellite' },
    { id: 'terrain', name: 'Terrain' },
  ];
  
  return (
    <div className="absolute bottom-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center bg-white px-3 py-2 rounded-lg shadow-md text-sm"
        >
          <FiLayers className="mr-2" />
          {layers.find(l => l.id === activeLayer)?.name || 'Base Map'}
        </button>
        
        {isOpen && (
          <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg py-1 min-w-[150px]">
            {layers.map(layer => (
              <button
                key={layer.id}
                className={`w-full text-left px-4 py-2 text-sm ${
                  activeLayer === layer.id 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
                onClick={() => {
                  onLayerChange(layer.id);
                  setIsOpen(false);
                }}
              >
                {layer.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Map recenter component
const RecenterMap = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  
  return null;
};

/**
 * MapContainer component for displaying drone missions, survey areas, and real-time drone positions
 * 
 * @param {Object} props
 * @param {Array} props.markers - Array of marker objects with lat, lng, and popup content
 * @param {Array} props.polygons - Array of polygon objects with array of coordinates and options
 * @param {Array} props.paths - Array of path objects (polylines) with array of coordinates and options
 * @param {Object} props.center - Map center point {lat, lng}
 * @param {number} props.zoom - Map zoom level
 * @param {boolean} props.drawEnabled - Whether drawing should be enabled
 * @param {Function} props.onDrawComplete - Callback when drawing is completed
 * @param {Array} props.drones - Array of drone objects with real-time positions
 * @param {string} props.mapStyle - Map style to use (osm, satellite, terrain)
 * @param {boolean} props.showControls - Whether to show map controls
 */
const MapContainer = ({
  markers = [],
  polygons = [],
  paths = [],
  center = { lat: 21.7679, lng: 78.8718 }, // Default to center of India
  zoom = 5,
  drawEnabled = false,
  onDrawComplete,
  drones = [],
  mapStyle = 'osm',
  showControls = true,
}) => {
  const mapRef = useRef(null);
  const [activeBaseLayer, setActiveBaseLayer] = useState(mapStyle);
  const [recenterPosition, setRecenterPosition] = useState(null);
  const drawControlRef = useRef(null);

  // Get map tile layer based on selected style
  const getMapTileLayer = () => {
    switch (activeBaseLayer) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png';
      case 'osm':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  // Initialize drawing when enabled
  useEffect(() => {
    if (!mapRef.current || !drawEnabled) return;
    
    const map = mapRef.current;
    
    // Initialize leaflet-draw
    if (!drawControlRef.current && map) {
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      
      const drawControl = new L.Control.Draw({
        draw: {
          marker: false,
          circlemarker: false,
          circle: false,
          polyline: true,
          rectangle: true,
          polygon: {
            allowIntersection: false,
            showArea: true
          }
        },
        edit: {
          featureGroup: drawnItems,
          edit: true,
          remove: true
        }
      });
      
      map.addControl(drawControl);
      drawControlRef.current = drawControl;
      
      map.on(L.Draw.Event.CREATED, (event) => {
        const layer = event.layer;
        drawnItems.addLayer(layer);
        
        if (onDrawComplete) {
          // Convert the drawn shape to a format that can be used elsewhere
          let coordinates;
          
          if (event.layerType === 'polygon' || event.layerType === 'rectangle') {
            coordinates = layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
          } else if (event.layerType === 'polyline') {
            coordinates = layer.getLatLngs().map(latlng => [latlng.lat, latlng.lng]);
          }
          
          onDrawComplete({
            type: event.layerType,
            coordinates
          });
        }
      });
    }
    
    return () => {
      // Cleanup if component unmounts
      if (map && drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
    };
  }, [drawEnabled, onDrawComplete]);

  // Map control handlers
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleLocate = () => {
    setRecenterPosition(center);
  };

  const handleClearDrawing = () => {
    if (mapRef.current && drawControlRef.current) {
      const drawnItems = Object.values(mapRef.current._layers).find(
        layer => layer instanceof L.FeatureGroup
      );
      
      if (drawnItems) {
        drawnItems.clearLayers();
      }
    }
  };

  return (
    <div className="relative h-full w-full">
      <LeafletMapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="h-full w-full"
        whenCreated={(map) => {
          mapRef.current = map;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={getMapTileLayer()}
        />
        
        {/* Recenter map when needed */}
        {recenterPosition && <RecenterMap position={[recenterPosition.lat, recenterPosition.lng]} />}
        
        {/* Render all markers */}
        {markers.map((marker, index) => (
          <Marker 
            key={`marker-${index}`} 
            position={[marker.lat, marker.lng]} 
            icon={marker.icon || undefined}
          >
            {marker.popup && (
              <Popup>
                {marker.popup}
              </Popup>
            )}
          </Marker>
        ))}
        
        {/* Render all polygons (e.g., survey areas) */}
        {polygons.map((polygon, index) => (
          <Polygon
            key={`polygon-${index}`}
            positions={polygon.coordinates}
            pathOptions={{
              color: polygon.color || '#3388ff',
              fillColor: polygon.fillColor || '#3388ff',
              fillOpacity: polygon.fillOpacity || 0.2,
              weight: polygon.weight || 2,
              ...polygon.options
            }}
          >
            {polygon.popup && (
              <Popup>
                {polygon.popup}
              </Popup>
            )}
          </Polygon>
        ))}
        
        {/* Render all paths (e.g., flight routes) */}
        {paths.map((path, index) => (
          <Polyline
            key={`path-${index}`}
            positions={path.coordinates}
            pathOptions={{
              color: path.color || '#ff3333',
              weight: path.weight || 3,
              dashArray: path.dashArray,
              ...path.options
            }}
          >
            {path.popup && (
              <Popup>
                {path.popup}
              </Popup>
            )}
          </Polyline>
        ))}
        
        {/* Render drones with special icon */}
        {drones.map((drone, index) => (
          <Marker
            key={`drone-${index}`}
            position={[drone.lat, drone.lng]}
            icon={droneIcon}
            rotationAngle={drone.heading}
            rotationOrigin="center center"
          >
            <Popup>
              <div>
                <h3 className="font-medium text-gray-900">{drone.name}</h3>
                <p className="text-sm text-gray-500">Battery: {drone.battery}%</p>
                <p className="text-sm text-gray-500">Altitude: {drone.altitude}m</p>
                <p className="text-sm text-gray-500">Speed: {drone.speed}m/s</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletMapContainer>
      
      {/* Map controls */}
      {showControls && (
        <>
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onLocate={handleLocate}
            onClearDrawing={handleClearDrawing}
          />
          
          <LayerSelector
            activeLayer={activeBaseLayer}
            onLayerChange={setActiveBaseLayer}
          />
        </>
      )}
    </div>
  );
};

export default MapContainer;