/**
 * Calculate time remaining until premium expires
 * @param {string|Date} premiumExpiresAt - The premium expiration date
 * @returns {Object} - Object with display text and status
 */
export const calculatePremiumTimeRemaining = (premiumExpiresAt) => {
  if (!premiumExpiresAt) {
    return {
      display: null,
      isExpired: true,
      days: 0,
      hours: 0,
    };
  }

  const now = new Date();
  const expiryDate = new Date(premiumExpiresAt);
  const diffMs = expiryDate - now;

  // If expired
  if (diffMs <= 0) {
    return {
      display: "Expired",
      isExpired: true,
      days: 0,
      hours: 0,
    };
  }

  // Calculate days and hours
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  // If less than 1 day, show hours only
  if (days < 1) {
    return {
      display: `${hours} ${hours === 1 ? "hour" : "hours"} remaining`,
      isExpired: false,
      days: 0,
      hours: hours,
    };
  }

  // If 1 or more days, show days
  return {
    display: `${days} ${days === 1 ? "day" : "days"} remaining`,
    isExpired: false,
    days: days,
    hours: hours,
  };
};

/**
 * Format the premium expiry date for display
 * @param {string|Date} premiumExpiresAt - The premium expiration date
 * @returns {string} - Formatted date string
 */
export const formatPremiumExpiryDate = (premiumExpiresAt) => {
  if (!premiumExpiresAt) return "N/A";

  return new Date(premiumExpiresAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
