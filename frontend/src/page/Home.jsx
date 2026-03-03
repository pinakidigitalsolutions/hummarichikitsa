import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllHospital } from "../Redux/hospitalSlice";
import { Link, useNavigate } from "react-router-dom";
import { Search, Calendar, CreditCard, CheckCircle, Star, MapPin, Clock, Phone, HeartPulse, Stethoscope, Shield, Ambulance } from 'lucide-react';
import {  getAllAppointment } from "../Redux/appointment";
import { getAllDoctors} from "../Redux/doctorSlice";
import Layout from "../components/Layout/Layout";
import { useState } from "react";
import hospital_img from '../../src/assets/hospital_image.png';
import deepak from '../../src/assets/deepak.jpg';
import abhay from '../../src/assets/abjay.jpg';
import rohit from '../../src/assets/rohit.jpg';
import AppointmentsSection from "../components/AppointmentsSection";
import socket from "../Helper/socket";

// Skeleton Components
const StatsSkeleton = () => (
  <div className="bg-white rounded-xl shadow-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="flex items-center p-3 rounded-lg bg-gray-50">
        <div className="p-3 rounded-full bg-gray-200 shadow-md mr-4 animate-pulse">
          <div className="w-6 h-6"></div>
        </div>
        <div>
          <div className="h-6 w-12 bg-gray-300 rounded mb-2 animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

const AppointmentSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="p-5">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <div className="h-5 w-32 bg-gray-300 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="mt-3 flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded mr-1 animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2 animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2 animate-pulse"></div>
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="mt-5 flex justify-between">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const HospitalSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="relative h-48 bg-gray-300 animate-pulse"></div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-28 bg-gray-300 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const hospital = useSelector((state) => state.hospitals.hospitals);
  const currentUser = JSON.parse(localStorage.getItem('data')) || null;
  const isLoggdIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;
  const dispatch = useDispatch();
  const [hospitalsLoading, setHospitalsLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const appoint = useSelector((state) => state.appointment?.appointment);
  const [appointments, setAppointments] = useState([]);
  const doct = useSelector((state) => state?.doctors?.doctors.doctors);
  const [doctors, setdoctors] = useState([])
  useEffect(() => {
    setdoctors(doct)
  }, [doct])
  useEffect(() => {
    if (appoint) {
      setAppointments(appoint);
    }
  }, [appoint]);
  useEffect(() => {
    socket.on("appointmentUpdate", (data) => {
      // console.log("👉 Live Update:", data);

      setAppointments((prev) => {
        const exists = prev?.some((a) => a._id === data._id);
        if (exists) {
          return prev.map((a) => (a._id === data._id ? data : a));
        }
        return [...prev, data];
      });
    });

    socket.on("doctorUpdate", (data) => {
      setdoctors((prev) => {
        const exists = prev.some((a) => a._id === data._id);
       
        if (exists) {
          return prev.map((a) => (a._id === data._id ? data : a));
        }
        return [...prev, data];
      });
    })
    socket.on("doctoractive", (data) => {
      setdoctors((prev) => {
        const exists = prev.some((a) => a._id === data._id);
      
        if (exists) {
          return prev.map((a) => (a._id === data._id ? data : a));
        }
        return [...prev, data];
      });
    })

    return () => {
      socket.off("appointmentUpdate");
      socket.off("doctorUpdate");
      socket.off("doctoractive");
    };
  }, [dispatch]);




  const backgroundImages = [
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1581595219315-a187dd40c322?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    (async () => {
      if (!doctors || doctors.length === 0) {
        setHospitalsLoading(true);
        setDoctorsLoading(true);
        await dispatch(getAllDoctors());
        setDoctorsLoading(false);
      } else {
        setDoctorsLoading(false);
      }
    })();
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!appointments || appointments.length === 0) {
      dispatch(getAllAppointment());
      setAppointmentsLoading(false);
    } else {
      setAppointmentsLoading(false);
    }
  }, [dispatch])


  useEffect(() => {
    setHospitalsLoading(true);
    if (!hospital || hospital.length === 0) {
      dispatch(getAllHospital());
      setHospitalsLoading(false);
    } else {
      setHospitalsLoading(false);
    }
  }, );
