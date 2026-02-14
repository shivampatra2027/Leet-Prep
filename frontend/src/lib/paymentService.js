import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Payment API Service
 * Centralized payment-related API calls
 */

const axiosConfig = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * Create a new payment order
 * @param {number} amount - Amount in paise (e.g., 99900 for ₹999)
 * @param {string} currency - Currency code (default: 'INR')
 * @param {object} notes - Optional metadata
 * @returns {Promise} Order data
 */
export const createPaymentOrder = async (
  amount = 99900,
  currency = "INR",
  notes = {},
) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/api/payment/create-order`,
      { amount, currency, notes },
      axiosConfig,
    );
    return data;
  } catch (error) {
    console.error("Error creating payment order:", error);
    throw error;
  }
};

/**
 * Verify payment signature
 * @param {string} razorpay_order_id - Razorpay order ID
 * @param {string} razorpay_payment_id - Razorpay payment ID
 * @param {string} razorpay_signature - Payment signature
 * @returns {Promise} Verification result
 */
export const verifyPayment = async (
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/api/payment/verify`,
      { razorpay_order_id, razorpay_payment_id, razorpay_signature },
      axiosConfig,
    );
    return data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};

/**
 * Get payment status by order ID
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise} Payment status
 */
export const getPaymentStatus = async (orderId) => {
  try {
    const { data } = await axios.get(
      `${API_URL}/api/payment/status/${orderId}`,
      axiosConfig,
    );
    return data;
  } catch (error) {
    console.error("Error fetching payment status:", error);
    throw error;
  }
};

/**
 * Request a refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Optional partial refund amount in paise
 * @param {string} notes - Optional refund notes
 * @returns {Promise} Refund result
 */
export const requestRefund = async (paymentId, amount = null, notes = "") => {
  try {
    const { data } = await axios.post(
      `${API_URL}/api/payment/refund`,
      { paymentId, amount, notes },
      axiosConfig,
    );
    return data;
  } catch (error) {
    console.error("Error requesting refund:", error);
    throw error;
  }
};

/**
 * Get payment history
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} status - Optional status filter
 * @returns {Promise} Payment history
 */
export const getPaymentHistory = async (page = 1, limit = 10, status = "") => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });

    const { data } = await axios.get(
      `${API_URL}/api/payment/history?${params}`,
      axiosConfig,
    );
    return data;
  } catch (error) {
    console.error("Error fetching payment history:", error);
    throw error;
  }
};

/**
 * Create a subscription
 * @param {string} planId - Razorpay plan ID
 * @param {number} totalCount - Number of billing cycles (default: 12)
 * @param {object} notes - Optional metadata
 * @returns {Promise} Subscription data
 */
export const createSubscription = async (
  planId,
  totalCount = 12,
  notes = {},
) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/api/payment/create-subscription`,
      { planId, totalCount, notes },
      axiosConfig,
    );
    return data;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

/**
 * Cancel subscription
 * @param {boolean} cancelAtCycleEnd - Cancel at end of billing cycle (true) or immediately (false)
 * @returns {Promise} Cancellation result
 */
export const cancelSubscription = async (cancelAtCycleEnd = true) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/api/payment/cancel-subscription`,
      { cancelAtCycleEnd },
      axiosConfig,
    );
    return data;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
};

/**
 * Initialize Razorpay payment
 * @param {object} orderData - Order data from createPaymentOrder
 * @param {object} user - User data for prefill
 * @param {function} onSuccess - Success callback
 * @param {function} onFailure - Failure callback
 */
export const initializeRazorpayPayment = (
  orderData,
  user,
  onSuccess,
  onFailure,
) => {
  if (!window.Razorpay) {
    console.error("Razorpay SDK not loaded");
    onFailure(new Error("Razorpay SDK not loaded"));
    return;
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: orderData.order.amount,
    currency: orderData.order.currency,
    name: "Leet-Prep Premium",
    description: "Upgrade to Premium",
    order_id: orderData.order.id,
    handler: async function (response) {
      try {
        const verificationResult = await verifyPayment(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature,
        );
        onSuccess(verificationResult);
      } catch (error) {
        onFailure(error);
      }
    },
    modal: {
      ondismiss: function () {
        console.log("Payment modal dismissed");
      },
    },
    prefill: {
      email: user?.email || "",
      name: user?.name || "",
    },
    theme: {
      color: "#6366f1",
    },
  };

  const rzp = new window.Razorpay(options);

  rzp.on("payment.failed", function (response) {
    console.error("Payment failed:", response.error);
    onFailure(response.error);
  });

  rzp.open();
};

/**
 * Format amount from paise to rupees
 * @param {number} amount - Amount in paise
 * @returns {string} Formatted amount
 */
export const formatAmount = (amount) => {
  return `₹${(amount / 100).toFixed(2)}`;
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get status badge color
 * @param {string} status - Payment status
 * @returns {string} Tailwind CSS classes
 */
export const getStatusBadgeColor = (status) => {
  switch (status) {
    case "captured":
      return "bg-green-100 text-green-800";
    case "refunded":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "pending":
    case "authorized":
      return "bg-blue-100 text-blue-800";
    case "created":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  requestRefund,
  getPaymentHistory,
  createSubscription,
  cancelSubscription,
  initializeRazorpayPayment,
  formatAmount,
  formatDate,
  getStatusBadgeColor,
};
