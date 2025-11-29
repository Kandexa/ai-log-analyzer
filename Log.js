// server/models/Log.js

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: false,
    },
    level: {
      type: String,
      enum: ['INFO', 'WARNING', 'ERROR', 'UNKNOWN'],
      default: 'UNKNOWN',
    },
    message: {
      type: String,
      required: true,
    },
    rawLine: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Log', logSchema);
