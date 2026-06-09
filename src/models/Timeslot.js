class Timeslot {
  constructor({ timeslot_id, slot_no, start_time, end_time }) {
    this.timeslot_id = timeslot_id;
    this.slot_no = slot_no;
    this.start_time = start_time;
    this.end_time = end_time;
  }
}

module.exports = Timeslot;
