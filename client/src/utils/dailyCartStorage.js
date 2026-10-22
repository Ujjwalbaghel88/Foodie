const getLocalDateKey = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

export const readDailyCart = (key, fallback) => {
  try {
    const savedDate = localStorage.getItem(`${key}:date`);
    if (savedDate !== getLocalDateKey()) {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}:date`);
      return fallback;
    }

    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

export const writeDailyCart = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(`${key}:date`, getLocalDateKey());
  } catch {
    // Keep the in-memory cart usable if browser storage is unavailable.
  }
};
