
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Search, MapPin, Phone, Star, Filter, ChevronRight } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getAllHospital } from '../Redux/hospitalSlice';
// import { getAllDoctors } from '../Redux/doctorSlice';
// import Layout from '../components/Layout/Layout';
// import hospital_img from '../../src/assets/hospital_image.png';

// const HospitalListPage = () => {
//     const navigate = useNavigate();
//     const hospitals = useSelector((state) => state.hospitals.hospitals);
//     const { doctors } = useSelector((state) => state?.doctors);

//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedCity, setSelectedCity] = useState('');
//     const [selectedSpecialty, setSelectedSpecialty] = useState('');
//     const [isFilterOpen, setIsFilterOpen] = useState(false);
//     const [loading, setLoading] = useState(true); // ✅ Loader state

//     const dispatch = useDispatch();

//     // ✅ Scroll to top smoothly when page loads
//     useEffect(() => {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//     }, []);

//     // Fetch hospitals & doctors
//     useEffect(() => {
//         (async () => {
//             setLoading(true);
//             await dispatch(getAllDoctors());
//             // await dispatch(getAllHospital());
//             setLoading(false);
//         })();
//     }, [dispatch]);
//     useEffect(() => {
//         setLoading(true);
//         if (!hospitals || hospitals.length === 0) {
//             dispatch(getAllHospital());
//             setLoading(false);
//         } else {
//             setLoading(false);
//         }
//     }, [dispatch, hospitals]);

//     // Unique cities & specialties for filters
//     const cities = Array.from(new Set(hospitals.map(hospital => hospital.city)));
//     const specialties = Array.from(
//         new Set(hospitals.flatMap(hospital => hospital.specialties))
//     ).sort();

//     // Filtering hospitals
//     const filteredHospitals = hospitals.filter(hospital => {
//         const matchesSearch =
//             hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             hospital.address.toLowerCase().includes(searchTerm.toLowerCase());

//         const matchesCity = selectedCity ? hospital.city === selectedCity : true;
//         const matchesSpecialty = selectedSpecialty
//             ? hospital.specialties.includes(selectedSpecialty)
//             : true;

//         return matchesSearch && matchesCity && matchesSpecialty;
//     });



//     // ✅ Skeleton Loader Component
//     const SkeletonCard = () => (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
//             <div className="md:flex">
//                 <div className="md:w-1/3 h-64 bg-gray-200" />
//                 <div className="p-6 md:w-2/3 space-y-4">
//                     <div className="h-6 bg-gray-200 rounded w-1/2" />
//                     <div className="h-4 bg-gray-200 rounded w-1/3" />
//                     <div className="h-4 bg-gray-200 rounded w-2/3" />
//                     <div className="flex gap-2 mt-4">
//                         <div className="h-6 w-20 bg-gray-200 rounded-full" />
//                         <div className="h-6 w-20 bg-gray-200 rounded-full" />
//                         <div className="h-6 w-20 bg-gray-200 rounded-full" />
//                     </div>
//                     <div className="flex justify-between mt-6">
//                         <div className="h-4 bg-gray-200 rounded w-24" />
//                         <div className="h-10 w-32 bg-gray-200 rounded" />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
//     return (
//         <Layout>
//             <div className="bg-gradient-to-r from-blue-50 to-teal-50 min-h-screen">
//                 <div className="container mx-auto px-4 py-12">
//                     {/* Header Section */}
//                     <div className="text-center mb-12">
//                         <h1 className="text-4xl font-bold text-gray-800 mb-3">Find the Best Hospitals</h1>
//                         <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//                             Discover top-rated healthcare facilities with specialized services
//                         </p>
//                     </div>

//                     {/* Search and Filter Section */}
//                     <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
//                         <div className="flex flex-col md:flex-row items-center gap-4">
//                             <div className="relative flex-grow">
//                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                     <Search className="h-5 w-5 text-gray-400" />
//                                 </div>
//                                 <input
//                                     type="text"
//                                     placeholder="Search hospitals by name, location or specialty..."
//                                     className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                 />
//                             </div>

//                             <button
//                                 onClick={() => setIsFilterOpen(!isFilterOpen)}
//                                 className={`flex items-center justify-center px-6 py-3 rounded-lg transition ${isFilterOpen ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
//                             >
//                                 <Filter className="h-5 w-5 mr-2" />
//                                 Filters
//                             </button>
//                         </div>
//                     </div>

//                     {/* Results Section */}
//                     <div className="grid grid-cols-1 gap-6">
//                         {loading ? (

