import React, { createContext, useContext, useState } from "react";

const TrashBinContext = createContext();

export const TrashBinProvider = ({ children }) => {
  const [trashItems, setTrashItems] = useState([]);

  const addToTrash = (item) => {
    setTrashItems((prev) => [
      ...prev,
      {
        ...item,
        deletedAt: new Date().toLocaleString(),
        id: Date.now(), // unique id
      },
    ]);
  };

  const restoreFromTrash = (id) => {
    setTrashItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <TrashBinContext.Provider
      value={{ trashItems, addToTrash, restoreFromTrash }}
    >
      {children}
    </TrashBinContext.Provider>
  );
};

export const useTrashBin = () => useContext(TrashBinContext);
