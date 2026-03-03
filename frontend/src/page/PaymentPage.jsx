import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, ShieldCheck, CheckCircle, AlertCircle} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAppointment } from '../Redux/appointment';
import { getAllHospital } from '../Redux/hospitalSlice';
import { getAllDoctors } from '../Redux/doctorSlice';
import Layout from '../components/Layout/Layout';


const PaymentPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { appointmentId } = useParams();
    const hospitals = useSelector((state) => state?.hospitals?.hospitals);
    const { doctors } = useSelector((state) => state?.doctors);
    const appointments = useSelector((state) => state.appointment?.appointment);
    // console.log("Hospitals data (Redux):", hospitals);
    // console.log("Doctors data (Redux):", doctors);
    // console.log("Appointments data (Redux):", appointments);
    const appointment = appointments?.find(a => a._id === appointmentId);
    //  console.log("Appointmentss data (Redux):", appointment);
    // console.log("sasd", appointment?.hospitalId)
    const doctor = appointment ? doctors.find(d => d._id === appointment?.doctorId?._id) : null;
    // console.log("Doctor data (Redux):", doctor);
    const hospital = appointment ? hospitals.find(h => h._id === appointment?.hospitalId) : null;
    //  console.log("Hospital data (Redux):", hospital);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    //   if (!appointment || !doctor || !hospital) {
    //     return (
    //       <div className="container mx-auto px-4 py-16 text-center">
    //         <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment not found</h2>
    //         <button
    //           onClick={() => navigate('/')}
    //           className="text-blue-600 hover:text-blue-800 font-medium"
    //         >
    //           Back to Home
    //         </button>
    //       </div>
    //     );
    //   }

      const handlePayment = (e) => {
        e.preventDefault();
        setPaymentError(null);
         
        // Validate payment details
        if (paymentMethod === 'upi' && !upiId) {
          setPaymentError('Please enter a valid UPI ID');
          return;
        }

        if (paymentMethod === 'card') {
          if (!cardNumber || cardNumber.length < 16) {
            setPaymentError('Please enter a valid card number');
            return;
          }
          if (!cardName) {
            setPaymentError('Please enter the name on card');
            return;
          }
          if (!cardExpiry || !cardExpiry.includes('/')) {
            setPaymentError('Please enter a valid expiry date (MM/YY)');
            return;
          }
          if (!cardCvv || cardCvv.length < 3) {
            setPaymentError('Please enter a valid CVV');
            return;
          }
        }

        // Process payment
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
          setIsProcessing(false);
          navigate(`/confirmation/${appointmentId}`);
        }, 2000);
      };

    useEffect(() => {
        (
            async () => {
                await dispatch(getAllAppointment())
                await dispatch(getAllHospital())
                await dispatch(getAllDoctors())
            }
        )()
    }, [])

    return (
        <Layout>
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8 text-gray-800">Payment</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Payment Methods */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Payment Method</h2>

                        <div className="space-y-4">
                            {/* UPI */}
                            <div
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}
                                onClick={() => setPaymentMethod('upi')}
                            >
                                <div className="flex items-center">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'upi' ? 'border-blue-600' : 'border-gray-400'}`}>
                                        {paymentMethod === 'upi' && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                                    </div>
                                    <span className="ml-3 font-medium text-gray-800">UPI</span>
                                </div>

                                {paymentMethod === 'upi' && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            UPI ID
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="username@upi"
                                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                        />
                                        <div className="flex items-center mt-4">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-6 mr-2" />
                                            <img src="https://1000logos.net/wp-content/uploads/2021/03/Paytm_Logo.png" alt="Paytm" className="h-6 mr-2" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" alt="Google Pay" className="h-6 mr-2" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/1200px-PhonePe_Logo.svg.png" alt="PhonePe" className="h-6" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Credit/Debit Card */}
                            <div
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}
                                onClick={() => setPaymentMethod('card')}
                            >
                                <div className="flex items-center">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-blue-600' : 'border-gray-400'}`}>
                                        {paymentMethod === 'card' && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                                    </div>
                                    <span className="ml-3 font-medium text-gray-800">Credit / Debit Card</span>
                                </div>

                                {paymentMethod === 'card' && (
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Card Number
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="1234 5678 9012 3456"
                                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Name on Card
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={cardName}
                                                onChange={(e) => setCardName(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Expiry Date
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={cardExpiry}
                                                    onChange={(e) => setCardExpiry(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    CVV
                                                </label>
                                                <input
                                                    type="password"
                                                    placeholder="123"
                                                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    value={cardCvv}
                                                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Netbanking */}
                            <div
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'netbanking' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}
                                onClick={() => setPaymentMethod('netbanking')}
                            >
                                <div className="flex items-center">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'netbanking' ? 'border-blue-600' : 'border-gray-400'}`}>
                                        {paymentMethod === 'netbanking' && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                                    </div>
                                    <span className="ml-3 font-medium text-gray-800">Net Banking</span>
                                </div>

                                {paymentMethod === 'netbanking' && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Bank
                                        </label>
                                        <select className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option value="">Select your bank</option>
                                            <option value="sbi">State Bank of India</option>
                                            <option value="hdfc">HDFC Bank</option>
                                            <option value="icici">ICICI Bank</option>
                                            <option value="axis">Axis Bank</option>
                                            <option value="kotak">Kotak Mahindra Bank</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Error */}
                        {paymentError && (
                            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                                <p>{paymentError}</p>
                            </div>
                        )}

                        {/* Security Note */}
                        <div className="mt-6 p-3 bg-gray-50 rounded-md flex items-center">
                            <ShieldCheck className="h-5 w-5 text-gray-500 mr-2" />
                            <p className="text-sm text-gray-600">
                                Your payment information is encrypted and secure. We do not store your card details.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                 <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Appointment Summary</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <img
                  src={doctor?.photo}
                  alt={doctor?.name}
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
                <div>
                  <h3 className="font-medium text-gray-800">{doctor?.name}</h3>
                  <p className="text-gray-600 text-sm">{doctor?.specialty}</p>
                  <p className="text-gray-500 text-sm">{hospital?.name}</p>
                </div>
              </div>
              
              <div className="border-t border-b py-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-800">{appointment?.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium text-gray-800">{appointment?.slot}</span>
                </div>
              </div>
              
              <div className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-medium text-gray-800">₹{appointment?.amount}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Booking Fee</span>
                  <span>₹0</span>
                </div>
              </div>
              
              <div className="pt-2 flex justify-between items-center font-medium">
                <span>Total</span>
                <span className="text-lg text-gray-800">₹{appointment?.amount}</span>
              </div>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-3 rounded-md font-medium flex items-center justify-center mt-6 ${
                isProcessing
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay ₹{appointment?.amount}
                </>
              )}
            </button>
          </div>
        </div> 
            </div>
        </div>
        </Layout>
    );
};

export default PaymentPage;