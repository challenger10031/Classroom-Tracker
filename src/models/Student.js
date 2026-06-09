class Student {
  constructor({ student_id, user_id, batch_id, student_name, roll_no }) {
    this.student_id = student_id;
    this.user_id = user_id;
    this.batch_id = batch_id;
    this.student_name = student_name;
    this.roll_no = roll_no;
  }
}

module.exports = Student;
