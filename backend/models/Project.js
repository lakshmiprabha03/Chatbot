const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User ',
    required: true
  },
  config: {
    model: { type: String, default: 'gpt-3.5-turbo' },
    temperature: { type: Number, default: 0.7 },
    maxTokens: { type: Number, default: 150 }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

projectSchema.pre(/^find/, function(next) {
  this.populate('user', 'username email');
  next();
});

module.exports = mongoose.model('Project', projectSchema);