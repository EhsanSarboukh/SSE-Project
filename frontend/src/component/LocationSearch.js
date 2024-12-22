// src/LocationSearch.js
import React, { useState } from 'react';
import axios from 'axios';

const LocationSearch = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const MAPBOX_TOKEN = 'pk.eyJ1IjoibXJwb3R0ZXIyMTIiLCJhIjoiY20yc3JtYW1jMDBuZjJsczlpdnRwdjIyeSJ9.kLjY_MUJaH8TUxxxNxKXCg'; // replace with your token

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      try {
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json`, {
          params: {
            access_token: MAPBOX_TOKEN,
            autocomplete: true,
            types: 'region,place',
            limit: 5,
          },
        });

        setSuggestions(response.data.features);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (place) => {
    setQuery(place.place_name);
    setSuggestions([]);
    onLocationSelect(place);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="הזן את האזור או המדינה שלך"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
      />

      {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 z-10">
          {suggestions.map((place) => (
            <li
              key={place.id}
              onClick={() => handleSuggestionClick(place)}
              className="px-4 py-2 cursor-pointer hover:bg-green-100"
            >
              {place.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;
