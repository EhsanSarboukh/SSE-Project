import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css"; // Import your CSS for styling
import Popup from "./Popup";
import Loading from "./Loading";
import Footer from "../pages/footer";
import NewFooter from "../pages/newFooter";
import Header from "../pages/header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWrench,
  faTrash,
  faPlus,
  faArrowLeft,
  faArrowRight,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

function Inventory() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false); // New loading state to prevent multiple submissions
  const [items, setItems] = useState([]); // Use items from location.state if available
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("name");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    sku: "",
    name: "",
    status: "",
    amount: "",
    image: null,
    expirationDate: "",
    price: "",
  });

  const [currentItem, setCurrentItem] = useState({
    sku: "",
    name: "",
    status: "",
    amount: "",
    image: null,
    expirationDate: "",
    price: "",
  });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [popupContent, setPopupContent] = useState({ title: "", message: "" });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [sortDirection, setSortDirection] = useState("asc");
  const [isVisible, setIsVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 15;

  // Update the openDB function to use OrderDB instead of InventoryDB
  const openDB = async () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("OrderDB", 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("items")) {
          db.createObjectStore("items", { keyPath: "sku" }); // Store items by SKU
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

  const getAllItemsFromDB = async () => {
    const db = await openDB();
    const transaction = db.transaction("items", "readonly");
    const store = transaction.objectStore("items");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (event) => reject(event.target.error);
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAndStoreItems = async () => {
      try {
        // Check for items in IndexedDB
        const storedItems = await getAllItemsFromDB();
        if (storedItems.length > 0) {
          const transformedItems = storedItems.map((item) => ({
            ...item,
            image: item.imageBlob
              ? URL.createObjectURL(item.imageBlob) // Convert blob to ObjectURL
              : item.image ||
                `${process.env.PUBLIC_URL}/images/placeholder.png`, // Fallback to placeholder
          }));
          setItems(transformedItems);
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
    };

    fetchAndStoreItems();
  }, []);

  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.image) {
          URL.revokeObjectURL(item.image);
        }
      });
    };
  }, [items]);

  // Filter items based on search query
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort filtered items based on sort order
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

  // Function to handle search query changes
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const openPopup = (title, message) => {
    setPopupContent({ title, message });
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  // Open modal with animation
  const openModal = (item) => {
    setCurrentItem({ ...item });
    setShowModal(true);
    setIsVisible(true); // Apply fade-in class immediately
  };

  // Close modal with fade-out effect
  const closeModal = () => {
    setIsVisible(false); // Trigger fade-out animation
    setTimeout(() => setShowModal(false), 50); // Wait for animation to finish
  };

  // Open delete modal with animation
  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
    setIsDeleteVisible(true); // Apply fade-in class immediately
  };

  // Close delete modal with fade-out effect
  const closeDeleteModal = () => {
    setIsDeleteVisible(false); // Trigger fade-out animation
    setTimeout(() => setShowDeleteModal(false), 50); // Wait for animation to finish
  };

  // Open add modal with animation
  const openAddModal = () => {
    setNewItem({ name: "", amount: "", image: null }); // Reset form fields
    setShowAddModal(true);
    setIsAddVisible(true); // Apply fade-in class immediately
  };

  // Close add modal with fade-out effect
  const closeAddModal = () => {
    setIsAddVisible(false); // Trigger fade-out animation
    setTimeout(() => setShowAddModal(false), 50); // Wait for animation to finish
  };

  // Handle input changes for new item
  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload for new item
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    // Check if the file exists and is of type JPEG or PNG
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onload = () => {
        // Set the image data as a base64-encoded string
        setNewItem((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file); // Convert image to base64 format
    } else {
      openPopup("שגיאה", "JPEG או PNG אנא העלה תמונה בפורמט");
      setNewItem((prev) => ({ ...prev, image: null }));
    }
  };

  const isFormValid =
    newItem.name &&
    newItem.amount &&
    newItem.image &&
    newItem.expirationDate &&
    newItem.price;

  const handleAddItem = async () => {
    if (loading) return;

    const existingItem = items.find((item) => item.sku === newItem.sku);
    if (existingItem) {
      openPopup("שגיאה", "מוצר עם מקט זה כבר קיים במלאי");
      return; // Exit the function if the item already exists
    }

    setLoading(true);

    try {
      let imageFile;

      if (newItem.image && typeof newItem.image === "string") {
        const base64ToBlob = (base64String, contentType = "") => {
          const byteCharacters = atob(base64String.split(",")[1]);
          const byteArrays = [];
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          return new Blob(byteArrays, { type: contentType });
        };

        const blob = base64ToBlob(newItem.image, "image/jpeg");
        imageFile = new File([blob], `${newItem.name}.jpg`, {
          type: "image/jpeg",
        });
      } else {
        openPopup("שגיאה", "אין תמונה זמינה");
        return;
      }

      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("sku", newItem.sku);
      formData.append("amount", newItem.amount);
      formData.append(
        "status",
        newItem.amount > 0 ? "available" : "not available"
      );
      formData.append("expirationDate", newItem.expirationDate);
      formData.append("price", newItem.price);
      formData.append("image", imageFile);

      const response = await fetch(
        "http://localhost:5000/productRoutes/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const newItemWithId = {
          ...newItem,
          sku: parseInt(newItem.sku),
          amount: parseInt(newItem.amount),
          price: parseFloat(newItem.price),
        };

        // Save the item to IndexedDB
        await saveItemToDB(newItemWithId);

        setItems((prevItems) => [...prevItems, newItemWithId]);
        openPopup("הצלחה", "מוצר נוסף בהצלחה");
        setShowAddModal(false); // Close the modal
      } else {
        openPopup("שגיאה", "התרחשה שגיאה בעת שמירת מוצר");
      }
    } catch (error) {
      console.error("Error while saving item:", error);
      openPopup("שגיאה", "הייתה בעיה בשמירת המוצר");
    } finally {
      setLoading(false);
    }
  };

  // Modal Animation
  useEffect(() => {
    const modalElement = document.querySelector(".modal");
    if (showModal || showDeleteModal) {
      if (modalElement) {
        // Force a repaint before adding the class
        modalElement.style.display = "block"; // Ensure modal is visible
        window.requestAnimationFrame(() => {
          modalElement.classList.add("fade-in");
        });
      }
    }
    return () => {
      if (modalElement) {
        modalElement.classList.remove("fade-in");
        modalElement.style.display = "none"; // Hide it after transition
      }
    };
  }, [showModal, showDeleteModal]);

  // Sorting Functionality
  const handleSort = (e) => {
    const order = e.target.value;
    setSortOrder(order);
    const sortedItems = [...items].sort((a, b) => {
      if (order === "name") {
        return a.name.localeCompare(b.name);
      } else if (order === "amount") {
        return a.amount - b.amount;
      }
      return 0;
    });
    setItems(sortedItems);
  };

  const handleSortDirection = (e) => {
    setSortDirection(e.target.value); // Update sort direction (asc or desc)
  };

  // Pagination Control
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedItems = sortedFilteredItems.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const goToPage = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({ ...currentItem, [name]: value });
  };

  const handleSave = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const updatedItem = {
        ...currentItem,
        amount: parseInt(currentItem.amount),
        price: parseFloat(currentItem.price),
      };

      const response = await fetch(
        "http://localhost:5000/productRoutes/update",
        {
          method: "PUT",
          body: JSON.stringify(updatedItem),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Update state
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.sku === currentItem.sku ? updatedItem : item
          )
        );

        // Update IndexedDB
        await saveItemToDB(updatedItem);

        setShowModal(false); // Close the modal
      } else {
        console.error("Error updating item:", await response.json());
      }
    } catch (error) {
      console.error("Failed to update item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/productRoutes/delete?sku=${itemToDelete.sku}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Remove the item from state
        setItems((prevItems) =>
          prevItems.filter((item) => item.sku !== itemToDelete.sku)
        );

        // Remove the item from IndexedDB
        const db = await openDB();
        const transaction = db.transaction("items", "readwrite");
        const store = transaction.objectStore("items");
        store.delete(itemToDelete.sku);
        await transaction.complete;

        setShowDeleteModal(false); // Close the delete modal
      } else {
        console.error("Failed to delete item:", await response.json());
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setLoading(false);
    }
  };

  function formatDate(dateString) {
    const date = new Date(dateString); // Parse the date string
    const day = String(date.getDate()).padStart(2, "0"); // Get day and pad if necessary
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month (months are zero-based)
    const year = date.getFullYear(); // Get the year

    return `${day}-${month}-${year}`; // Format as DD-MM-YYYY
  }

  function reverseFormatDate(dateString) {
    const date = new Date(dateString); // Parse the date string
    const day = String(date.getDate()).padStart(2, "0"); // Get day and pad if necessary
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month (months are zero-based)
    const year = date.getFullYear(); // Get the year

    return `${year}-${month}-${day}`; // Format as DD-MM-YYYY
  }

  return (
    <div>
      <div className="App min-h-screen bg-green-50 flex flex-col">
        <div className="w-full">
          <Header></Header>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-4">
          {/* Controls Container */}
          <div className="controls-container flex flex-col md:flex-row md:items-center gap-2">
            <div className="label-select-container flex items-center gap-2">
              <label className="custom-label">:מיין לפי</label>
              <select
                className="custom-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="name">שם</option>
                <option value="amount">כמות</option>
              </select>
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

          {/* Add Button */}
          <button
            className="border p-2 hover:bg-green-200 hover:border-gray-400 bg-green-500 rounded-[20px] flex items-center justify-center self-center md:self-auto"
            onClick={openAddModal}
            style={{ fontSize: "1.2rem" }}
          >
            <FontAwesomeIcon icon={faPlus} className="h-[2vh] w-[2vw] mx-1" />
            הוסף פריט
          </button>
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
              <div className="custom-card" key={item.sku}>
                {/* Image Section with Hover Buttons */}
                <div className="relative custom-image-container">
                  <img
                    className="custom-image"
                    src={item.image} // Image is preloaded via IndexedDB
                    alt={item.name}
                  />
                  <div className="absolute top-[0px] right-[0px] gap-[10px] border-none">
                    <span
                      className="modify cursor-pointer mx-1"
                      onClick={() => openModal(item)}
                    >
                      <FontAwesomeIcon
                        icon={faWrench}
                        className="h-6 w-6 mr-2 my-2"
                        style={{ color: "#374558" }}
                        title="ערוך"
                      />
                    </span>
                    <span
                      className="remove cursor-pointer"
                      onClick={() => openDeleteModal(item)}
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="h-6 w-6 mr-2 my-2"
                        style={{ color: "#9a1414" }}
                        title="מחק"
                      />
                    </span>
                  </div>
                </div>

                <h3 className="custom-label custom-title">{item.name}</h3>

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

        {/* Modal for Modifying Item */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="modal fade-in rounded-lg shadow-lg max-w-md w-[90%]">
              <div className="modal-content">
                <h2 className="text-xl font-bold mb-4">ערוך פריט</h2>

                <label>
                  :שם
                  <input
                    className="border rounded-lg text-center"
                    type="text"
                    name="name"
                    value={currentItem?.name || ""}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  :כמות
                  <input
                    className="border rounded-lg text-center"
                    type="number"
                    name="amount"
                    value={currentItem?.amount || ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value >= 0 || e.target.value === "") {
                        setCurrentItem((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }));
                      }
                    }}
                  />
                </label>
                <label>
                  :תוקף
                  <input
                    className="border rounded-lg text-center"
                    type="date"
                    name="expirationDate"
                    value={reverseFormatDate(currentItem?.expirationDate) || ""}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  :מחיר ליחידה
                  <input
                    className="border rounded-lg text-center"
                    type="number"
                    name="price"
                    value={currentItem?.price || ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value >= 0 || e.target.value === "") {
                        setCurrentItem((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }));
                      }
                    }}
                  />
                </label>

                <div className="flex justify-center gap-4 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                    onClick={closeModal}
                  >
                    סגור
                  </button>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? "...שומר" : "שמור"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Deleting Item */}
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="modal fade-in rounded-lg shadow-lg max-w-md w-[90%]">
              <div className="modal-content">
                <h2 dir="rtl" className="text-xl font-bold">
                  האם להסיר את{" "}
                  <span className="font-bold">{itemToDelete?.name}</span>?
                </h2>
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                    onClick={closeDeleteModal}
                  >
                    לא
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    onClick={handleRemove}
                    disabled={loading}
                  >
                    {loading ? "...מוחק" : "כן"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Modal  WORKING HERE*/}
        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="modal fade-in rounded-lg shadow-lg max-w-md w-[90%]">
              <div className="modal-content">
                <h2 className="text-xl font-bold mb-4">הוסף פריט חדש</h2>

                <label>
                  :מק"ט
                  <input
                    className="border rounded-lg text-center"
                    type="number"
                    name="sku"
                    value={newItem.sku}
                    onChange={handleNewItemChange}
                  />
                </label>
                <label>
                  :שם
                  <input
                    className="border rounded-lg text-center"
                    type="text"
                    name="name"
                    value={newItem.name}
                    onChange={handleNewItemChange}
                  />
                </label>
                <label>
                  :כמות
                  <input
                    className="border rounded-lg text-center"
                    type="number"
                    name="amount"
                    value={newItem.amount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value >= 0 || e.target.value === "") {
                        setNewItem((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }));
                      }
                    }}
                  />
                </label>
                <label>
                  :תוקף
                  <input
                    className="border rounded-lg text-center"
                    type="date"
                    name="expirationDate"
                    value={newItem.expirationDate}
                    onChange={handleNewItemChange}
                  />
                </label>
                <label>
                  :מחיר ליחידה
                  <input
                    className="border rounded-lg text-center"
                    type="number"
                    name="price"
                    value={newItem.price}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value >= 0 || e.target.value === "") {
                        setNewItem((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }));
                      }
                    }}
                  />
                </label>
                <label>
                  :תמונה
                  <input
                    className="border rounded-lg"
                    type="file"
                    accept=".jpeg,.jpg,.png"
                    onChange={handleImageUpload}
                  />
                </label>

                <div className="flex justify-end gap-4 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                    onClick={closeAddModal}
                  >
                    סגור
                  </button>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    onClick={handleAddItem}
                    disabled={!isFormValid || loading}
                  >
                    {loading ? "...מוסיף" : "הוסף"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Popup */}
        <Popup isOpen={isPopupOpen} onClose={closePopup}>
          <h1 className="text-3xl font-bold my-auto items-center">
            <FontAwesomeIcon className="mx-2" icon={faCircleXmark} />
            {popupContent.title}
          </h1>

          <br />
          <p className="my-auto text-lg">{popupContent.message}</p>
          <br />
          <button
            className="my-auto bg-green-500 rounded-lg hover:bg-green-800"
            onClick={closePopup}
          >
            סגור
          </button>
        </Popup>
      </div>
      <div className="w-full mt-auto flex-none">
        <Footer></Footer>
      </div>
    </div>
  );
}

export default Inventory;
