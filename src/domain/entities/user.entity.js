class User {
  constructor({ userId, name, email, password, isActive = true, createdAt = null, updatedAt = null }) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.password = password;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = User;
