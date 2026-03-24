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
    const res = await fetch("https://ipwho.is/");
    if (!res.ok) {
      throw new Error(`IP lookup failed with status ${res.status}`);
    }

    const data = await res.json();

    if (data?.success && data?.country_code) {
      const code = data.country_code.toUpperCase();
      storeCountry(code);
      return code;
    }
  } catch (err) {
    console.error("IP detection failed:", err);
  }

  return "US";
};

export const getCurrency = async () => {
  const country = await detectCountry();
  return country === "IN" ? "INR" : "USD";
};
