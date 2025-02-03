# SheetSync

SheetSync is a powerful and intuitive Excel data importer designed to streamline data validation and import processes. With a user-friendly interface, you can effortlessly upload `.xlsx` files, detect errors, preview sheets, and import only the valid records into the database.

## Backend Repository

The backend API for SheetSync is available here: [SheetSync Backend](https://github.com/Preterno/SheetSync-Backend)

## Technologies and Libraries

- **React.js** – Core frontend framework for building the user interface.
- **ShadCN Table** – UI component for rendering and managing tabular data.  
- **React Router DOM** – Enables client-side routing for navigation.
- **Axios** – HTTP client for making API requests. 
- **Toastify** – Provides customizable toast notifications.  
- **Tailwind CSS** – Utility-first CSS framework for styling.

## Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/Preterno/SheetSync.git
cd SheetSync
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file and set the API base URL:

```ini
VITE_API_BASE_URL=http://localhost:5000
```

4. Run the frontend:

```bash
npm run dev
```

## Customizing Validation Rules

To modify validation rules, update the following files:

- **Frontend:** Edit `src/config/tableConfig.js`
- **Backend:** Edit `src/models/Record.js` and `src/config/sheetConfig.js`

## Connect with Me

Feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/aslam8483).
