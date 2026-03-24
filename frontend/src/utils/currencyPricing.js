const COUNTRY_STORAGE_KEY = "detectedCountry";

const getStoredCountry = () => {
  try {
    const storedCountry = localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (storedCountry) {
      return storedCountry.toUpperCase();
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
    const data = await response.json();
    const countryCode = data?.country_code?.toUpperCase();

    if (countryCode) {
      storeCountry(countryCode);
      return countryCode;
    }
  } catch (error) {
    console.error("Country detection failed:", error);
  }

  // Default country fallback to support USD pricing path.
  storeCountry("US");
  return "US";
};

export const getCurrency = async () => {
  const countryCode = await detectCountry();
  return countryCode === "IN" ? "INR" : "USD";
};
