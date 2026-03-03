import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../Helper/axiosInstance';

const Payment = () => {
    const location = useLocation();
    const { orderData } = location.state || {};
    const navigate = useNavigate();
    const rzpInstanceRef = useRef(null); // Using ref to persist the instance

    useEffect(() => {
        // Check if orderData exists and has required properties
        if (!orderData || !orderData.orderId) {
            
            navigate('/');
            return;
        }

        const loadRazorpayScript = () => {
            return new Promise((resolve) => {
                if (window.Razorpay) {
                    resolve(true);
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => {
                    console.log('Razorpay SDK loaded successfully');
                    resolve(true);
                };
                script.onerror = () => {
                    console.error('Failed to load Razorpay SDK');
                    resolve(false);
                };
                document.body.appendChild(script);
            });
        };

        const displayRazorpay = async () => {
            try {
                const res = await loadRazorpayScript();
                if (!res) {
                    alert('Razorpay SDK failed to load. Are you online?');
                    return;
                }

                const options = {
                    key: 'rzp_test_jzJYbDuU9u8Jnh',
                    amount: orderData.amount,
                    currency: orderData.currency || 'INR',
                    name: 'Appointment Booking',
                    description: 'Service Appointment',
                    order_id: orderData.orderId,
                    handler: async function (response) {
                        try {
                            const result = await axiosInstance.post('/appointment/verify', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            const res = result.data;

                            if (res?.success) {
                                // Close the Razorpay modal explicitly
                                if (rzpInstanceRef.current) {
                                    rzpInstanceRef.current.close();
                                }
                                navigate(`/confirmation/${res?.appointment?._id}`);
                                return
                            } else {
                                alert('Payment verification failed');
                            }
                        } catch (error) {
                            console.error('Verification error:', error);
                            alert('Payment verification error. Please contact support.');
                        }
                    },
                    prefill: {
                        name: orderData.customerName || '',
                        email: orderData.customerEmail || '',
                        contact: orderData.customerPhone || ''
                    },
                    theme: {
                        color: '#3399c1'
                    },
                    modal: {
                        ondismiss: function () {
                            alert('Payment was not completed');
                            navigate('/');
                        }
                    }
                };

                rzpInstanceRef.current = new window.Razorpay(options);
                rzpInstanceRef.current.open();

            } catch (error) {
                console.error('Payment processing error:', error);
                alert('Error processing payment. Please try again.');
                navigate('/');
            }
        };

        displayRazorpay();

        // Cleanup function to close modal if component unmounts
        return () => {
            if (rzpInstanceRef.current) {
                rzpInstanceRef.current.close();
            }
        };

    }, [orderData, navigate]);

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>Redirecting to Razorpay Payment Gateway...</h2>
            <p>Please wait while we prepare your secure payment.</p>
            {!orderData && (
                <p style={{ color: 'red' }}>Error: Payment information not loaded</p>
            )}
        </div>
    );
};

export default Payment;