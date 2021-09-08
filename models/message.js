const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");

const MessageSchema = new Schema({
  title: { type: String, required: true, maxlength: 100 },
  timestamp: { type: Date },
  member: { type: Schema.Types.ObjectId, ref: "Member" },
  text: { type: String, required: true, maxlength: 200 },
});

MessageSchema.virtual("timestamp_formatted").get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model("Message", MessageSchema);
