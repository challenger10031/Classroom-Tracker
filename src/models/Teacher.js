class Teacher {
  constructor({ teacher_id, user_id, teacher_name, department }) {
    this.teacher_id = teacher_id;
    this.user_id = user_id;
    this.teacher_name = teacher_name;
    this.department = department;
  }
}

module.exports = Teacher;
