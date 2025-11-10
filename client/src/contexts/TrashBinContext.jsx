import React, { useState, useEffect, useContext } from "react";
import { TrashBinContext } from "./trashBinContextObject";

export const TrashBinProvider = ({ children }) => {
  const [trashItems, setTrashItems] = useState([]);

  // Load trash items from localStorage on mount
  useEffect(() => {
    const savedTrash = localStorage.getItem("trashBinItems");
    if (savedTrash) {
      try {
        setTrashItems(JSON.parse(savedTrash));
      } catch (error) {
        console.error("Error loading trash items from localStorage:", error);
      }
    }
  }, []);

  // Save trash items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("trashBinItems", JSON.stringify(trashItems));
  }, [trashItems]);

  const addToTrash = (item) => {
    const trashItem = {
      ...item,
      id: item.id || Date.now().toString(),
      deletedAt: new Date().toISOString(),
      type: item.type || "item",
    };
    setTrashItems((prev) => [trashItem, ...prev]);
  };

  const removeFromTrash = (id) => {
    setTrashItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearTrash = () => {
    setTrashItems([]);
  };

  const restoreItem = (id) => {
    // This would typically call an API to restore the item
    // For now, just remove from trash
    removeFromTrash(id);
  };

  const value = {
    trashItems,
    addToTrash,
    removeFromTrash,
    clearTrash,
    restoreItem,
  };

  return (
    <TrashBinContext.Provider value={value}>
      {children}
    </TrashBinContext.Provider>
  );
};

export const useTrashBin = () => {
  const context = useContext(TrashBinContext);
  if (!context) {
    throw new Error("useTrashBin must be used within a TrashBinProvider");
  }
  return context;
};
