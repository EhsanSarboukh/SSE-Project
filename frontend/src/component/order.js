import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";
import CartButton from "./cartButton";
import Header from "../pages/header";
import Footer from "../pages/footer";
import Loading from "./Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

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

const saveItemToDB = async (item) => {
  const db = await openDB();
  const transaction = db.transaction("items", "readwrite");
  const store = transaction.objectStore("items");
  store.put(item); // Save or update the item by SKU
  return transaction.complete;
};

const saveToDB = async (storeName, data) => {
  const db = await openDB();
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);

  // Clear the store first to ensure no residual data remains
  await new Promise((resolve, reject) => {
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => resolve();
    clearRequest.onerror = (event) => reject(event.target.error);
  });

  // Add new data
  for (const item of data) {
    await new Promise((resolve, reject) => {
      const putRequest = store.put(item);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = (event) => reject(event.target.error);
    });
  }
};

const getAllFromDB = async (storeName) => {
  const db = await openDB();
  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = (event) => reject(event.target.error);
  });
};

function Order() {
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [originalAmounts, setOriginalAmounts] = useState({});
  const [cart, setCart] = useState([]);
  const [sortOrder, setSortOrder] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const [showCartModal, setShowCartModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  const [hoveredItem, setHoveredItem] = useState(null); // Tracks which item's image is hovered
  const [quantity, setQuantity] = useState({});

  const [modalQuantity, setModalQuantity] = useState(0);
  const [isCartVisible, setIsCartVisible] = useState(false);

  const itemsPerPage = 15;

  useEffect(() => {
    const fetchAndInitialize = async () => {
      try {
        // Check for items in IndexedDB
        const storedItems = await getAllFromDB("items");
        if (storedItems.length > 0) {
          const transformedItems = storedItems.map((item) => ({
            ...item,
            image: item.imageBlob
              ? URL.createObjectURL(item.imageBlob) // Convert blob to ObjectURL
              : item.image ||
                `${process.env.PUBLIC_URL}/images/placeholder.png`, // Fallback to placeholder
          }));
          setItems(transformedItems);
          // Fetch cart from IndexedDB
          const storedCart = await getAllFromDB("cart");
          setCart(storedCart);
          return;
        }

        // Fetch items from the backend
        const response = await fetch(
          "http://localhost:5000/productRoutes/getProducts"
        );
        const data = await response.json();

        // Transform and save fetched data
        const updatedItems = await Promise.all(
          data.map(async (item) => {
            const blob = item.image
              ? await fetch(item.image).then((res) => res.blob())
              : null;
            const objectURL = blob ? URL.createObjectURL(blob) : null;

            const transformedItem = {
              ...item,
              imageBlob: blob, // Save blob to IndexedDB
              image:
                objectURL || `${process.env.PUBLIC_URL}/images/placeholder.png`, // Fallback to placeholder
            };

            // Save to IndexedDB
            await saveItemToDB({
              ...transformedItem,
              imageBlob: blob, // Save blob separately
            });

            return transformedItem;
          })
        );

        setItems(updatedItems);
      } catch (error) {
        console.error("Failed to fetch or store items:", error);
      }

      // Fetch cart from IndexedDB
      const storedCart = await getAllFromDB("cart");
      setCart(storedCart);
    };

    fetchAndInitialize();
  }, [navigate]);

  useEffect(() => {
    if (items.length > 0) {
      const initialOriginalAmounts = {};
      items.forEach((item) => {
        initialOriginalAmounts[item.sku] = item.amount;
      });
      setOriginalAmounts(initialOriginalAmounts);
    }
  }, [items]);

  const handleQuantityChange = async (sku, newQuantity) => {
    const originalAmount = originalAmounts[sku];

    if (newQuantity >= 0 && newQuantity <= originalAmount) {
      const updatedCart = cart.map((cartItem) =>
        cartItem.sku === sku
          ? { ...cartItem, selectedAmount: newQuantity }
          : cartItem
      );

      if (newQuantity === 0) {
        // Remove from cart if quantity is 0
        const filteredCart = updatedCart.filter(
          (cartItem) => cartItem.sku !== sku
        );
        setCart(filteredCart);
        await saveToDB("cart", filteredCart);
      } else {
        // Add or update the item in the cart
        if (!updatedCart.some((cartItem) => cartItem.sku === sku)) {
          const item = items.find((item) => item.sku === sku);
          updatedCart.push({ sku, selectedAmount: newQuantity });
        }
        setCart(updatedCart);
        await saveToDB("cart", updatedCart);
      }
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFilteredItems = [...filteredItems].sort((a, b) => {
    if (sortOrder === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortOrder === "amount") {
      return sortDirection === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = sortedFilteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getCartQuantity = (sku) => {
    const cartItem = cart.find((item) => item.sku === sku);
    return cartItem ? cartItem.selectedAmount : 0;
  };

  const calculateInStockAmount = (item) => {
    const inCartQuantity = getCartQuantity(item.sku);
    return item.amount - inCartQuantity;
  };

  return (
    <div>
      <div className="w-full">
        <Header />
      </div>
      <div className="App min-h-screen bg-green-50 flex flex-col">
        <div className="absolute right-5 mt-9">
          <CartButton products={cart} />
        </div>

        <div className="controls-container">
          <div className="label-select-container">
            <select
              className="custom-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="name">שם</option>
              <option value="amount">כמות</option>
            </select>
            <label className="custom-label">:מיין לפי </label>
          </div>

          <select
            className="custom-select"
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value)}
          >
            <option value="asc">סדר עולה</option>
            <option value="desc">סדר יורד</option>
          </select>

          <input
            className="custom-input"
            type="text"
            placeholder="חפש לפי שם"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div
          style={{ gridRowGap: "2px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-center mx-auto w-3/5 custom-grid"
        >
          {items.length === 0 ? (
            <>
              <Loading />
              <div className="h-[80vh]"></div>
            </>
          ) : (
            paginatedItems.map((item) => (
              <div
                className="custom-card"
                key={item.sku}
                onMouseEnter={() => setHoveredItem(item.sku)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Image Section with Hover Buttons */}
                <div className="relative custom-image-container">
                  <img
                    className="custom-image"
                    src={item.image} // Image is preloaded via IndexedDB
                    alt={item.name}
                  />
                  <div className="absolute bottom-0 left-0 m-2">
                    {!cart.find((cartItem) => cartItem.sku === item.sku) ? (
                      <button
                        className="custom-button add-button"
                        onClick={() => handleQuantityChange(item.sku, 1)}
                      >
                        +
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          className="custom-button decrement-button"
                          onClick={() =>
                            handleQuantityChange(
                              item.sku,
                              cart.find((cartItem) => cartItem.sku === item.sku)
                                ?.selectedAmount - 1
                            )
                          }
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={
                            cart.find((cartItem) => cartItem.sku === item.sku)
                              ?.selectedAmount || 0
                          }
                          onChange={(e) =>
                            handleQuantityChange(
                              item.sku,
                              parseInt(e.target.value, 10)
                            )
                          }
                          className="custom-input"
                          min={0}
                          max={originalAmounts[item.sku]}
                        />
                        <button
                          className="custom-button increment-button"
                          onClick={() =>
                            handleQuantityChange(
                              item.sku,
                              cart.find((cartItem) => cartItem.sku === item.sku)
                                ?.selectedAmount + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="custom-label custom-title">{item.name}</h3>
                <p className="custom-label">
                  כמות בהזמנה: {getCartQuantity(item.sku)}
                </p>
                <p className="custom-label">כמות במלאי: {item.amount}</p>
                <p className="custom-label">
                  תוקף: {formatDate(item.expirationDate)}
                </p>
                <p className="custom-label">מחיר ליחידה: ₪ {item.price}</p>
              </div>
            ))
          )}
        </div>

        <div className="pagination-container">
          <button
            className="pagination-button left"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon className="pagination-icon" icon={faArrowLeft} />
            לעמוד הקודם
          </button>

          <h1 className="pagination-info" dir="rtl">
            {currentPage} מתוך {Math.ceil(items.length / itemsPerPage)}
          </h1>

          <button
            className="pagination-button right"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            לעמוד הבא
            <FontAwesomeIcon className="pagination-icon" icon={faArrowRight} />
          </button>
        </div>
      </div>
      <div className="w-full mt-auto flex-none">
        <Footer
          currentState={{ items, currentPage, originalAmounts, cart }}
        ></Footer>
      </div>
    </div>
  );
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default Order;
