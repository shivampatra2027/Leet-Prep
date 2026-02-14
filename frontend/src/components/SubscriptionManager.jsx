import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * SubscriptionManager Component
 * Handles subscription creation and cancellation
 */
function SubscriptionManager({ user }) {
    const [loading, setLoading] = useState(false);
    const [subscriptionData, setSubscriptionData] = useState(null);

    useEffect(() => {
        if (user?.subscriptionId) {
            setSubscriptionData({
                id: user.subscriptionId,
                status: user.subscriptionStatus,
                startDate: user.subscriptionStartDate,
                endDate: user.subscriptionEndDate
            });
        }
    }, [user]);

    const handleCreateSubscription = async (planId) => {
        try {
            setLoading(true);

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/payment/create-subscription`,
                {
                    planId: planId, // You need to create plans in Razorpay dashboard first
                    totalCount: 12, // 12 billing cycles (1 year if monthly)
                    notes: {
                        plan_type: 'monthly_premium'
                    }
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (data.success) {
                // Redirect to Razorpay subscription page
                window.location.href = data.subscription.shortUrl;
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Failed to create subscription. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async (cancelImmediate = false) => {
        try {
            const confirmed = window.confirm(
                cancelImmediate
                    ? 'Are you sure you want to cancel your subscription immediately? You will lose premium access.'
                    : 'Cancel subscription at the end of current billing cycle?'
            );

            if (!confirmed) return;

            setLoading(true);

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/payment/cancel-subscription`,
                {
                    cancelAtCycleEnd: !cancelImmediate
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (data.success) {
                alert(data.message);
                window.location.reload();
            }
        } catch (error) {
            console.error('Cancel subscription error:', error);
            alert('Failed to cancel subscription. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'text-green-600 bg-green-100';
            case 'paused':
                return 'text-yellow-600 bg-yellow-100';
            case 'cancelled':
            case 'expired':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    // If user has no subscription
    if (!subscriptionData || subscriptionData.status === 'none' || subscriptionData.status === 'cancelled') {
        return (
            <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Subscription</h2>
                <p className="text-gray-600 mb-6">
                    Subscribe to premium and get unlimited access to all features with automatic monthly renewal.
                </p>

                <div className="space-y-4">
                    {/* Monthly Plan */}
                    <div className="border-2 border-indigo-600 rounded-lg p-6 bg-indigo-50">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Monthly Premium</h3>
                                <p className="text-gray-600 text-sm mt-1">Cancel anytime</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-indigo-600">₹999</div>
                                <div className="text-sm text-gray-500">per month</div>
                            </div>
                        </div>

                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Unlimited problem access
                            </li>
                            <li className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Advanced analytics
                            </li>
                            <li className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Priority support
                            </li>
                        </ul>

                        <button
                            onClick={() => handleCreateSubscription('plan_YOUR_PLAN_ID')}
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Processing...' : 'Subscribe Now'}
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Recurring monthly charge. Cancel anytime.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // If user has active subscription
    return (
        <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Subscription</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${getStatusColor(subscriptionData.status)}`}>
                    {subscriptionData.status}
                </span>
            </div>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Subscription ID:</span>
                    <span className="font-mono text-sm text-gray-900">{subscriptionData.id}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="text-gray-900">{formatDate(subscriptionData.startDate)}</span>
                </div>
                {subscriptionData.endDate && (
                    <div className="flex justify-between py-3 border-b">
                        <span className="text-gray-600">End Date:</span>
                        <span className="text-gray-900">{formatDate(subscriptionData.endDate)}</span>
                    </div>
                )}
                <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Premium Expires:</span>
                    <span className="text-gray-900">{formatDate(user?.premiumExpiresAt)}</span>
                </div>
            </div>

            {subscriptionData.status === 'active' && (
                <div className="space-y-3">
                    <button
                        onClick={() => handleCancelSubscription(false)}
                        disabled={loading}
                        className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Cancel at End of Billing Cycle
                    </button>
                    <button
                        onClick={() => handleCancelSubscription(true)}
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Cancel Immediately
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                        Cancelling will downgrade your account to free tier
                    </p>
                </div>
            )}
        </div>
    );
}

export default SubscriptionManager;
