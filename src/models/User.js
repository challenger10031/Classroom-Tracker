class User {
  constructor({ user_id, email, password_hash, role, created_at }) {
    this.user_id = user_id;
    this.email = email;
    this.password_hash = password_hash;
    this.role = role;
    this.created_at = created_at;
  }
}

module.exports = User;
