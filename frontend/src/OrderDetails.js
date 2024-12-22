import React, { useRef, useState, useEffect } from "react";
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

const updateToDB = async (storeName, data) => {
  const db = await openDB();
  const transaction = db.transaction(["cart", storeName], "readwrite");
  const cartObjectStore = transaction.objectStore("cart");
  const store = transaction.objectStore(storeName);

  for (const item of data) {
    await new Promise((resolve, reject) => {
      console.log("item in cart: ", item);
      const getRequest = store.get(item["sku"]);

      getRequest.onsuccess = () => {
        const itemDetails = getRequest.result;

        if (itemDetails) {
          console.log("item in inventory: ", itemDetails);
          // Update the amount in inventory
          console.log("amount before update: ", itemDetails.amount);

          itemDetails.amount = itemDetails.amount - item["amount"];

          console.log("amount after update: ", itemDetails.amount);

          // Update the store
          const updateRequest = store.put(itemDetails);

          updateRequest.onsuccess = () => {
            console.log(`Item updated successfully, SKU: ${item["sku"]}`);
            resolve();
          };

          updateRequest.onerror = (event) => {
            console.error(`Failed to update item with SKU: ${item["sku"]}`);
            reject(event.target.error);
          };
        } else {
          console.warn(`Item with SKU: ${item["sku"]} not found in inventory`);
          resolve(); // Resolve even if item is not found
        }
      };

      getRequest.onerror = (event) => {
        console.error(`Error fetching item with SKU: ${item["sku"]}`);
        reject(event.target.error);
      };
    });
  }

  // Clear the cart after updates
  cartObjectStore.clear().onsuccess = () => {
    console.log("Cart cleared successfully.");
  };

  transaction.oncomplete = () => {
    console.log("Transaction completed successfully.");
  };

  transaction.onerror = (event) => {
    console.error("Transaction failed:", event.target.error);
  };
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

const OrderDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef();

  const {
    formData,
    foundProducts: initialFoundProducts,
    total: initialTotal,
  } = location.state || {};
  const [foundProducts, setFoundProducts] = useState(
    initialFoundProducts || []
  );
  const [total, setTotal] = useState(initialTotal || 0);

  useEffect(() => {
    if (!formData) {
      navigate("/Order"); // Redirect to Order page if formData is missing
      return;
    }

    const fetchAndCombineData = async () => {
      const items = await getAllFromDB("items");
      const cart = await getAllFromDB("cart");

      const combinedProducts = cart
        .map((cartItem) => {
          const matchedItem = items.find((item) => item.sku === cartItem.sku);
          if (matchedItem) {
            const totalPrice = parseFloat(
              cartItem.selectedAmount * matchedItem.price
            ).toFixed(2);
            return {
              sku: cartItem.sku,
              product: matchedItem.name,
              image: matchedItem.imageBlob
                ? URL.createObjectURL(matchedItem.imageBlob)
                : matchedItem.image,
              priceForOne: matchedItem.price,
              amount: cartItem.selectedAmount,
              totlaPrice: parseFloat(totalPrice),
            };
          }
          return null;
        })
        .filter((product) => product !== null);

      setFoundProducts(combinedProducts);

      const totalOrderPrice = combinedProducts.reduce(
        (acc, product) => acc + product.totlaPrice,
        0
      );
      setTotal(totalOrderPrice);

      return () => {
        combinedProducts.forEach((product) => {
          if (product.image && product.image.startsWith("blob:")) {
            URL.revokeObjectURL(product.image);
          }
        });
      };
    };

    fetchAndCombineData();
  }, [formData, navigate]);

  const UpdateInventoryDataAndNavigate = () => {
    // Update IndexedDB
    console.log("Found products: ", foundProducts);
    updateToDB("items", foundProducts);

    navigate("/Order");
  };

  const printPDF = () => {
    const printWindow = document.createElement("iframe");
    printWindow.style.position = "absolute";
    printWindow.style.top = "-10000px";
    document.body.appendChild(printWindow);

    const printDocument =
      printWindow.contentDocument || printWindow.contentWindow.document;

    const customerDetails = `
      <div class="customer-details">
        <p><strong>Customer ID:</strong> ${formData.customerId}</p>
        <p><strong>Full Name:</strong> ${formData.fullName}</p>
        <p><strong>Shop Name:</strong> ${formData.shopName}</p>
        <p><strong>Phone Number:</strong> ${formData.phoneNumber}</p>
        <p><strong>Location:</strong> ${formData.location}</p>
      </div>
    `;

    printDocument.open();
    printDocument.write(`
      <html>
        <head>
          <title>Order Details</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.5;
              margin: 20px;
            }
            .container {
              max-width: 800px;
              margin: auto;
              background: white;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .customer-details, .product {
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 1px solid #ddd;
            }
            .product {
              display: flex;
              align-items: center;
            }
            .product img {
              max-width: 100px;
              border-radius: 8px;
            }
            .product-details {
              flex: 1;
              margin-left: 20px;
            }
            .total {
              font-size: 1.5em;
              font-weight: bold;
              text-align: right;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Details</h1>
            </div>
            ${customerDetails}
            <div>
              ${foundProducts
                .map(
                  (product) => `
                    <div class="product">
                      <div>
                        <img src="${product.image}" alt="${product.product}">
                      </div>
                      <div class="product-details">
                        <p><strong>${product.product}</strong></p>
                        <p>Quantity: ${product.amount}</p>
                        <p>Price per Unit: ₪${product.priceForOne}</p>
                        <p>Total: ₪${parseFloat(product.totlaPrice).toFixed(
                          2
                        )}</p>
                      </div>
                    </div>
                  `
                )
                .join("")}
            </div>
            <div class="total">
              Total to Pay: ₪${total.toFixed(2)}
            </div>
          </div>
        </body>
      </html>
    `);

    printDocument.close();
    printWindow.contentWindow.focus();
    printWindow.contentWindow.print();
    printWindow.parentNode.removeChild(printWindow);
  };

  return (
    <div>
      <div
        ref={printRef}
        className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          פרטי הזמנה ולקוח
        </h1>

        {/* Product Details Section */}
        <div>
          {foundProducts.map((product, index) => (
            <div
              key={index}
              className="flex items-center border-b border-gray-200 py-4"
            >
              <div className="w-1/6">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.product}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                )}
              </div>
              <div className="w-4/6 pl-4">
                <p className="text-xl font-semibold text-blue-900 mb-2">
                  {product.product}
                </p>
                <p className="text-gray-600">Quantity: {product.amount}</p>
                <p className="text-gray-600">
                  Price per Unit: ₪{product.priceForOne}
                </p>
                <p className="font-semibold text-gray-800">
                  Total: ₪{product.totlaPrice}
                </p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-gray-700 mt-6">
          Total: ₪{total.toFixed(2)}
        </h2>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={printPDF}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg mx-2"
        >
          Print Order
        </button>
        <button
          type="button"
          onClick={() => UpdateInventoryDataAndNavigate()}
          className="bg-green-500 text-white py-2 px-6 rounded-full mx-2 hover:bg-green-600 transition"
        >
          Home
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
