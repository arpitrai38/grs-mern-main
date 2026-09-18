const mongoose = require('mongoose');

const complaintSchema = mongoose.Schema({
    collegeId: {
        type: mongoose.Schema.ObjectId,
        ref: "College",
        required: true,
        index: true
    },
    studentId: {
        type: mongoose.Schema.ObjectId,
        ref: "Student",
        required: true,
        index: true
    },
    complaintType: {
        type: mongoose.Schema.ObjectId,
        ref: "ComplaintType"
    },
    complaint: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['notProcessed', 'pending', 'closed'],
        default: 'notProcessed'
    }
}, {
    timestamps: true
});

complaintSchema.index({ collegeId: 1, createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);