import mongoose from "mongoose";
import counterModel from "./counter.model.js";
import tokenCounterModel from "./tokenCounter.model.js";
const AppointmentSchema = new mongoose.Schema({
  patient: {
    type: String,
    requred: true
  },
  mobile: {
    type: String,
    requred: true
  },
  dob: {
    type: String,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  booking_amount: { type: Number, required: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentStatus: { type: String },
  date: {
    type: String,
    required: true,
  },
  slot: {
    type: String,
    // required: true,
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'pending', 'check-in'],
    default: 'confirmed',
    required: true,

  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed','paid'],
    default: 'pending',
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Card', 'Cash', 'NetBanking', 'online'],
  },
  transactionId: {
    type: String,
  },
  amount: {
    type: Number,
  },
  appointmentNumber: {
    type: Number,
  },
  token: {
    type: String,
    // unique: true,
    // index: true, // Improves query performance
    default: function () {
      return "TEMP-" + Math.random().toString(36).substring(2, 10); // Temporary unique ID
    }
  }
}, {
  timestamps: true,
});


AppointmentSchema.pre('save', async function (next) {
  try {
    // Only generate token if it's still the temporary one
    if (this.token && this.token.startsWith('TEMP-')) {
      const rawDate = new Date(this.date);
      const dateKey = Number.isNaN(rawDate.getTime())
        ? new Date().toISOString().split("T")[0]
        : rawDate.toISOString().split("T")[0];

      const counter = await tokenCounterModel.findOneAndUpdate(
        { date: dateKey },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const dateStr = dateKey.replace(/-/g, "");
      const sequence = String(counter.seq).padStart(3, "0");
      this.token = `AP-${dateStr}-${sequence}`;
    }

    next();
  } catch (err) {
    next(err);
  }
});



// Helper functions
// AppointmentSchema.pre('save', async function (next) {
//   try {
//     // Only assign appointmentNumber if not already set
//     if (!this.appointmentNumber) {
//       const todayStart = new Date(this.date);
//       todayStart.setHours(0, 0, 0, 0);
//       const todayEnd = new Date(todayStart);
//       todayEnd.setHours(23, 59, 59, 999);

//       // Find last appointment for same doctor on the same day
//       const lastAppointment = await this.constructor.findOne({
//         doctorId: this.doctorId,
//         date: { $gte: todayStart.toISOString(), $lte: todayEnd.toISOString() }
//       }).sort({ appointmentNumber: -1 });

//       if (lastAppointment && lastAppointment.appointmentNumber) {
//         this.appointmentNumber = lastAppointment.appointmentNumber + 1;
//       } else {
//         this.appointmentNumber = 1; // First appointment for the doctor today
//       }
//     }
//     next();
//   } catch (err) {
//     next(err);
//   }
// });



AppointmentSchema.pre("save", async function (next) {
  try {
    if (!this.appointmentNumber) {
      
      const dateKey = new Date(this.date).toISOString().split("T")[0];
      if (this.status === 'confirmed') {
        const counter = await counterModel.findOneAndUpdate(
          { doctorId: this.doctorId, date: dateKey },
          { $inc: { seq: 1 } }, // atomic increment
          { new: true, upsert: true } // create if not exists
        );
        this.appointmentNumber = counter.seq;
      }

    }
    next();
  } catch (err) {
    next(err);
  }
});





export default mongoose.model('Appointment', AppointmentSchema);
