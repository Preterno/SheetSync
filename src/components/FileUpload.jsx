import { AppContext } from "../AppContext";
import LoadingIcon from "./LoadingIcon";
import { transformData } from "@/tableConfig";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, X } from "lucide-react";
import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function FileUpload() {
  const { sheets, setErrors, setSheets } = useContext(AppContext);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileStatus, setFileStatus] = useState(false);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", uploadedFile);
    const base_url = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(base_url + "api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Hi");
      const formattedData = transformData(response.data, false);
      console.log(formattedData);
      setSheets(formattedData || {});
      const extractedErrors = {};
      Object.keys(response.data).forEach((sheet) => {
        extractedErrors[sheet] = response.data[sheet].errors;
      });
      setErrors(extractedErrors);
      navigate("/contents");
      if (Object.keys(response.data.errors || {}).length > 0) {
        toast.warn("File uploaded with validation errors.");
      } else {
        toast.success("File uploaded successfully!");
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    validateFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    validateFile(file);
  };

  const validateFile = (file) => {
    if (
      file &&
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setUploadedFile(file);
      setFileName(file.name);
      setFileStatus(true);
    } else {
      toast.error("Please select a valid Excel file");
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setFileStatus(false);
    setFileName("");
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex justify-center items-center flex-col gap-8">
      <div
        className={`bg-white rounded-3xl relative shadow-custom-medium p-5 w-[320px] max-w-full h-64 
        flex flex-col items-center justify-center text-center 
        ${!fileStatus ? "cursor-pointer" : ""} 
        hover:shadow-custom-strong transition duration-200 
        ${dragging ? "shadow-custom-strong" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={fileStatus ? undefined : () => fileInputRef.current.click()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence>
          {fileStatus && (
            <motion.div
              className="absolute top-2 right-2 z-10 cursor-pointer"
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx"
          onChange={handleChange}
        />

        <AnimatePresence>
          {!fileStatus ? (
            <motion.div
              className="flex flex-col items-center justify-center h-full"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <CloudUpload
                color="#153969"
                size={64}
                className={`w-16 h-16 ${
                  dragging || isHovered ? "opacity-75" : ""
                }`}
              />
              <h1
                className={`text-[1.35rem] mt-1 font-medium ${
                  dragging || isHovered ? "opacity-75" : ""
                }`}
              >
                Select an Excel File
              </h1>
              <h2
                className={`text-base font-light ${
                  dragging || isHovered ? "opacity-75" : ""
                }`}
              >
                or Drag and Drop
              </h2>
            </motion.div>
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-xl">
                <span className="break-all">
                  {fileName.length < 25
                    ? fileName
                    : fileName.substring(0, 10) +
                      "..." +
                      fileName.substring(fileName.length - 10)}
                </span>{" "}
                selected
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        className={`flex items-center justify-center h-16 px-7 py-4 w-[320px] rounded-2xl text-center shadow-custom-strong transition duration-200 
          ${
            isLoading || !uploadedFile
              ? "bg-blue-dark cursor-not-allowed opacity-75"
              : "bg-blue hover:bg-blue-dark cursor-pointer"
          } 
        `}
        onClick={handleUpload}
        disabled={!uploadedFile || isLoading}
      >
        {!isLoading ? (
          <h1 className="text-2xl text-white">Upload File</h1>
        ) : (
          <LoadingIcon />
        )}
      </button>
    </div>
  );
}

export default FileUpload;
