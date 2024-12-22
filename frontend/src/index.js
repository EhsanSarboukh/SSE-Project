import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "mapbox-gl/dist/mapbox-gl.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { GoogleOAuthProvider } from "@react-oauth/google";

const RootComponent = () => {
  const [clientId, setClientId] = useState(null);

  useEffect(() => {
    fetch("/auth/google-client-id")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch client ID");
        }
        return response.json();
      })
      .then((data) => setClientId(data.clientId))
      .catch((error) => {
        console.error("Error fetching client ID:", error);
        alert("Failed to load Google Client ID");
      });
  }, []);

  return clientId ? (
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  ) : (
    <div>Loading...</div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);

reportWebVitals();
