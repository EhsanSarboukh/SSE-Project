const mongoose = require ('mongoose');
var reportSchema = mongoose.Schema({
  date: Date,
  analysis: {
    data: Buffer,
    contentType: String
  }
});
var Report = mongoose.model("Report", reportSchema);
module.exports = Report;
