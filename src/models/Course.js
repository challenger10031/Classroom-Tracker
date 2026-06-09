class Course {
  constructor({ course_id, course_code, course_title, semester_id, teacher_id }) {
    this.course_id = course_id;
    this.course_code = course_code;
    this.course_title = course_title;
    this.semester_id = semester_id;
    this.teacher_id = teacher_id;
  }
}

module.exports = Course;
