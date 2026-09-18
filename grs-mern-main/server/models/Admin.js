const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'Administrator'
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        default: ''
    },
    picture: {
        type: String,
        default: ''
    },
    collegeId: {
        type: mongoose.Schema.ObjectId,
        ref: 'College',
        required: true
    },
    role: {
        type: String,
        default: 'admin'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Admin", adminSchema);