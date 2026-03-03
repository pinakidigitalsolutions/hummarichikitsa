import { useState, useEffect } from "react";

function InternetChecker({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Connection status notification (appears when status changes)
  const ConnectionNotification = () => (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-500 ease-in-out transform ${
      showNotification ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } ${
      isOnline ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'
    }`}>
      <div className="flex items-center">
        <div className={`mr-3 text-xl ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
          {isOnline ? '✅' : '❌'}
        </div>
        <div>
          <p className="font-semibold">{isOnline ? 'Connection Restored' : 'No Internet Connection'}</p>
          <p className="text-sm">{isOnline ? 'You are back online.' : 'Please check your connection.'}</p>
        </div>
      </div>
    </div>
  );

  // Full-page offline UI
  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full transform transition-all duration-300 hover:scale-105">
          <div className="mb-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Connection Lost</h1>
          <p className="text-gray-600 mb-6">Your device is not connected to the internet. Please check your network settings and try again.</p>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Wi-Fi</span>
              <span className="text-red-500 font-medium">Disabled</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Mobile Data</span>
              <span className="text-red-500 font-medium">Disabled</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Try Again
            </button>
            
            <button 
              onClick={() => setShowNotification(false)}
              className="border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-300 hover:bg-gray-50"
            >
              Dismiss
            </button>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm mt-6">If the problem persists, contact your network administrator</p>
      </div>
    );
  }

  return (
    <>
      <ConnectionNotification />
      {children}
    </>
  );
}

export default InternetChecker;