import React, { useRef, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiMapPin, FiSearch, FiX } from 'react-icons/fi';

// Fix Leaflet's icon loading issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Map marker component
const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

/**
 * MapLocationPicker component for selecting a location on a map
 * 
 * @param {Object} props
 * @param {Array} props.initialPosition - Initial position [lat, lng]
 * @param {Function} props.onChange - Callback when position changes
 * @param {string} props.label - Field label
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.helpText - Help text for the field
 * @param {Object} props.mapStyle - Style object for the map
 */
const MapLocationPicker = ({
  initialPosition = null,
  onChange,
  label = 'Location',
  required = false,
  error,
  className = '',
  helpText,
  mapStyle = { height: '400px' }
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const mapRef = useRef(null);
  
  // Update parent component when position changes
  useEffect(() => {
    if (onChange && position) {
      onChange(position);
    }
  }, [position]);
  
  // Handle position change
  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    if (mapRef.current) {
      mapRef.current.setView(newPosition, 13);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Search for location using Nominatim API
  const handleSearch = (e) => {
    // Prevent default if this is called from a button click or form submit
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      .then(response => response.json())
      .then(data => {
        setSearchResults(data);
        setIsSearching(false);
      })
      .catch(err => {
        console.error('Error searching for location:', err);
        setIsSearching(false);
      });
  };
  
  // Handle key press in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleSearch();
    }
  };
  
  // Select a search result
  const selectSearchResult = (result) => {
    const newPosition = [parseFloat(result.lat), parseFloat(result.lon)];
    handlePositionChange(newPosition);
    setSearchResults([]);
    setSearchQuery('');
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      
      {/* Search bar - changed from form to div */}
      <div className="mb-2">
        <div className="flex">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              placeholder="Search for a location"
              className={`
                block w-full rounded-md pl-10 pr-10 py-2 sm:text-sm
                ${error 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }
              `}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FiX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button
            type="button" // Changed from submit to button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className={`
              ml-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm 
              text-white bg-primary-600 hover:bg-primary-700
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              ${(isSearching || !searchQuery.trim()) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            Search
          </button>
        </div>
        
        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-y-auto">
            <ul className="py-1">
              {searchResults.map((result) => (
                <li 
                  key={result.place_id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                  onClick={() => selectSearchResult(result)}
                >
                  <FiMapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <div className="font-medium">{result.display_name.split(',')[0]}</div>
                    <div className="text-sm text-gray-500">
                      {result.display_name.split(',').slice(1).join(',').trim()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Current coordinates display */}
      {position && (
        <div className="mb-2 text-sm flex items-center space-x-2">
          <div className="bg-gray-100 px-2 py-1 rounded">
            <span className="font-medium">Lat:</span> {position[0].toFixed(6)}
          </div>
          <div className="bg-gray-100 px-2 py-1 rounded">
            <span className="font-medium">Lng:</span> {position[1].toFixed(6)}
          </div>
        </div>
      )}
      
      {/* Map */}
      <div className="rounded-md overflow-hidden border border-gray-300">
        <MapContainer
          center={position || [21.7679, 78.8718]} // Default center on India if no position
          zoom={position ? 13 : 5}
          style={mapStyle}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          <LocationMarker position={position} setPosition={handlePositionChange} />
        </MapContainer>
      </div>
      
      {/* Help text or error message */}
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : (
        <p className="mt-1 text-sm text-gray-500">Click on the map to select a location</p>
      )}
    </div>
  );
};

export default MapLocationPicker;