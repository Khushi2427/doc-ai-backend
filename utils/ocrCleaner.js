export function cleanNumber(value = "") {
    return (
      parseFloat(
        value
          .toString()
          .toLowerCase()
          .replace(/[oq]/g, "0")
          .replace(/[^\d.]/g, "")
      ) || 0
    );
  }
  