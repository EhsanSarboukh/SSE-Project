import React, {useEffect, useState} from 'react';
import { GoogleLogin } from 'react-google-login';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';



const LoginWithGoogle = () => {
  const navigate = useNavigate();
  const [clientId, setClientId]= useState(null);
    // Fetch the Google Client ID from the backend upon component load
  useEffect(() => {
    fetch('/auth/google-client-id')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch client ID');
        }
        return response.json();
      })
      .then((data) => setClientId(data.clientId))
      .catch((error) => {
        console.error("Error fetching client ID:", error);
        alert("Failed to load Google Client ID");
      });
  }, []);
    // Handle successful login response from Google
  const onSuccess = async (res) => {
    const googleToken = res.tokenId; // Token provided by Google on success
    try {
        // Send token to backend for verification and obtain access token
        const response = await axios.post('http://localhost:5000/userRoutes/google-login', { googleToken });
        if (response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);
            navigate('/order');
        } else {
            alert('Google authentication failed');
        }
    } catch (error) {
        console.error("Google authentication failed:", error);
        alert("Google authentication failed.");
    }
};


  // Handle login failure
  const onFailure = (res) => {
    console.log("Google Login failed!", res);
  };
  
  return (
    <div>
    {clientId ? (
      <GoogleLogin
        clientId={clientId}
        buttonText="Login with Google"
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={'single_host_origin'}
      />
    ) : (
      <div>Loading Google Login...</div>
    )}
  </div>
  );
};

export default LoginWithGoogle;
