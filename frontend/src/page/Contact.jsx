import React from 'react';
import { Mail, Phone } from 'lucide-react';

function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
          <p className="text-blue-100">We're here to help you with any questions</p>
        </div>
        
        {/* Contact Content */}
        <div className="p-8 space-y-8">
          {/* Email Card */}
          <div className="flex items-center p-6 bg-blue-50 rounded-lg transition-all hover:bg-blue-100 hover:shadow-sm">
            <div className="bg-blue-100 p-3 rounded-full">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-700">Email Support</h3>
              <a 
                href="mailto:support@pinaki.co.in" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                support@pinaki.co.in
              </a>
            </div>
          </div>
          
          {/* Phone Card */}
          <div className="flex items-center p-6 bg-blue-50 rounded-lg transition-all hover:bg-blue-100 hover:shadow-sm">
            <div className="bg-blue-100 p-3 rounded-full">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-gray-700">Phone Support</h3>
              <a 
                href="tel:+917982503622" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                +91 7982503622
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;