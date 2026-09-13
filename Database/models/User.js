const mongoose = require("mongoose");
const { STAFF_ROLES, normalizeRole } = require("../../Authentication/roles");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: STAFF_ROLES,
      default: "manager",
    },
    username: String,
    displayName: String,
    photo: String,
    status: { type: String, default: "Active" },
  },
  { timestamps: true },
);

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this.id || String(this._id),
    name: this.name,
    email: this.email,
    role: this.role,
    displayRole: normalizeRole(this.role),
    displayName: this.displayName || this.name,
    photo: this.photo || "",
    status: this.status || "Active",
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("User", userSchema);
