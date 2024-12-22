// src/MapPicker.js
import React, { useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapPicker = ({ onLocationSelect }) => {
  const MAPBOX_TOKEN = 'pk.eyJ1IjoibXJwb3R0ZXIyMTIiLCJhIjoiY20yc3JtYW1jMDBuZjJsczlpdnRwdjIyeSJ9.kLjY_MUJaH8TUxxxNxKXCg'; // Replace with your Mapbox token
  const [marker, setMarker] = useState({
    latitude: 31.0461,  // Centered on Israel, adjust as needed
    longitude: 34.8516,
    
  });

  const handleMapClick = (event) => {
    // Log the entire event object to inspect the coordinates data
    console.log("Map click event:", event);

    // Access coordinates safely
    const coordinates = event.lngLat; // Check if lngLat is present
    if (coordinates) {
      // Make sure it's an array and has 2 elements
      if (Array.isArray(coordinates) && coordinates.length === 2) {
        const [longitude, latitude] = coordinates; // Destructure the lngLat array
        setMarker({ latitude, longitude });
        onLocationSelect({ latitude, longitude });
      } else {
        console.error("lngLat is not an array or has invalid length:", coordinates);
      }
    } else {
      console.error("lngLat not found in click event. Event object:", event);
    }
  };

  return (
    <div className="w-full h-80 border border-gray-300 rounded-lg overflow-hidden mt-4">
      <Map
        initialViewState={{
          latitude: marker.latitude,
          longitude: marker.longitude,
          zoom: 8,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={handleMapClick}
      >
        <Marker latitude={marker.latitude} longitude={marker.longitude} />
      </Map>
    </div>
  );
};

export default MapPicker;
