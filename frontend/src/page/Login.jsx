import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AuthLogin, AuthOtpVerify } from "../Redux/authSlice";
import toast from "react-hot-toast";

const MobileOTPLogin = () => {
  // State management
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Constants
  const OTP_RESEND_DELAY = 30; // seconds

  // Countdown effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(OTP_RESEND_DELAY);
  };

  // Form validation schema
  const validationSchema = Yup.object({
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
      .required("Mobile number is required"),
    otp: otpSent
      ? Yup.string()
        .matches(/^[0-9]{4}$/, "OTP must be 4 digits")
        .required("OTP is required")
      : Yup.string().notRequired(),
  });

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      mobile: "",
      otp: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  // Handle form submission
  async function handleSubmit(values) {
    setLoading(true);
    setLoginError("");

    try {
      if (!otpSent) {
        await handleSendOTP(values.mobile);
      } else {
        await handleVerifyOTP(values.mobile, values.otp);
      }
    } catch (error) {
      handleSubmissionError(error);
    } finally {
      setLoading(false);
    }
  }

  // Send OTP to mobile
  async function handleSendOTP(mobile) {
    const response = await dispatch(AuthLogin({ userid: mobile }));

    if (response?.payload?.success) {
      setOtpSent(true);
      startCountdown();
      toast.success(`otp ${response?.payload?.otp}`)
    } else {
      throw new Error(response?.payload?.message || "Failed to send OTP");
    }
  }

  // Verify OTP
  async function handleVerifyOTP(mobile, otp) {
    const response = await dispatch(
      AuthOtpVerify({
        userid: mobile,
        otp: otp,
      })
    );

    if (response?.payload?.success) {
      handleLoginSuccess(response.payload);
    } else {
      throw new Error(response?.payload?.message || "Invalid OTP");
    }
  }

  // Handle successful login
  function handleLoginSuccess(responseData) {
    localStorage.setItem("data", JSON.stringify(responseData?.user));
    localStorage.setItem("isLoggedIn", true);
    localStorage.setItem("role", responseData?.user?.role);
    localStorage.setItem("token", responseData?.token);
    navigate("/");
  }

  // Handle submission errors
  function handleSubmissionError(error) {
    setLoginError(
      error.message || error.response?.data?.message || "Something went wrong"
    );
  }

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      await handleSendOTP(formik.values.mobile);
    } catch (error) {
      setLoginError(error.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Render functions
  const renderMobileField = () => (
    <div>
      <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
        Mobile Number
      </label>
      <div className="mt-1">
        <input
          id="mobile"
          name="mobile"
          type="tel"
          autoComplete="tel"
          disabled={otpSent}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.mobile}
          className={`w-full px-3 py-2 border ${formik.touched.mobile && formik.errors.mobile
            ? "border-red-300"
            : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100`}
        />
        {formik.touched.mobile && formik.errors.mobile && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.mobile}</p>
        )}
      </div>
    </div>
  );

  const renderOTPField = () => (
    <div>
      <div className="flex justify-between items-center">
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
          OTP
        </label>
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={countdown > 0 || loading}
          className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400"
        >
          {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
        </button>
      </div>
      <div className="mt-1">
        <input
          id="otp"
          name="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.otp}
          className={`w-full px-3 py-2 border ${formik.touched.otp && formik.errors.otp
            ? "border-red-300"
            : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        />
        {formik.touched.otp && formik.errors.otp && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.otp}</p>
        )}
      </div>
    </div>
  );

  const renderSubmitButton = () => {
    let buttonText;
    if (loading) {
      buttonText = otpSent ? "Verifying..." : "Sending OTP...";
    } else {
      buttonText = otpSent ? "Verify OTP" : "Send OTP";
    }

    return (
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {buttonText}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Patient Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/patient/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {loginError && (
            <div className="mb-4 bg-red-50 p-3 rounded-md text-red-600 text-sm">
              {loginError}
            </div>
          )}

          <form className="space-y-6" onSubmit={formik.handleSubmit}>
            {renderMobileField()}
            {otpSent && renderOTPField()}
            {renderSubmitButton()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default MobileOTPLogin;