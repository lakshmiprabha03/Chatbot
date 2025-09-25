const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User ',  // FIXED: Removed trailing space
    required: true
  },
  message: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    default: 'user'
  },
  metadata: {
    tokens: { type: Number, default: 0 },
    model: { type: String, default: 'gpt-3.5-turbo' }
  }
}, { timestamps: true });

chatSchema.index({ project: 1, createdAt: -1 });

chatSchema.pre(/^find/, function(next) {
  this.populate('user', 'username').populate('project', 'name');
  next();
});

module.exports = mongoose.model('Chat', chatSchema);