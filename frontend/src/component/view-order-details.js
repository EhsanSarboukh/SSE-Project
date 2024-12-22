import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faTrash } from "@fortawesome/free-solid-svg-icons";
import Header from "../pages/header";
import Popup from "./Popup";
import Footer from "../pages/footer";
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

const ViewOrderDetails = () => {
  const navigate = useNavigate();
  const printRef = useRef();

  const [foundProducts, setFoundProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalAmount, setShowModalAmount] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [newAmount, setNewAmount] = useState(0);
  const [popupContent, setPopupContent] = useState({ title: "", message: "" });
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const fetchAndCombineData = async () => {
      const items = await getAllFromDB("items");
      const cart = await getAllFromDB("cart");

      const combinedProducts = cart
        .map((cartItem) => {
          const matchedItem = items.find((item) => item.sku === cartItem.sku);
          if (matchedItem) {
            const imageUrl = matchedItem.imageBlob
              ? URL.createObjectURL(matchedItem.imageBlob)
              : matchedItem.image;

            const totalPrice = parseFloat(
              cartItem.selectedAmount * matchedItem.price
            ).toFixed(2);
            return {
              sku: cartItem.sku,
              product: matchedItem.name,
              image: imageUrl,
              priceForOne: matchedItem.price,
              amount: cartItem.selectedAmount,
              amountInInventory: matchedItem.amount,
              totlaPrice: parseFloat(totalPrice),
            };
          }
          return null;
        })
        .filter((product) => product !== null);

      setFoundProducts(combinedProducts);

      // Cleanup logic to revoke blob URLs on unmount
      return () => {
        combinedProducts.forEach((product) => {
          if (product.image && product.image.startsWith("blob:")) {
            URL.revokeObjectURL(product.image);
          }
        });
      };
    };

    fetchAndCombineData();
  }, []);

  const openPopup = (title, message) => {
    setPopupContent({ title, message });
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  // OLD PRINTING FUNCTION

  // const printPDF = () => {
  //   const printContents = printRef.current.innerHTML;
  //   const originalContents = document.body.innerHTML;
  //   document.body.innerHTML = printContents;
  //   window.print();
  //   document.body.innerHTML = originalContents;
  // };

  const printPDF = () => {
    const printWindow = document.createElement("iframe");
    printWindow.style.position = "absolute";
    printWindow.style.top = "-10000px";
    document.body.appendChild(printWindow);

    const printDocument =
      printWindow.contentDocument || printWindow.contentWindow.document;

    printDocument.open();
    printDocument.write(`
      <html>
        <head>
          <title>Print Order</title>
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
            .product {
              display: flex;
              align-items: center;
              border-bottom: 1px solid #ddd;
              padding: 10px 0;
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
              <h1>פרטי הזמנה</h1>
            </div>
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
                        <p>כמות: ${product.amount}</p>
                        <p>מחיר ליחידה: ₪${product.priceForOne}</p>
                        <p>סה"כ: ₪${parseFloat(product.totlaPrice).toFixed(
                          2
                        )}</p>
                      </div>
                    </div>
                  `
                )
                .join("")}
            </div>
            <div class="total">
              סה"כ לתשלום: ₪${foundProducts
                .reduce(
                  (acc, product) => acc + parseFloat(product.totlaPrice),
                  0
                )
                .toFixed(2)}
            </div>
          </div>
        </body>
      </html>
    `);

    printDocument.close();

    printWindow.contentWindow.focus();
    printWindow.contentWindow.print();

    // Cleanup: Remove the iframe after printing
    printWindow.parentNode.removeChild(printWindow);
  };

  const editItem = (index) => {
    setSelectedProductIndex(index);
    setNewAmount(foundProducts[index].amount);
    setShowModalAmount(true);
  };

  const updateAmount = async () => {
    try {
      const updatedProducts = [...foundProducts];
      const product = updatedProducts[selectedProductIndex];

      if (newAmount === 0) {
        deleteProduct();
        setShowModalAmount(false);
        return;
      }

      product.amount = newAmount;
      product.totlaPrice = parseFloat(product.priceForOne * newAmount).toFixed(
        2
      );

      // Update IndexedDB (cart table)
      const db = await openDB();
      const transaction = db.transaction("cart", "readwrite");
      const store = transaction.objectStore("cart");
      await store.put({
        sku: product.sku,
        selectedAmount: newAmount,
      });

      setFoundProducts(updatedProducts);
      setShowModalAmount(false);
    } catch (error) {
      console.error("Error updating amount:", error);
      openPopup(
        "שגיאה בעדכון כמות",
        "התרחשה שגיאה בעדכון הכמות, אנא נסה שוב במועד מאוחר יותר"
      );
    }
  };

  const confirmDelete = (index) => {
    setSelectedProductIndex(index);
    setShowModal(true);
  };

  const deleteProduct = async () => {
    try {
      const updatedProducts = foundProducts.filter(
        (_, i) => i !== selectedProductIndex
      );
      const deletedProduct = foundProducts[selectedProductIndex];

      const db = await openDB();
      const transaction = db.transaction("cart", "readwrite");
      const store = transaction.objectStore("cart");
      await store.delete(deletedProduct.sku);

      setFoundProducts(updatedProducts);
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting product:", error);
      openPopup(
        "שגיאה במחיקת מוצר",
        "התרחשה שגיאה בעת מחיקת המוצר, אנא נסה שוב במועד מאוחר יותר"
      );
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const closeModalAmount = () => {
    setShowModalAmount(false);
  };

  const confirmOrder = () => {
    navigate("/Customer-Details", {
      state: { foundProducts, totalOrderPrice },
    });
  };

  const totalOrderPrice = foundProducts.reduce(
    (acc, product) => acc + parseFloat(product.totlaPrice),
    0
  );

  if (foundProducts.length === 0) {
    return (
      <div>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          {/* Cart Icon */}
          <img
            src="/images/cart-empty-icon.png" // Path to your image
            alt="Cart is empty"
            className="w-86 h-64" // Increased size for the image
          />
          {/* Message */}
          <p className="text-xl text-gray-700 font-semibold">!העגלה ריקה</p>
        </div>
        <div className="w-full mt-auto flex-none">
          <Footer></Footer>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="relative">
        <button
          type="button"
          className="bg-blue-500 text-white py-2 px-4 rounded-lg top-4 absolute left-4 z-10"
          onClick={printPDF}
        >
          <FontAwesomeIcon icon={faPrint} className="h-5 w-5 mr-2" />
          הדפס
        </button>
        <div ref={printRef}>
          <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              פרטי הזמנה
            </h1>
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
                    <p className="text-gray-600">כמות: {product.amount}</p>
                    <p className="text-gray-600">
                      מחיר ליחידה: ₪{product.priceForOne}
                    </p>
                    <p className="font-semibold text-gray-800">
                      סה"כ: ₪{parseFloat(product.totlaPrice).toFixed(2)}
                    </p>
                    <button
                      className="px-4 py-2 bg-green-900 text-white rounded-xl hover:bg-green-600 transition mt-4"
                      type="button"
                      onClick={() => editItem(index)}
                    >
                      ערוך
                    </button>
                  </div>
                  <div className="w-1/6 text-right">
                    <button
                      className="text-white"
                      type="button"
                      onClick={() => confirmDelete(index)}
                      title="מחק מוצר"
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="h-5 w-5 mt-20"
                        style={{ color: "black" }}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-700">
              סה"כ לתשלום: ₪
              {foundProducts
                .reduce(
                  (acc, product) => acc + parseFloat(product.totlaPrice),
                  0
                )
                .toFixed(2)}
            </h2>
          </div>
          <button
            type="button"
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl shadow-md hover:bg-green-600 transition duration-300 ease-in-out ml-4 mt-6"
            onClick={confirmOrder}
          >
            אישור הזמנה
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              האם אתה בטוח שברצונך למחוק את המוצר הזה?
            </h2>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                onClick={closeModal}
              >
                לא
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={deleteProduct}
              >
                כן
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalAmount && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              עדכן את כמות המוצר
            </h2>
            <input
              type="number"
              value={newAmount}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (
                  value <= foundProducts[selectedProductIndex].amountInInventory
                ) {
                  setNewAmount(value);
                } else {
                  setNewAmount(
                    foundProducts[selectedProductIndex].amountInInventory
                  ); // Set to max if exceeded
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              min={0}
              max={foundProducts[selectedProductIndex]?.amountInInventory || 0}
            />

            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                onClick={closeModalAmount}
              >
                ביטול
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                onClick={updateAmount}
              >
                עדכן
              </button>
            </div>
          </div>
        </div>
      )}

      <Popup isOpen={isPopupOpen} onClose={closePopup}>
        <h1 className="text-2xl font-bold my-auto">{popupContent.title}</h1>
        <p className="my-auto">{popupContent.message}</p>
        <button
          className="my-auto bg-green-500 rounded-lg hover:bg-green-800"
          onClick={closePopup}
        >
          סגור
        </button>
      </Popup>
    </div>
  );
};

export default ViewOrderDetails;
