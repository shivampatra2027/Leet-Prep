const COUNTRY_STORAGE_KEY = "detectedCountry";

const getStoredCountry = () => {
  try {
    const storedCountry = localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (storedCountry) {
      const normalizedCountry = storedCountry.toUpperCase();
      if (/^[A-Z]{2}$/.test(normalizedCountry)) {
        return normalizedCountry;
      }

      localStorage.removeItem(COUNTRY_STORAGE_KEY);
    }
  } catch (error) {
    console.warn("Unable to read country from localStorage:", error);
  }

  return null;
};

const storeCountry = (countryCode) => {
  try {
    localStorage.setItem(COUNTRY_STORAGE_KEY, countryCode.toUpperCase());
  } catch (error) {
    console.warn("Unable to store country in localStorage:", error);
  }
};

const detectCountry = async () => {
  const cachedCountry = getStoredCountry();
  if (cachedCountry) {
    return cachedCountry;
  }

  try {
    const response = await fetch("https://ipwho.is/");
    if (!response.ok) {
      throw new Error(`IP lookup failed with status ${response.status}`);
    }

    const data = await response.json();
    if (data?.success === false) {
      throw new Error(data?.message || "IP lookup failed");
    }

    const countryCode = data?.country_code?.toUpperCase();

    if (/^[A-Z]{2}$/.test(countryCode)) {
      storeCountry(countryCode);
      return countryCode;
    }
  } catch (error) {
    console.error("Country detection failed:", error);
  }

  // Fallback to USD path without caching so next visit can retry detection.
  return "US";
};

export const getCurrency = async () => {
  const countryCode = await detectCountry();
  return countryCode === "IN" ? "INR" : "USD";
};
