const mongoose = require('mongoose');

const complaintTypeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    collegeId: {
        type: mongoose.Schema.ObjectId,
        ref: 'College',
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("ComplaintType", complaintTypeSchema);