[dispatch, hospital]
  return (
    <Layout>
      <section className="relative bg-gradient-to-r from-blue-900 to-teal-800 text-white py-24">
        
        <div className="absolute inset-0 opacity-15">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-20' : 'opacity-0'}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              ></div>
            </div>
          ))}
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Compassionate Care, <span className="text-teal-300">Advanced Medicine</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Connecting you with the finest healthcare professionals and facilities for personalized treatment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/hospitals')}
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition-all duration-300 shadow-lg flex items-center"
              >
                <Stethoscope className="mr-2" size={20} />
                Find a Doctor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="container mx-auto px-4 -mt-12 relative z-20">
        {hospitalsLoading ? (
          <StatsSkeleton />
        ) : (
          <div className="bg-white rounded-xl shadow-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Stethoscope size={24} className="text-blue-600" />, value: "250+", label: "Specialists" },
              { icon: <HeartPulse size={24} className="text-teal-600" />, value: "50+", label: "Hospitals" },
              { icon: <CheckCircle size={24} className="text-green-600" />, value: "10K+", label: "Patients" },
              { icon: <Shield size={24} className="text-amber-600" />, value: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div key={index} className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="p-3 rounded-full bg-white shadow-md mr-4">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Appointments Section */}
      {isLoggdIn && currentUser?.role != 'admin' && (
        <AppointmentsSection
          isLoggedIn={isLoggdIn}
          currentUser={currentUser}
          appointments={appointments}
          doctors={doctors}
          hospital={hospital}
          appointmentsLoading={appointmentsLoading}
          doctorsLoading={doctorsLoading}
        />
      )}

      {/* Specialties Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Find by Specialty</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Access specialized care from our network of expert physicians
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Cardiology', icon: '❤️', color: 'bg-red-50 text-red-600' },
              { name: 'Neurology', icon: '🧠', color: 'bg-purple-50 text-purple-600' },
              { name: 'Orthopedics', icon: '🦴', color: 'bg-blue-50 text-blue-600' },
              { name: 'Pediatrics', icon: '👶', color: 'bg-pink-50 text-pink-600' },
              { name: 'Dermatology', icon: '🧴', color: 'bg-amber-50 text-amber-600' },
              { name: 'Ophthalmology', icon: '👁️', color: 'bg-indigo-50 text-indigo-600' },
              { name: 'Dentistry', icon: '🦷', color: 'bg-teal-50 text-teal-600' },
              { name: 'Gynecology', icon: '🌸', color: 'bg-rose-50 text-rose-600' },
              { name: 'ENT', icon: '👂', color: 'bg-green-50 text-green-600' },
              { name: 'Surgery', icon: '🩺', color: 'bg-orange-50 text-orange-600' },
              { name: 'Psychiatry', icon: '🧘', color: 'bg-gray-50 text-gray-600' },
              { name: 'Emergency', icon: '🚑', color: 'bg-red-50 text-red-600' },
            ].map((specialty, index) => (
              <div
                key={index}
                className={`${specialty.color} rounded-lg p-4 text-center cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 flex flex-col items-center`}
              >
                <span className="text-3xl mb-2">{specialty.icon}</span>
                <span className="text-sm font-medium">{specialty.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple steps to access quality healthcare
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {[
              {
                step: "1",
                title: "Find a Doctor",
                description: "Search by specialty, location, or availability to find the right healthcare provider.",
                icon: <Search size={24} className="text-blue-600" />
              },
              {
                step: "2",
                title: "Book Appointment",
                description: "Select a convenient time slot and confirm your appointment instantly.",
                icon: <Calendar size={24} className="text-green-600" />
              },
              {
                step: "3",
                title: "Get Treatment",
                description: "Visit the doctor and receive personalized medical care.",
                icon: <CheckCircle size={24} className="text-green-600" />
              }
            ].map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm flex-1 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hospitals */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Featured Hospitals</h2>
              <p className="text-gray-600">Trusted healthcare facilities in our network</p>
            </div>
            <button
              onClick={() => navigate('/hospitals')}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-sm"
            >
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          {hospitalsLoading ? (
            <HospitalSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hospital
                .filter(hospital => hospital.status)
                .slice(0, 3)
                .map((hospital) => (
                  <div
                    key={hospital?._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={hospital.image || hospital_img}
                        alt={hospital.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h3 className="text-xl font-semibold text-white">{hospital.name}</h3>
                        <div className="flex items-center text-white/90 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {hospital.city}
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        {hospital.rating || '4.8'}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hospital.specialties.slice(0, 3).map((specialty, index) => (
                          <div
                            key={index}
                            className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-800 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap"
                          >
                            {specialty}
                          </div>
                        ))}
                        {hospital.specialties.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs sm:text-sm font-medium rounded-full">
                            +{hospital.specialties.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Phone className="w-4 h-4 mr-2 text-blue-500" />
                          {hospital.phone || 'Contact'}
                        </div>
                        <button
                          onClick={() => navigate(`/hospitals/${hospital._id}/doctors`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          View Doctors
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Patient Stories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from people who've experienced our care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Jaya",
                role: "Cardiac Patient",
                content: "The cardiology team provided exceptional care during my treatment. Their expertise and compassion made all the difference.",
                rating: 5,
                image: `${abhay}`
              },
              {
                name: "Abhay Patel",
                role: "Neurology",
                content: "The maternity ward staff were incredibly supportive throughout my delivery. Couldn't have asked for a better experience.",
                rating: 5,
                image: `${abhay}`
              },
              {
                name: "Rohit Yadav",
                role: "Orthopedic Patient",
                content: "My knee replacement surgery was successful and the rehabilitation program got me back on my feet quickly.",
                rating: 4,
                image: `${rohit}`
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Your Health Journey Starts Here</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            Connect with top healthcare providers and take the first step towards better health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/hospitals')}
              className="bg-white text-blue-800 px-8 py-3 rounded-lg font-medium text-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <Stethoscope className="mr-2" size={20} />
              Find a Doctor
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <Phone className="mr-2" size={20} />
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Home;