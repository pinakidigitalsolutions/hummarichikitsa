import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Filter, Star, CalendarDays, ChevronLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllHospital } from '../Redux/hospitalSlice';
import { getAllDoctors, updateDoctorStatus } from '../Redux/doctorSlice';
import Layout from '../components/Layout/Layout';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import hospital_img from '../../src/assets/hospital_image.png';
import avatar from '../../src/assets/logo-def.png';
import socket from '../Helper/socket';
const DoctorListPage = () => {
  const navigate = useNavigate();
  const { hospitalId } = useParams();
  const dispatch = useDispatch();

  // Redux state
  const hospitals = useSelector((state) => state.hospitals.hospitals);
  const { doctors, loading: doctorsLoading } = useSelector((state) => state.doctors.doctors);
  const { loading: hospitalsLoading } = useSelector((state) => state.hospitals);
  // console.log(doctors)
  // Local state
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Find the current hospital and its doctors
  const hospital = hospitals.find(h => h._id === hospitalId);
  const hospitalDoctors = doctors.filter(d => d?.hospitalId?._id === hospitalId);

  // Get unique specialties for filters
  const specialties = Array.from(
    new Set(hospitalDoctors.map(doctor => doctor.specialty))
  ).sort();

  // Filter doctors based on selected specialty
  const filteredDoctors = selectedSpecialty
    ? hospitalDoctors.filter(doctor => doctor.specialty === selectedSpecialty)
    : hospitalDoctors;

  // Format experience text
  const formatExperience = (years) => {
    return years === 1 ? `${years} year` : `${years} years`;
  };

  // Format rating display
  const formatRating = (rating) => {
    return rating % 1 === 0 ? rating.toFixed(1) : rating;
  };

  // Generate random reviews count (for demo purposes)
  const getRandomReviews = () => {
    return Math.floor(Math.random() * 200) + 50;
  };

  // Fetch data on component mount
  useEffect(() => {
    (async () => {
      if (!hospital || hospital.length === 0) {

        await dispatch(getAllHospital())
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }

      if (!doctors || doctors.length === 0) {
        await dispatch(getAllDoctors())
      }

    })()

  }, []);
  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to top when page/component mounts
  }, []);

  useEffect(() => {
    socket.on("doctorStatusUpdate", (data) => {
      
      dispatch(updateDoctorStatus(data));
    });

    return () => {
      socket.off("doctorStatusUpdate");
    };
  }, [dispatch]);


  if (isLoading || hospitalsLoading || doctorsLoading) {
    return (
      <Layout>
        <div className=" mx-auto px-4 py-8">
          {/* Hospital Info Skeleton */}
          <div className=" rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start">
              <div className="md:w-1/4 mb-4 md:mb-0 md:mr-6">
                <Skeleton height={150} className="rounded-lg" />
              </div>
              <div className="md:w-3/4">
                <Skeleton width={200} height={30} className="mb-2" />
                <Skeleton width={300} height={20} className="mb-3" />
                <div className="flex items-center mb-4">
                  <Skeleton width={100} height={20} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} width={80} height={30} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Doctors List Skeleton */}
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="md:flex">
                  <div className="md:w-1/4 bg-gray-50 flex items-center justify-center p-6">
                    <Skeleton circle width={160} height={160} />
                  </div>
                  <div className="p-6 md:w-3/4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div>
                        <Skeleton width={180} height={25} className="mb-2" />
                        <Skeleton width={150} height={20} className="mb-2" />
                        <Skeleton width={250} height={20} className="mb-2" />
                        <Skeleton width={120} height={20} className="mb-4" />
                      </div>
                      <div className="mt-4 md:mt-0">
                        <Skeleton width={120} height={60} />
                      </div>
                    </div>
                    <Skeleton count={2} className="mb-6" />
                    <Skeleton width={200} height={40} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Hospital not found state
  if (!hospital) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Hospital not found</h2>
          <button
            onClick={() => navigate('/hospitals')}
            className="flex items-center justify-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Hospitals
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className=" bg-gradient-to-r from-blue-50 to-teal-50 mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </button>

        {/* Hospital Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start">
            <div className="md:w-1/4 mb-4 md:mb-0 md:mr-6">
              <img
                src={hospital.image || hospital_img}
                alt={hospital.name}
                className="w-full h-auto rounded-lg object-cover"
                style={{ maxHeight: '150px' }}

              />
            </div>
            <div className="md:w-3/4">
              <h1 className="text-2xl font-bold mb-2 text-gray-800">{hospital.name}</h1>
              <p className="text-gray-600 mb-3">
                {hospital.address}, {hospital.city}, {hospital.state}
              </p>
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="font-semibold text-gray-800">
                  {formatRating(hospital.rating)}
                </span>
                <span className="text-gray-600 text-sm ml-1">
                  ({getRandomReviews()} reviews)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {hospital.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Section Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Doctors {filteredDoctors.length > 0 && `(${filteredDoctors.length})`}
          </h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition w-full sm:w-auto"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </button>
            {selectedSpecialty && (
              <button
                onClick={() => setSelectedSpecialty('')}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {isFilterOpen && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Filter by Specialty</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSpecialty('')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${selectedSpecialty === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition`}
              >
                All Specialties
              </button>
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => {
                    setSelectedSpecialty(specialty);
                    setIsFilterOpen(false);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${selectedSpecialty === specialty
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Doctors List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition duration-300 hover:shadow-lg"
              >
                <div className="md:flex">
                  <div className="md:w-1/4 bg-gray-50 flex items-center justify-center p-6">
                    <img
                      src={doctor.photo || avatar}
                      alt={doctor.name}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-md"

                    />
                  </div>
                  <div className="p-6 md:w-3/4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div>
                        {doctor?.deactivationReason && (
                          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md mb-3">
                            <p className="text-sm font-medium">
                               Reason: {doctor.deactivationReason}
                            </p>
                          </div>
                        )}

                        <h2 className="text-xl font-semibold text-gray-800 mb-1">
                          Dr. {doctor.name}
                        </h2>
                        <p className="text-blue-600 font-medium mb-2">
                          {doctor.specialty}
                        </p>
                        <p className="text-gray-600 mb-2">
                          {doctor.qualification} • {formatExperience(doctor.experience)} Experience
                        </p>
                        <div className="flex items-center mb-4">
                          <Star className="h-5 w-5 text-yellow-500 mr-1" />
                          <span className="font-semibold text-gray-800">
                            {formatRating(doctor.rating)}
                          </span>
                          <span className="text-gray-600 text-sm ml-1">
                            ({getRandomReviews()} reviews)
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <div className="bg-green-50 px-4 py-2 rounded-md text-center mb-3 min-w-[120px]">
                          <p className="text-sm text-gray-600">Consultation Fee</p>
                          <p className="text-xl font-semibold text-gray-800">
                            ₹{doctor.consultationFee}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6 line-clamp-2">
                      {doctor.bio || 'No biography available'}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      {/* <div className="flex items-center">
                        <CalendarDays className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">
                          {doctor.availableSlots?.length > 0 ? (
                            `Next Available: Today, ${doctor.availableSlots[0]?.slots[0]}`
                          ) : (
                            'No available slots'
                          )}
                        </span>
                      </div> */}
                      <button
                      onClick={() => navigate(`/doctors/${doctor._id}`)}
                        disabled={!doctor.status}
                        className={`cursor-pointer w-full sm:w-auto px-6 py-2 rounded-md transition
                            ${doctor.status
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-400 text-white cursor-not-allowed'}`}
                      >
                        {doctor.status ? 'Book Appointment' : 'Unavailable'}
                      </button>

                      {/* <button
                        onClick={() => navigate(`/doctors/${doctor._id}`)}
                        className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Book Appointment
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg p-8 text-center shadow-md">
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                No doctors found
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedSpecialty
                  ? `No doctors found for "${selectedSpecialty}" specialty`
                  : 'No doctors available at this hospital'}
              </p>
              {selectedSpecialty && (
                <button
                  onClick={() => setSelectedSpecialty('')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DoctorListPage;