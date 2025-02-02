import { AppContext } from "../AppContext";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { useContext, useState, useEffect } from "react";

function ErrorModal({ isImported }) {
  const { errors, skippedRows, resetState } = useContext(AppContext);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    if (skippedRows || errors) {
      setShowModal(true);
    }
  }, [skippedRows, errors]);

  const processModalData = () => {
    if (isImported) {
      const processedData = {};
      Object.entries(skippedRows).forEach(([sheetName, data]) => {
        if (data.skippedCount > 0) {
          processedData[sheetName] = {
            rows: data.skippedRows,
            stats: {
              imported: data.importedCount,
              skipped: data.skippedCount,
            },
          };
        }
      });
      return processedData;
    }

    return Object.entries(errors).reduce((acc, [sheetName, rows]) => {
      if (rows.length > 0) {
        acc[sheetName] = {
          rows,
          stats: {
            total: rows.length,
          },
        };
      }
      return acc;
    }, {});
  };

  const modalData = processModalData();

  const [activeSheet, setActiveSheet] = useState(
    Object.keys(modalData)[0] || ""
  );
  if (!showModal || Object.keys(modalData).length === 0) {
    return null;
  }

  const getTotalCount = () => {
    if (isImported) {
      return Object.values(modalData).reduce(
        (sum, sheet) => sum + sheet.stats.skipped,
        0
      );
    }
    return Object.values(modalData).reduce(
      (sum, sheet) => sum + sheet.stats.total,
      0
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {isImported ? "Import Results" : "Validation Errors"}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex space-x-2 p-2">
              {Object.entries(modalData).map(([sheetName, data]) => (
                <button
                  key={sheetName}
                  onClick={() => setActiveSheet(sheetName)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeSheet === sheetName
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {sheetName}
                  <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">
                    {isImported ? data.stats.skipped : data.stats.total}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <motion.div
            className="overflow-y-auto max-h-[55vh] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeSheet && (
              <>
                {isImported && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-700">
                      Successfully imported:{" "}
                      {modalData[activeSheet].stats.imported} rows
                    </p>
                    <p className="text-red-700">
                      Skipped: {modalData[activeSheet].stats.skipped} rows
                    </p>
                  </div>
                )}
                <div className="space-y-4">
                  {modalData[activeSheet].rows.map((row, index) => (
                    <motion.div
                      key={index}
                      className="bg-red-50 rounded-lg p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-start">
                        <AlertCircle
                          className="text-red-600 mt-0.5 mr-3"
                          size={20}
                        />
                        <div>
                          <h3 className="font-medium text-red-800">
                            {row.row === 0
                              ? "Sheet Missing Columns"
                              : `Row ${row.row}`}
                          </h3>
                          <ul className="mt-1 space-y-1">
                            {row.reason?.map((error, errorIndex) => (
                              <li key={errorIndex} className="text-red-600">
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {getTotalCount()}{" "}
                {isImported ? "total rows skipped" : "total errors found"}
              </div>
              <div className="flex space-x-3">
                <button
                  className="px-4 py-2 bg-blue-dark text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  onClick={() => {
                    setShowModal(false);
                    if (isImported) {
                      resetState();
                    }
                  }}
                >
                  {isImported ? "Close" : "Show Excel File"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ErrorModal;