//                             <>
//                                 <SkeletonCard />
//                                 <SkeletonCard />
//                                 <SkeletonCard />
//                             </>
//                         ) : filteredHospitals.length > 0 ? (
//                             filteredHospitals
//                                 // .filter(hospital => hospital.status)
//                                 .map((hospital) => {
//                                     const doctorCount = doctors.filter(d => d?.hospitalId?._id === hospital?._id).length;

//                                     return (
//                                         <div
//                                             key={hospital._id}
//                                             className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300"
//                                         >
//                                             <div className="md:flex">
//                                                 <div className="md:w-1/3 h-64 md:h-auto">
//                                                     <img
//                                                         src={hospital.image || hospital_img}
//                                                         alt={hospital.name}
//                                                         className="h-full w-full object-cover"
//                                                     />
//                                                 </div>
//                                                 <div className="p-6 md:w-2/3">
//                                                     <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
//                                                         <div>
//                                                             {
//                                                                 !hospital.status && (
//                                                                     <p className=' bg-red-100 text-red-500 py-0.5 px-2 font-semibold rounded-sm' >{hospital?.deactivationReason}</p>
//                                                                 )
//                                                             }
//                                                             <div className="flex items-center mb-1">
//                                                                 <h2 className="text-2xl font-bold text-gray-800">{hospital.name}</h2>
//                                                                 <div className="ml-3 flex items-center bg-blue-50 px-3 py-1 rounded-full">
//                                                                     <Star className="h-4 w-4 text-yellow-500 mr-1" />
//                                                                     <span className="font-medium text-gray-800 text-sm">{hospital.rating}</span>
//                                                                 </div>
//                                                             </div>

//                                                             <div className="flex items-center text-gray-600 mb-3">
//                                                                 <MapPin className="h-5 w-5 text-blue-500 mr-2" />
//                                                                 <span>{hospital.address}, {hospital.city}</span>
//                                                             </div>

//                                                             <div className="flex items-center text-gray-600 mb-4">
//                                                                 <Phone className="h-5 w-5 text-blue-500 mr-2" />
//                                                                 <span>{hospital.phone || 'Contact not available'}</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="mb-4">
//                                                         <h3 className="text-lg font-semibold text-gray-800 mb-2">Specialties Available</h3>
//                                                         <div className="flex flex-wrap gap-2">
//                                                             {hospital.specialties.slice(0, 5).map((specialty, index) => (
//                                                                 <span
//                                                                     key={index}
//                                                                     className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
//                                                                 >
//                                                                     {specialty}
//                                                                 </span>
//                                                             ))}
//                                                             {hospital.specialties.length > 5 && (
//                                                                 <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
//                                                                     +{hospital.specialties.length - 5} more
//                                                                 </span>
//                                                             )}
//                                                         </div>
//                                                     </div>

//                                                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
//                                                         <div className="text-gray-700">
//                                                             <span className="font-semibold text-gray-800">{doctorCount}</span> {doctorCount === 1 ? 'Doctor' : 'Doctors'} available
//                                                         </div>
//                                                          {
//                                                             hospital.status ?(
//                                                                 <button
//                                                             onClick={() => navigate(`/hospitals/${hospital._id}/doctors`)}
//                                                             className={`flex items-center justify-center px-6 py-3 rounded-lg transition text-white bg-blue-600 hover:bg-blue-700`}
                                                           
//                                                         >
//                                                             View Doctors <ChevronRight className="ml-2 h-4 w-4" />
//                                                         </button>
//                                                             ):(
//                                                                 <button
                                                           
//                                                             className={`flex items-center justify-center px-6 py-3 rounded-lg transition text-white ${hospital.status
//                                                                     ? "bg-blue-600 hover:bg-blue-700"
//                                                                     : "bg-red-100 disabled cursor-not-allowed"
//                                                                 }`}
//                                                             disabled={hospital.status}
//                                                         >
//                                                             View Doctors <ChevronRight className="ml-2 h-4 w-4" />
//                                                         </button>
//                                                             )
//                                                          }
                                                        

//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })
//                         ) : (
//                             <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
//                                 <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
//                                     <Search className="h-10 w-10 text-blue-500" />
//                                 </div>
//                                 <h3 className="text-2xl font-medium text-gray-800 mb-2">No hospitals found</h3>
//                                 <p className="text-gray-600 mb-6 max-w-md mx-auto">
//                                     We couldn't find any hospitals matching your search criteria. Try adjusting your filters.
//                                 </p>
//                                 <button
//                                     onClick={() => {
//                                         setSearchTerm('');
//                                         setSelectedCity('');
//                                         setSelectedSpecialty('');
//                                     }}
//                                     className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto"
//                                 >
//                                     Clear all filters
//                                     <ChevronRight className="ml-1 h-4 w-4" />
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </Layout>
//     );
// };

