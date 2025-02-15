const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
    userId: mongoose.Schema.Types.ObjectId
});
module.exports = mongoose.model('Task', taskSchema);

