import { AppProvider } from "./AppContext";
import MainRoutes from "./components/MainRoutes";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="poppins-regular bg-grey">
          <div className="flex justify-center items-center min-h-screen min-w-screen p-10">
            <MainRoutes />
          </div>
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
