import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getTrashItems,
  addToTrash as apiAddToTrash,
  deleteFromTrash,
} from "../services/api";

const TrashBinContext = createContext();

export const TrashBinProvider = ({ children }) => {
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load trash items on mount
  useEffect(() => {
    const loadTrashItems = async () => {
      try {
        setLoading(true);
        const response = await getTrashItems();
        setTrashItems(response.data);
      } catch (error) {
        console.error("Error loading trash items:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrashItems();
  }, []);

  const addToTrash = async (item) => {
    try {
      const trashData = {
        item_type: item.type || "other",
        item_id: item.id.toString(),
        item_data: item,
        can_restore: item.canRestore !== false,
      };

      const response = await apiAddToTrash(trashData);
      setTrashItems((prev) => [response.data, ...prev]);
      return response.data;
    } catch (error) {
      console.error("Error adding to trash:", error);
      throw error;
    }
  };

  const restoreFromTrash = async (id) => {
    try {
      await deleteFromTrash(id);
      setTrashItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error restoring from trash:", error);
      throw error;
    }
  };

  const permanentlyDelete = async (id) => {
    try {
      await deleteFromTrash(id);
      setTrashItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error permanently deleting:", error);
      throw error;
    }
  };

  return (
    <TrashBinContext.Provider
      value={{
        trashItems,
        addToTrash,
        restoreFromTrash,
        permanentlyDelete,
        loading,
      }}
    >
      {children}
    </TrashBinContext.Provider>
  );
};

export const useTrashBin = () => useContext(TrashBinContext);
