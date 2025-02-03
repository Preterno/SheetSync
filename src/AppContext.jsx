import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [sheets, setSheets] = useState({});
  const [errors, setErrors] = useState({});
  const [skippedRows, setSkippedRows] = useState({});
  const [isImported, setIsImported] = useState(false);

  const resetState = () => {
    setSheets({});
    setErrors({});
    setSkippedRows({});
    setIsImported(false);
  };

  return (
    <AppContext.Provider
      value={{
        sheets,
        errors,
        skippedRows,
        isImported,
        resetState,
        setSheets,
        setErrors,
        setSkippedRows,
        setIsImported,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
