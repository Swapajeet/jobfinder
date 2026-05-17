const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    company_name: {
        type: String
    },

    location: {
        type: String
    },

    description: {
        type: String
    },

    applyLink: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
      likedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Job", jobSchema);