// export default HospitalListPage;



import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone, Star, Filter, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllHospital } from '../Redux/hospitalSlice';
import { getAllDoctors } from '../Redux/doctorSlice';
import Layout from '../components/Layout/Layout';
import hospital_img from '../../src/assets/hospital_image.png';

const HospitalListPage = () => {
  const navigate = useNavigate();
  const hospitals = useSelector((state) => state.hospitals.hospitals);
  const { doctors } = useSelector((state) => state?.doctors.doctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  // ✅ Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch hospitals & doctors
  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(getAllDoctors());
      setLoading(false);
    })();
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    if (!hospitals || hospitals.length === 0) {
      dispatch(getAllHospital());
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [dispatch, hospitals]);

  // Unique cities & specialties for filters
  const cities = Array.from(new Set(hospitals.map(hospital => hospital.city)));
  const specialties = Array.from(
    new Set(hospitals.flatMap(hospital => hospital.specialties))
  ).sort();

  // Filtering hospitals
  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch =
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = selectedCity ? hospital.city === selectedCity : true;
    const matchesSpecialty = selectedSpecialty
      ? hospital.specialties.includes(selectedSpecialty)
      : true;

    return matchesSearch && matchesCity && matchesSpecialty;
  });

  // ✅ Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      <div className="md:flex">
        <div className="md:w-1/3 h-64 bg-gray-200" />
        <div className="p-6 md:w-2/3 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="flex gap-2 mt-4">
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
          </div>
          <div className="flex justify-between mt-6">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-10 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Find the Best Hospitals</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover top-rated healthcare facilities with specialized services
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Search Input */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search hospitals by name, location or specialty..."
                  className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* 🔹 City Filter Dropdown */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">All Cities</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              {/* 🔹 Specialty Filter Dropdown */}
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty, index) => (
                  <option key={index} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>

              {/* Filters Button */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center justify-center px-6 py-3 rounded-lg transition ${isFilterOpen ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filteredHospitals.length > 0 ? (
              filteredHospitals.map((hospital) => {
                const doctorCount = doctors?.filter(d => d?.hospitalId?._id === hospital?._id).length;

                return (
                  <div
                    key={hospital._id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="md:flex">
                      <div className="md:w-1/3 h-64 md:h-auto">
                        <img
                          src={hospital.image || hospital_img}
                          alt={hospital.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-6 md:w-2/3">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          <div>
                            {!hospital.status && (
                              <p className="bg-red-100 text-red-500 py-0.5 px-2 font-semibold rounded-sm">
                                {hospital?.deactivationReason}
                              </p>
                            )}
                            <div className="flex items-center mb-1">
                              <h2 className="text-2xl font-bold text-gray-800">{hospital.name}</h2>
                              <div className="ml-3 flex items-center bg-blue-50 px-3 py-1 rounded-full">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="font-medium text-gray-800 text-sm">{hospital.rating}</span>
                              </div>
                            </div>

                            <div className="flex items-center text-gray-600 mb-3">
                              <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                              <span>{hospital.address}, {hospital.city}</span>
                            </div>

                            <div className="flex items-center text-gray-600 mb-4">
                              <Phone className="h-5 w-5 text-blue-500 mr-2" />
                              <span>{hospital.phone || 'Contact not available'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Specialties Available</h3>
                          <div className="flex flex-wrap gap-2">
                            {hospital.specialties.slice(0, 5).map((specialty, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                              >
                                {specialty}
                              </span>
                            ))}
                            {hospital.specialties.length > 5 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                                +{hospital.specialties.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
                          <div className="text-gray-700">
                            <span className="font-semibold text-gray-800">{doctorCount}</span>{" "}
                            {doctorCount === 1 ? "Doctor" : "Doctors"} available
                          </div>
                          {hospital.status ? (
                            <button
                              onClick={() => navigate(`/hospitals/${hospital._id}/doctors`)}
                              className="flex items-center justify-center px-6 py-3 rounded-lg transition text-white bg-blue-600 hover:bg-blue-700"
                            >
                              View Doctors <ChevronRight className="ml-2 h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              className="flex items-center justify-center px-6 py-3 rounded-lg transition text-white bg-red-100 cursor-not-allowed"
                              disabled
                            >
                              View Doctors <ChevronRight className="ml-2 h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-medium text-gray-800 mb-2">No hospitals found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any hospitals matching your search criteria. Try adjusting your filters.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCity('');
                    setSelectedSpecialty('');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto"
                >
                  Clear all filters
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HospitalListPage;

