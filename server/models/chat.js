var mongoose = require('mongoose');

var Chat = mongoose.model('Chat', {
  message: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }

});

module.exports = {Todo};
