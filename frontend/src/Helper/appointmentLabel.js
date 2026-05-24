export const appointmentLabel = (role) => {
  if (!role) return 'Book Appointment';
  return role === 'patient' ? 'Book Appointment' : 'Create Appointment';
};

export default appointmentLabel;
