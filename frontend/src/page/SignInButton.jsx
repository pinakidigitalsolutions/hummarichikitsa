// import React, { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { AuthLogin } from '../Redux/authSlice';

// const SignInButton = () => {
//     const dispatch = useDispatch()
//     const loginAuth = async (mobile) => {
//         const response = await dispatch(AuthLogin({ userid: mobile }));
//     }
//     useEffect(() => {
//         // Load the external script
//         const script = document.createElement('script');
//         script.src = "https://www.phone.email/sign_in_button_v1.js";
//         script.async = true;
//         document.querySelector('.pe_signin_button').appendChild(script);

//         // Define the listener function
//         window.phoneEmailListener = async function (userObj) {
//             const user_json_url = userObj.user_json_url;
//             const response = await dispatch(AuthLogin({ userid: userObj.user_phone_number }));
//         };

//         return () => {
//             // Cleanup the listener function when the component unmounts
//             window.phoneEmailListener = null;
//         };
//     }, []);

//     return (
//         <div className="pe_signin_button" data-client-id="13662336448116276597"></div>
//     );
// };

// export default SignInButton;



import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AuthLogin } from '../Redux/authSlice';
import { useLocation, useNavigate } from "react-router-dom";
const SignInButton = () => {
    const navigate = useNavigate()
    // const location = useLocation();
    const dispatch = useDispatch();
    const isProcessing = useRef(false);

    useEffect(() => {
        const from = location.pathname || "/";

        // Load the external script
        const script = document.createElement('script');
        script.src = "https://www.phone.email/sign_in_button_v1.js";
        script.async = true;

        // Define the listener function
        window.phoneEmailListener = async function (userObj) {
            // Prevent multiple calls
            if (isProcessing.current) {

                return;
            }

            isProcessing.current = true;
            try {

                const response = await dispatch(AuthLogin({ userid: userObj.user_phone_number, userObj: userObj }));

                if (from === '/login') {
                    navigate('/',{ replace: true })
                } else {

                    navigate(from, { replace: true });
                }

            } catch (error) {
                console.error('Login failed', error);
            }

        };

        // Add script to document
        const container = document.querySelector('.pe_signin_button_container');
        if (container) {
            container.appendChild(script);
        }

        return () => {
            // Cleanup the listener function when the component unmounts
            window.phoneEmailListener = null;
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [dispatch]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-8">
                    <div className="text-center relative">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-6">
                            <svg
                                className="h-8 w-8 text-[#02BD7E]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-600 mb-8">Sign in with your phone number to continue</p>



                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6 ">
                                <div className="pe_signin_button_container bg-[#02BD7E] flex justify-center  mx-auto">
                                    <span
                                        className="pe_signin_button"
                                        data-client-id="13662336448116276597"
                                    >

                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-200">
                            <p className="text-xs text-gray-600 text-center">
                                <svg className="h-4 w-4 text-indigo-500 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Secure verification process. We'll never share your information.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 py-4 px-6 border-t border-gray-200">
                    <p className="text-xs text-gray-600 text-center">
                        By continuing, you agree to our <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignInButton;