import { AppContext } from "../AppContext";
import { columns, validateRow } from "../tableConfig";
import { transformData } from "../tableConfig";
import LoadingIcon from "./LoadingIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { Trash2, Edit2, Check, X } from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const styles = {
  wrapper: "bg-white rounded-lg shadow-sm border border-[#F3F3F3]",
  select:
    "border-[#F3F3F3] text-lg bg-white text-[#242424] hover:border-[#153969]",
  table: "bg-white",
  tableHeader: "bg-[#F3F3F3] text-[#153969] font-medium text-lg",
  tableRow: "border-b border-[#F3F3F3] text-medium text-base",
  button: "text-[#6B6B6B] hover:text-[#153969] hover:bg-[#F3F3F3]",
  primaryButton: "bg-[#153969] text-white hover:bg-[#153969]/90",
  input:
    "md:text-base border-[#F3F3F3] focus:border-[#153969] focus:ring-[#153969]",
  modalButton: "bg-[#153969] text-white hover:bg-[#153969]/90 text-base",
  cancelButton: "border-[#F3F3F3] text-[#6B6B6B] hover:bg-[#F3F3F3] text-base",
};

const EditableCell = ({
  value,
  onChange,
  columnConfig,
  isInvalid,
  rowIndex,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? "");

  const handleSave = () => {
    let processedValue = editValue;
    if (columnConfig.type === "number") {
      processedValue = editValue === "" ? null : Number(editValue);
    }

    onChange(rowIndex, columnConfig.field, processedValue);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditValue(e.target.value);
  };

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value ?? "");
  }, [value]);

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Input
          value={editValue}
          onChange={handleChange}
          className={`h-8 w-full ${styles.input} ${
            isInvalid ? "border-red-500 bg-red-50" : ""
          }`}
          type={columnConfig.type}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          className={styles.button}
        >
          <Check className="h-4 w-4 text-green-500" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setEditValue(value ?? "");
            setIsEditing(false);
          }}
          className={styles.button}
        >
          <X className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span className={`${isInvalid ? "text-red-500" : "text-[#242424]"}`}>
        {value === undefined || value === null
          ? ""
          : columnConfig.format(value)}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className={styles.button}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, rowData }) => {
  if (!isOpen) {
    return;
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#242424] text-lg">
            Confirm Deletion
          </DialogTitle>
          <DialogDescription className="text-[#6B6B6B]">
            Are you sure you want to delete this record?
            <div className="mt-4 p-4 bg-[#F3F3F3] rounded-md">
              {columns.map((column) => (
                <p key={column.key}>
                  <strong>{column.header}:</strong>{" "}
                  {column.format(rowData[column.key])}
                </p>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} className={styles.modalButton}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DataPreviewComponent = () => {
  const { sheets, setSheets, setSkippedRows, setIsImported, resetState } =
    useContext(AppContext);
  const sheetsName = Object.keys(sheets);
  const [selectedSheet, setSelectedSheet] = useState(sheetsName[0]);
  const [tableData, setTableData] = useState(sheets[selectedSheet]);
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [rowErrors, setRowErrors] = useState({});

  useEffect(() => {
    const newErrors = {};
    tableData.forEach((row, index) => {
      const errors = validateRow(row);
      if (errors.length > 0) {
        newErrors[index] = errors;
      }
    });
    setRowErrors(newErrors);
  }, [tableData]);

  const rowsPerPage = 10;

  const handleCellChange = (rowIndex, field, value) => {
    console.log("HandleCellChange Called:", {
      rowIndex,
      field,
      value,
      currentRowData: tableData[rowIndex],
    });

    const newData = [...tableData];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [field]: value,
    };

    console.log("Updated Row Data:", {
      oldRow: tableData[rowIndex],
      newRow: newData[rowIndex],
    });

    const errors = validateRow(newData[rowIndex]);

    setRowErrors((prev) => {
      const newErrors = { ...prev };
      if (errors.length > 0) {
        newErrors[rowIndex] = errors;
      } else {
        delete newErrors[rowIndex];
      }
      return newErrors;
    });

    setTableData(newData);
    setSheets((prevSheets) => {
      const updatedSheets = {
        ...prevSheets,
        [selectedSheet]: newData,
      };
      console.log("Updated Sheets:", {
        selectedSheet,
        newData: updatedSheets[selectedSheet][rowIndex],
      });
      return updatedSheets;
    });
  };

  const handleDeleteClick = (index) => {
    setRowToDelete(index);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setTableData((prevTableData) => {
      const updatedData = prevTableData.filter(
        (_, index) => index !== rowToDelete
      );
      setSheets((prevSheets) => ({
        ...prevSheets,
        [selectedSheet]: updatedData,
      }));
      return updatedData;
    });

    setDeleteModalOpen(false);
    setRowToDelete(null);
  };

  const importData = async () => {
    const base_url = import.meta.env.VITE_API_URL;

    try {
      const transformedSheets = transformData(sheets, true);
      const filteredData =
        Object.keys(transformedSheets).length > 0 ? transformedSheets : {};
      console.log({ data: filteredData });
      const allSheetsEmpty = Object.values(filteredData).every(
        (sheet) => !sheet || sheet.length === 0
      );

      if (allSheetsEmpty) {
        console.log("Sheets are empty:", filteredData);
        toast.error(
          "All sheets are empty or missing some required columns. Redirecting you back to the home page."
        );
        setTimeout(() => {
          navigate("/");
        }, 1000);
        return;
      }

      const response = await axios.post(base_url + "api/import", {
        data: filteredData,
      });
      const results = response.data.results;
      setSkippedRows(results);
      setIsImported(true);

      const hasSkippedRows = Object.values(results).some(
        (sheet) => sheet.skippedCount > 0
      );

      if (hasSkippedRows) {
        navigate("/");
      } else {
        resetState();
        navigate("/");
        toast.success("All rows were added successfully");
      }
    } catch (error) {
      console.error("Import failed", error);
      toast.error("Import failed");
    }
  };

  const pageCount = Math.ceil(tableData.length / rowsPerPage);
  const paginatedData = tableData.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  return (
    <div className="flex flex-col gap-8">
      <div className={`space-y-6 ${styles.wrapper} p-4`}>
        <Select
          onValueChange={(value) => {
            setSelectedSheet(value);
            setTableData(sheets[value]);
            setCurrentPage(0);
          }}
        >
          <SelectTrigger className={styles.select}>
            <SelectValue placeholder="Select a sheet" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(sheets).map((sheet) =>
              sheets[sheet].length > 0 ? (
                <SelectItem key={sheet} value={sheet} className="text-base">
                  {sheet}
                </SelectItem>
              ) : null
            )}
          </SelectContent>
        </Select>

        <Table className={styles.table}>
          <TableHeader>
            <TableRow className={styles.tableHeader}>
              <TableHead className="text-[#153969]">No.</TableHead>
              {columns.map((column) => (
                <TableHead key={column.key} className="text-[#153969]">
                  {column.header}
                </TableHead>
              ))}
              <TableHead className="text-[#153969]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => {
              const rowIndex = currentPage * rowsPerPage + index;
              const hasErrors = rowErrors[rowIndex]?.length > 0;

              return (
                <TableRow
                  key={index}
                  className={`${styles.tableRow} ${
                    hasErrors ? "bg-red-50" : ""
                  }`}
                >
                  <TableCell className="text-[#6B6B6B]">
                    {rowIndex + 1}
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.type === "boolean" ? (
                        <Select
                          value={row[column.key]?.toString()}
                          onValueChange={(value) =>
                            handleCellChange(
                              rowIndex,
                              column.key,
                              value === "true"
                            )
                          }
                        >
                          <SelectTrigger
                            className={`${styles.select} ${
                              rowErrors[rowIndex]?.includes(column.key)
                                ? "border-red-500 bg-red-50"
                                : ""
                            }`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <EditableCell
                          value={row[column.key]}
                          onChange={handleCellChange}
                          columnConfig={{
                            ...column,
                            field: column.key,
                          }}
                          rowIndex={rowIndex}
                          isInvalid={rowErrors[rowIndex]?.includes(column.key)}
                        />
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(rowIndex)}
                      className={styles.button}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between">
          <span className="text-[#6B6B6B] text-base">
            Page {currentPage + 1} of {pageCount}
          </span>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 0}
              className={`${styles.button} border-[#F3F3F3] text-base`}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === pageCount - 1}
              className={`${styles.button} border-[#F3F3F3] text-base`}
            >
              Next
            </Button>
          </div>
        </div>
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          rowData={rowToDelete !== null ? tableData[rowToDelete] : null}
        />
      </div>
      <button
        className={`flex items-center justify-center px-7 py-4 w-[320px] self-center rounded-2xl text-center shadow-custom-strong transition duration-200 
          ${
            isLoading
              ? "bg-[#12335e] cursor-not-allowed opacity-75"
              : "bg-blue-dark hover:bg-[#12335e] cursor-pointer"
          } 
        `}
        onClick={importData}
        disabled={isLoading}
      >
        {!isLoading ? (
          <h1 className="text-xl text-white">Import Excel File</h1>
        ) : (
          <LoadingIcon />
        )}
      </button>
    </div>
  );
};

export default DataPreviewComponent;
