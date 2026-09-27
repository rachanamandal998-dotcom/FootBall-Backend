const { getPool } = require("../db");
const { query, createQuery, matches, toIso, mapError } = require("../repository");
const { normalizeRole } = require("../../Authentication/roles");

const SELECT_PUBLIC = `id, name, email, role, username, display_name, photo, status, created_at, updated_at`;
const SELECT_PRIVATE = `id, name, email, password, role, username, display_name, photo, status, created_at, updated_at`;

function hydrate(row, includePassword) {
  const user = {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    username: row.username || "",
    displayName: row.display_name || row.name,
    photo: row.photo || "",
    status: row.status || "Active",
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
  if (includePassword) user.password = row.password;

  user.toPublicJSON = function toPublicJSON() {
    return {
      id: this.id,
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

  user.save = async function save() {
    try {
      await query(
        getPool(),
        `UPDATE users
         SET name = ?, email = ?, password = ?, role = ?, username = ?, display_name = ?, photo = ?, status = ?, updated_at = ?
         WHERE id = ?`,
        [
          this.name,
          String(this.email || "").toLowerCase(),
          this.password,
          this.role,
          this.username || this.email,
          this.displayName || this.name,
          this.photo || "",
          this.status || "Active",
          new Date(),
          this.id,
        ],
      );
    } catch (err) {
      throw mapError(err);
    }
    return this;
  };

  user.deleteOne = async function deleteOne() {
    await query(getPool(), "DELETE FROM users WHERE id = ?", [this.id]);
  };

  return user;
}

async function loadUsers(includePassword) {
  const [rows] = await query(getPool(), `SELECT ${includePassword ? SELECT_PRIVATE : SELECT_PUBLIC} FROM users`);
  return rows.map((row) => hydrate(row, includePassword));
}

const User = {
  find(filter = {}) {
    return createQuery(async (q) => {
      const includePassword = q._select === "+password";
      const users = await loadUsers(includePassword);
      return users.filter((user) => matches(user, filter));
    });
  },
  findOne(filter = {}) {
    return createQuery(async (q) => {
      const includePassword = q._select === "+password";
      const users = await loadUsers(includePassword);
      return users.filter((user) => matches(user, filter));
    }, { one: true });
  },
  findById(id) {
    return this.findOne({ $or: [{ id }, { _id: id }] });
  },
  async create(input) {
    const name = String(input.name || "").trim();
    const email = String(input.email || "").trim().toLowerCase();
    const [result] = await query(
      getPool(),
      `INSERT INTO users (name, email, password, role, username, display_name, photo, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        input.password,
        input.role || "manager",
        input.username || email,
        input.displayName || name,
        input.photo || "",
        input.status || "Active",
        new Date(),
        new Date(),
      ],
    );
    return this.findById(result.insertId).select("+password");
  },
  async countDocuments(filter = {}) {
    const users = await this.find(filter);
    return users.length;
  },
};

module.exports = User;
