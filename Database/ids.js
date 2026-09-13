const mongoose = require("mongoose");

function ageFromDOB(iso) {
  if (!iso) return null;
  const dob = new Date(iso);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

function withId(doc) {
  if (!doc) return doc;
  const obj = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  obj.id = obj.id || String(obj._id);
  if (obj.dob) obj.age = ageFromDOB(obj.dob);
  return obj;
}

function withIds(docs) {
  return (docs || []).map(withId);
}

function filterById(id) {
  const clauses = [{ id: String(id) }];
  if (mongoose.isValidObjectId(id)) clauses.push({ _id: id });
  return { $or: clauses };
}

function uid(prefix = "") {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = { ageFromDOB, withId, withIds, filterById, uid, EMAIL_RE };
