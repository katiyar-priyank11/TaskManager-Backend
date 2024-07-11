const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: String,
  link: String,
  revisionPrimary: Boolean,
  revisionSecondary: Boolean,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;