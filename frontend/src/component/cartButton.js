import React from "react";
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Correct import
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';


// Open the IndexedDB
export const openDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OrderDB', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('items')) {
        db.createObjectStore('items', { keyPath: 'sku' });
      }
      if (!db.objectStoreNames.contains('cart')) {
        db.createObjectStore('cart', { keyPath: 'sku' });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

// Retrieve all records from a specific store
export const getAllFromDB = async (storeName) => {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = (event) => reject(event.target.error);
  });
};

// Fetch and combine cart and item data
export const fetchCartItemsFromDB = async () => {
  const items = await getAllFromDB('items');
  const cart = await getAllFromDB('cart');

  const detailedCartItems = cart.map(cartItem => {
    const matchedItem = items.find(item => item.sku === cartItem.sku);
    if (matchedItem) {
      const imageUrl = matchedItem.imageBlob
        ? URL.createObjectURL(matchedItem.imageBlob)
        : matchedItem.image;

      const totalPrice = parseFloat(cartItem.selectedAmount * matchedItem.price).toFixed(2);

      return {
        sku: cartItem.sku,
        name: matchedItem.name,
        amount: cartItem.selectedAmount,
        totlaPrice: parseFloat(totalPrice),
        priceForOne: matchedItem.price,
        image: imageUrl,
      };
    }
    return null;
  }).filter(product => product !== null);

  return detailedCartItems;
};



const CartButton = ({products}) =>{
    const navigate = useNavigate();
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);
    const [cartItems, setCartItems] = useState(products || []);
    useEffect(() => {
      const fetchCartItems = async () => {
        try {
          const cartItems = await fetchCartItemsFromDB(); // Fetch data from IndexedDB
          setCartItems(cartItems);
        } catch (error) {
          console.error("Error fetching cart items from IndexedDB:", error);
        }
      };
  
      fetchCartItems();
    }, [products]); // Run this effect once on component mount // Run this effect whenever `products` prop changes
  
    // Calculate total price based on `cartItems`
    const calculateTotalPrice = () => {
      return cartItems.reduce((total, item) => total + (item.amount * item.priceForOne), 0);
    };

   

    const viewCart = async () => {
      try {
        // Fetch items and cart data from IndexedDB
        const items = await getAllFromDB('items');
        const cart = await getAllFromDB('cart');
    
        // Combine cart and item data
        const cartData = cart.map(cartItem => {
          const matchedItem = items.find(item => item.sku === cartItem.sku);
          if (matchedItem) {
            const imageUrl = matchedItem.imageBlob
              ? URL.createObjectURL(matchedItem.imageBlob) // Use blob URL if available
              : matchedItem.image;
    
            const totalPrice = parseFloat(cartItem.selectedAmount * matchedItem.price).toFixed(2);
            return {
              sku: cartItem.sku,
              name: matchedItem.name,
              amount: cartItem.selectedAmount,
              totlaPrice: parseFloat(totalPrice),
              priceForOne: matchedItem.price,
              image: imageUrl,
            };
          }
          return null; // Exclude items not found in `items`
        }).filter(product => product !== null); // Remove null entries
    
        // Navigate with the combined cart data
        navigate('/view-order-details', { state: { cartData } });
    
        // Cleanup logic to revoke blob URLs
        return () => {
          cartData.forEach(product => {
            if (product.image && product.image.startsWith('blob:')) {
              URL.revokeObjectURL(product.image);
            }
          });
        };
      } catch (error) {
        console.error('Error fetching cart details:', error);
      }
    };
    
 
  

    

    return (
      <div className="relative" onMouseEnter={toggleDropdown} onMouseLeave={toggleDropdown}>
        <button type="button" onClick={viewCart}>
          <FontAwesomeIcon icon={faShoppingCart} size="xl" />
        </button>
        {isDropdownVisible && (
  <div className="absolute right-0 w-72 p-4 bg-white border border-gray-200 shadow-lg rounded-lg" style={{ zIndex: 1000 }}>
  <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
  פירוט הזמנה, {cartItems.length} פריטים
    </h3>

    {/* Scrollable Product List */}
    <div className="max-h-48 overflow-y-auto">
    {cartItems.map((item, index) => (
       
              <div key={index} className="flex items-center mb-3 border-b pb-3 last:border-none last:pb-0">
              
          <div className="flex-1 flex justify-between items-center text-gray-600">
            <span className="text-sm">₪{item.priceForOne} x {item.amount}</span>
            <span className="text-gray-700 font-medium">{item.name}</span>
          </div>
        </div>
      ))}
    </div>

    <div className="flex justify-between items-center font-bold text-gray-900 mt-4 border-t pt-4">
      <span>₪{calculateTotalPrice().toFixed(2)}</span>
      <span>סה"כ לתשלום</span>
    </div>

    <button
      className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold p-3 rounded-lg flex items-center justify-center transition duration-200 ease-in-out"
      onClick={viewCart}
    >
      <FontAwesomeIcon icon={faCreditCard} size="sm" className="mr-2" />
      צפייה בעגלה ומעבר לתשלום
    </button>
    
  </div>
)}

      </div>
    );
   
};
export default CartButton;