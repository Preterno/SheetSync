export const columns = [
  {
    key: "Name",
    header: "Name",
    type: "text",
    validate: (value) => {
      if (!value || typeof value !== "string" || value.trim() === "") {
        return false;
      }
      return true;
    },
    format: (value) => value,
  },
  {
    key: "Amount",
    header: "Amount",
    type: "number",
    validate: (value) => {
      if (isNaN(value) || value <= 0) {
        return false;
      }
      return true;
    },
    format: (value) =>
      new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value),
  },
  {
    key: "Date",
    header: "Date",
    type: "date",
    validate: (value) => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!value || !dateRegex.test(value)) {
        return false; // Invalid format
      }

      const inputDate = new Date(value);
      if (isNaN(inputDate.getTime())) {
        return false; // Invalid date
      }

      // Check if the input date is in the current month and year
      const currentDate = new Date();
      return (
        inputDate.getMonth() === currentDate.getMonth() &&
        inputDate.getFullYear() === currentDate.getFullYear()
      );
    },
    format: (value) => {
      const date = new Date(value);
      return date
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "-");
    },
  },
  {
    key: "Verified",
    header: "Verified",
    type: "boolean",
    validate: (value) => typeof value === "boolean",
    format: (value) => {
      if (value === null || value === undefined) {
        return "Undefined";
      }
      return value ? "Yes" : "No";
    },
  },
];

export const validateRow = (row) => {
  const errors = [];

  columns.forEach((column) => {
    if (!column.validate(row[column.key])) {
      errors.push(column.key);
    }
  });

  return errors;
};

export const transformData = (data, toApi = false) => {
  const excelSerialToDate = (serial) => {
    if (!serial) return null;
    const excelEpoch = new Date(1899, 11, 31);
    return new Date(excelEpoch.getTime() + serial * 86400000)
      .toISOString()
      .split("T")[0];
  };

  // Helper function to convert date string to Excel serial
  const dateToExcelSerial = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const excelEpoch = new Date(1899, 11, 31);
    const millisecondsPerDay = 86400000;
    return Math.round(
      (date.getTime() - excelEpoch.getTime()) / millisecondsPerDay
    );
  };

  // Helper function to handle verified/boolean values
  const handleVerified = (value, toApi) => {
    if (toApi) {
      return value ? "Yes" : "No";
    } else {
      if (value === "Yes") return true;
      if (value === "No") return false;
      return undefined;
    }
  };

  // Helper function to handle amount values
  const handleAmount = (value, toApi) => {
    if (toApi) {
      return value;
    } else {
      return value === "" ? 0 : Number(value);
    }
  };

  const transformRow = (row, toApi) => ({
    Name: row.Name,
    Amount: handleAmount(row.Amount, toApi),
    Date: toApi ? dateToExcelSerial(row.Date) : excelSerialToDate(row.Date),
    Verified: handleVerified(row.Verified, toApi),
  });

  if (toApi) {
    const transformedData = {};
    Object.keys(data).forEach((sheetName) => {
      const rows = data[sheetName];
      if (rows.length > 0) {
        transformedData[sheetName] = rows.map((row) => transformRow(row, true));
      }
    });
    return transformedData;
  } else {
    const formattedData = {};
    for (const sheet in data) {
      formattedData[sheet] = data[sheet].allRows.map((row) =>
        transformRow(row, false)
      );
    }
    return formattedData;
  }
};
