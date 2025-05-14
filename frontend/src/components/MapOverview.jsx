import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiInfo, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

// Fix Leaflet marker icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icons for different drone statuses
const createDroneIcon = (status) => {
    const iconColor = 
      status === 'available' ? '#10B981' :  // green
      status === 'active' ? '#10B981' :     // also green for active
      status === 'in-mission' ? '#3B82F6' : // blue
      status === 'flying' ? '#3B82F6' :     // also blue for flying
      status === 'maintenance' ? '#F59E0B' : // yellow
      status === 'offline' ? '#6B7280' :    // gray
      status === 'error' ? '#EF4444' :      // red
      status === 'idle' ? '#8B5CF6' :       // purple for idle
      status === 'charging' ? '#10B981' :   // green for charging
      status === 'inactive' ? '#6B7280' :   // gray for inactive
      '#3B82F6';                           // default blue
    
    return L.divIcon({
      className: 'custom-drone-icon',
      html: `<div style="background-color: ${iconColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

// Component to recenter map when center changes
const SetViewOnChange = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

/**
 * MapOverview component for displaying drones and missions on a map
 * 
 * @param {Object} props
 * @param {Array} props.drones - Array of drone objects with position data
 * @param {Array} props.missions - Array of mission objects
 * @param {Array} props.activeMissions - Array of currently active missions
 * @param {boolean} props.showMissions - Whether to show mission paths on the map
 * @param {Object} props.center - Center coordinates for the map
 * @param {number} props.zoom - Zoom level for the map
 * @param {Function} props.onDroneSelect - Callback when a drone is selected
 */
const MapOverview = ({
  drones = [],
  missions = [],
  activeMissions = [],
  showMissions = true,
  center = null,
  zoom = 10,
  onDroneSelect = () => {}
}) => {
  const mapRef = useRef(null);
  
  // Calculate map center based on drone positions if not provided
  const calculateCenter = () => {
    if (center) return center;
    
    // Make sure drones is an array
    const dronesArray = Array.isArray(drones) ? drones : [];
    if (dronesArray.length === 0) return [21.7679, 78.8718]; // Default center (India)
    
    // Filter out drones with valid coordinates first
    const dronesWithCoords = dronesArray.filter(
      drone => drone?.location?.coordinates?.[0] && drone?.location?.coordinates?.[1]
    );
    
    if (dronesWithCoords.length === 0) return [21.7679, 78.8718];
    
    // Average of all drone positions
    const avgLat = dronesWithCoords.reduce((sum, drone) => 
      sum + drone.location.coordinates[1], 0) / dronesWithCoords.length;
      
    const avgLng = dronesWithCoords.reduce((sum, drone) => 
      sum + drone.location.coordinates[0], 0) / dronesWithCoords.length;
    
    return [avgLat, avgLng];
  };
  
  // Get status icon for popups
  const getStatusIcon = (status) => {
    switch(status) {
      case 'available':
        return <FiCheckCircle className="text-green-500 mr-1" />;
      case 'in-mission':
        return <FiInfo className="text-blue-500 mr-1" />;
      case 'maintenance':
        return <FiAlertTriangle className="text-yellow-500 mr-1" />;
      case 'error':
        return <FiAlertTriangle className="text-red-500 mr-1" />;
      default:
        return null;
    }
  };
  
  // Format drone details for popup
  const getDroneDetails = (drone) => {
    return (
      <div>
        <h3 className="font-medium text-gray-800">{drone.name}</h3>
        <div className="mt-1 text-sm">
          <div className="flex items-center text-gray-500">
            {getStatusIcon(drone.status)}
            <span className="capitalize">{drone.status || 'Unknown'}</span>
          </div>
          <div className="mt-1 text-gray-600">
            Battery: {drone.batteryLevel || 'N/A'}%
          </div>
          {drone.model && (
            <div className="text-gray-600">Model: {drone.model}</div>
          )}
        </div>
      </div>
    );
  };
  
  const mapCenter = calculateCenter();
  
  return (
    <div className="h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <SetViewOnChange center={mapCenter} />
        
        {/* Render drones */}
        {Array.isArray(drones) && drones.map((drone) => (
            drone?._id && drone?.location?.coordinates && (
                <Marker
                key={drone._id}
                position={[
                    drone.location.coordinates[1], 
                    drone.location.coordinates[0]
                ]}
                icon={createDroneIcon(drone.status)}
                eventHandlers={{
                    click: () => onDroneSelect(drone),
                }}
                >
                <Popup>
                    {getDroneDetails(drone)}
                </Popup>
                </Marker>
            )
        ))}
        
        {/* Render mission paths if enabled */}
        // Replace the entire showMissions && missions.map block with this improved version
{showMissions && Array.isArray(missions) && missions.map((mission) => {
  // First check if the mission has waypoints data
  if (!mission?.waypoints || !Array.isArray(mission.waypoints) || mission.waypoints.length === 0) {
    return null;
  }

  // Handle potential different waypoint formats
  let positions = [];
  try {
    // Debug waypoint data structure
    console.log(`Mission ${mission._id || mission.id} waypoint example:`, mission.waypoints[0]);
    
    // Check if the waypoints are object IDs (need to fetch) or already resolved objects
    if (typeof mission.waypoints[0] === 'string' || 
        (mission.waypoints[0] && !mission.waypoints[0].location && !mission.waypoints[0].coordinates)) {
      // These are likely just IDs, we can't render them without fetching
      console.log('Waypoints are IDs, need to fetch actual waypoint data');
      return null;
    }
    
    // Try different possible waypoint structures
    if (mission.waypoints[0]?.location?.coordinates && 
        Array.isArray(mission.waypoints[0].location.coordinates) && 
        mission.waypoints[0].location.coordinates.length >= 2) {
      // Structure: waypoint.location.coordinates [lng, lat]
      positions = mission.waypoints
        .filter(wp => wp?.location?.coordinates && Array.isArray(wp.location.coordinates) && wp.location.coordinates.length >= 2)
        .map(wp => [wp.location.coordinates[1], wp.location.coordinates[0]]);
    } else if (mission.waypoints[0]?.coordinates && 
              Array.isArray(mission.waypoints[0].coordinates) && 
              mission.waypoints[0].coordinates.length >= 2) {
      // Structure: waypoint.coordinates [lng, lat]
      positions = mission.waypoints
        .filter(wp => wp?.coordinates && Array.isArray(wp.coordinates) && wp.coordinates.length >= 2)
        .map(wp => [wp.coordinates[1], wp.coordinates[0]]);
    } else if (mission.waypoints[0]?.latitude !== undefined && mission.waypoints[0]?.longitude !== undefined) {
      // Structure: waypoint has direct latitude, longitude properties
      positions = mission.waypoints
        .filter(wp => wp?.latitude !== undefined && wp?.longitude !== undefined)
        .map(wp => [wp.latitude, wp.longitude]);
    } else if (mission.waypoints[0]?.lat !== undefined && mission.waypoints[0]?.lng !== undefined) {
      // Structure: waypoint has lat, lng properties
      positions = mission.waypoints
        .filter(wp => wp?.lat !== undefined && wp?.lng !== undefined)
        .map(wp => [wp.lat, wp.lng]);
    } else {
      // Check for boundingBox fallback
      if (mission.boundingBox && 
          mission.boundingBox.coordinates && 
          Array.isArray(mission.boundingBox.coordinates) &&
          mission.boundingBox.coordinates[0] && 
          Array.isArray(mission.boundingBox.coordinates[0])) {
        // Use bounding box polygon coordinates instead
        positions = mission.boundingBox.coordinates[0].map(coord => [coord[1], coord[0]]);
      } else {
        console.warn(`Unable to determine waypoint format for mission: ${mission._id || mission.id}`);
        return null;
      }
    }

    // Skip if we don't have at least 2 valid positions
    if (positions.length < 2) {
      console.warn(`Not enough valid waypoints for mission: ${mission._id || mission.id}`);
      return null;
    }

    return (
      <Polyline
        key={mission._id || mission.id}
        positions={positions}
        color={activeMissions.some(am => am._id === mission._id) ? '#3B82F6' : '#9CA3AF'}
        weight={activeMissions.some(am => am._id === mission._id) ? 3 : 2}
        dashArray={activeMissions.some(am => am._id === mission._id) ? '' : '5, 5'}
      />
    );
  } catch (error) {
    console.error(`Error rendering mission path for mission ${mission._id || mission.id}:`, error);
    return null;
  }
})}
      </MapContainer>
    </div>
  );
};

export default MapOverview;