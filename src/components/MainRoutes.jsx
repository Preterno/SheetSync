import { AppContext } from "../AppContext";
import DataPreviewComponent from "./DataPreviewComponent";
import ErrorModal from "./ErrorModal";
import FileUpload from "./FileUpload";
import { useContext } from "react";
import { Routes, Route } from "react-router-dom";

function MainRoutes() {
  const { errors, skippedRows, isImported } = useContext(AppContext);
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <FileUpload />
            {isImported && Object.keys(skippedRows).length > 0 && (
              <ErrorModal isImported={true} />
            )}
          </div>
        }
      />
      <Route
        path="/contents"
        element={
          <div>
            <DataPreviewComponent />
            {Object.keys(errors).length > 0 && (
              <ErrorModal isImported={false} />
            )}
          </div>
        }
      />
    </Routes>
  );
}

export default MainRoutes;
