import { locationAPI } from "@/lib/api";

const COUNTRY_STORAGE_KEY = "detectedCountry";

const getStoredCountry = () => {
  try {
    const stored = localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (stored) {
      const code = stored.toUpperCase();
      if (/^[A-Z]{2}$/.test(code)) {
        return code;
      }
    }
  } catch (error) {
    console.warn("Unable to read detected country:", error);
  }
  return null;
};

const storeCountry = (code) => {
  try {
    localStorage.setItem(COUNTRY_STORAGE_KEY, code.toUpperCase());
  } catch (error) {
    console.warn("Unable to store detected country:", error);
  }
};

const detectCountry = async () => {
  const cached = getStoredCountry();
  if (cached) return cached;

  try {
    const response = await locationAPI.getCountry();
    const code = response?.data?.country?.toUpperCase();

    if (/^[A-Z]{2}$/.test(code)) {
      storeCountry(code);
      return code;
    }
  } catch (err) {
    console.error("Country detection via backend failed:", err);
  }

  return "US";
};

export const getCurrency = async () => {
  const country = await detectCountry();
  return country === "IN" ? "INR" : "USD";
};
