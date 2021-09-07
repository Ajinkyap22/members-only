const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MemberSchema = new Schema({
  username: { type: String, required: true, maxlength: 20 },
  password: { type: String, required: true },
  member: { type: Boolean, default: false },
  admin: { type: Boolean, default: false },
  avatar: { type: String, enum: [] },
});

module.exports = mongoose.model("Member", MemberSchema);
