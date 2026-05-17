const mongoose = require("mongoose");

const passportLocalMongoose =
require("passport-local-mongoose").default;

const userSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    unique: true
  },


  // SKILLS
  skills: {
    type: String,
    default: ""
  },

  // EDUCATION
 education: {

  degree: {
    type: String,
    default: ""
  },

  college: {
    type: String,
    default: ""
  },

  year: {
    type: String,
    default: ""
  }

},

  // LOCATION
  location: {
    type: String,
    default: ""
  },

  // LIKED JOBS
  likedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job"
    }
  ],
  resume:{
    type: String,
    default: ""
  },
  resumeScore: {
 default: 0,
 type: Number
},

aiSummary: String,

matchedJobs: [
 {
   title: String,
   company: String,
   applyLink: String,
   whyMatch: String
 }
],

status: {
 type: String,
 default: "pending"
}

}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

module.exports =
mongoose.model("User", userSchema);