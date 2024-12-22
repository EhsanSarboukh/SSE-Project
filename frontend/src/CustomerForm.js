import React, { useState, useEffect } from "react";
import axios from "axios";
import LocationSearch from "./LocationSearch";
import MapPicker from "./MapPicker";
import { useLocation, useNavigate } from "react-router-dom";

const openDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("OrderDB", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("items")) {
        db.createObjectStore("items", { keyPath: "sku" });
      }
      if (!db.objectStoreNames.contains("cart")) {
        db.createObjectStore("cart", { keyPath: "sku" });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const CustomerForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { foundProducts } = location.state || { foundProducts: [] };
  const { total } = location.state || { total: 0 };

  const [formData, setFormData] = useState({
    customerId: "",
    fullName: "",
    shopName: "",
    phoneNumber: "",
    location: "", // For textual location from autofill
    coordinates: { latitude: null, longitude: null }, // For map coordinates
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  });

  const handleLocationSelect = (place) => {
    setFormData({ ...formData, location: place.place_name });
  };

  const handleMapLocationSelect = (coords) => {
    setFormData({ ...formData, coordinates: coords });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Combine the JSON objects into a single payload
      const payload = {
        formData,
        foundProducts,
        total,
      };

      // Send the payload as a single object
      const response = await axios.post(
        "http://localhost:5000/userRoutes/confirm-order",
        payload
      );

      // Navigate to OrderDetails.js after successful submission
      navigate("/order-details", {
        state: { formData, foundProducts, total },
      });

      alert(response.data.message);
    } catch (error) {
      console.error("Error saving customer data", error);
      alert("Failed to save customer data.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 via-green-200 to-blue-200 flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-8">
          פרטי לקוח
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-gray-700 text-lg font-semibold mb-2"
              htmlFor="customerId"
            >
              קוד לקוח
            </label>
            <input
              type="text"
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="הכנס את קוד הלקוח"
            />
          </div>
          <div>
            <label
              className="block text-gray-700 text-lg font-semibold mb-2"
              htmlFor="fullName"
            >
              שם מלא
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="הכנס את שמך המלא"
            />
          </div>
          <div>
            <label
              className="block text-gray-700 text-lg font-semibold mb-2"
              htmlFor="shopName"
            >
              שם העסק
            </label>
            <input
              type="text"
              id="shopName"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="הכנס את שם העסק"
            />
          </div>
          <div>
            <label
              className="block text-gray-700 text-lg font-semibold mb-2"
              htmlFor="phoneNumber"
            >
              מספר טלפון
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="הכנס מספר טלפון"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              מיקום
            </label>
            <LocationSearch onLocationSelect={handleLocationSelect} />
          </div>
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              חיפוש מיקום במפה
            </label>
            <MapPicker onLocationSelect={handleMapLocationSelect} />
          </div>
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="bg-green-500 text-black font-semibold py-2 px-6 rounded-full hover:bg-green-600 transition duration-300"
            >
              שלח
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
