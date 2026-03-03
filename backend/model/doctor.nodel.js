import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format validation
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format validation
  },
  slotId: {
    type: String,
    required: true,
    unique: true
  }
});

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    required: true
  },
  enabled: {
    type: Boolean,
    default: false
  },
  slots: [timeSlotSchema]
});

const DoctorSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/,
    },
    gender: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["doctor"],
      default: "doctor",
    },
    specialty: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    currentAppointment: {
      type: Number,
    },
    appointmentNumber: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: false,
    },
    totalAppointments: {
      type: Number,
    },
    experience: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      // enum: ['active', 'deactive'],
      default: true,
    },
    photo: {
      type: String,
    },
    bio: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    consultationFee: {
      type: Number,
      required: true,
    },
    deactivationReason: {
      type: String,
    },
    weeklySchedule: {
      type: Map,
      of: dayScheduleSchema,
      default: () => {
        const defaultSchedule = {};
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        days.forEach(day => {
          defaultSchedule[day] = {
            day: day,
            enabled: false,
            slots: []
          };
        });
        return defaultSchedule;
      }
    }

  },
  {
    timestamps: true,
  }
);

DoctorSchema.pre("save", async function (next) {
  if (this.weeklySchedule) {
    const days = Object.keys(this.weeklySchedule);

    days.forEach(day => {
      const daySchedule = this.weeklySchedule[day];
      if (daySchedule && daySchedule.slots) {
        // Remove duplicate slots based on startTime and endTime
        const uniqueSlots = [];
        const slotSet = new Set();

        daySchedule.slots.forEach(slot => {
          const slotKey = `${slot.startTime}-${slot.endTime}`;
          if (!slotSet.has(slotKey)) {
            slotSet.add(slotKey);
            uniqueSlots.push(slot);
          }
        });

        daySchedule.slots = uniqueSlots;
      }
    });
  }
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
  
});


DoctorSchema.methods.updateWeeklySchedule = function (scheduleData) {
  if (!scheduleData || typeof scheduleData !== 'object') {
    throw new Error('Invalid schedule data');
  }

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  days.forEach(day => {
    if (scheduleData[day]) {
      const dayData = scheduleData[day];

      if (!this.weeklySchedule) {
        this.weeklySchedule = new Map();
      }

      // Convert slots to the required format with unique IDs
      const formattedSlots = dayData.slots.map((slot, index) => ({
        startTime: slot.open,
        endTime: slot.close,
        slotId: `${day}-${slot.open}-${slot.close}-${Date.now()}-${index}`
      }));

      this.weeklySchedule.set(day, {
        day: day,
        enabled: dayData.enabled,
        slots: formattedSlots
      });
    }
  });
};


DoctorSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    console.error("Error comparing passwords:", err);
    return false;
  }
};

DoctorSchema.methods.generateAuthToken = async function () {
  const token = await jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "10d",
    }
  );
  return token;
};

export default mongoose.model("Doctor", DoctorSchema);