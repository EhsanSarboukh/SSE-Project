import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartButton from '../component/cartButton.js';
import Header from '../pages/header.js';

const Home = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('User Token:', token); // Log the token to the console
    
        // Optionally, you can handle cases where the token is missing
        if (!token) {
          navigate('/login'); // Redirect to login if no token exists
        }
      }, [navigate]); // Runs once when the component mounts
    
    return (
        <div>
        <Header />
            <h1>Hello inventory</h1>
        </div>
    );
};

export default Home;
