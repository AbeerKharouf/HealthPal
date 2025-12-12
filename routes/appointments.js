const express = require("express");
const router = express.Router();
const db = require("../config/db");
const translate = require("translate-google");



console.log(" appointments.js WAS LOADED");

// ============================
// إنشاء موعد جديد (Patient يحجز)
// POST /appointments
// ============================
router.post("/", (req, res) => {
  const { patient_id, doctor_id, appointment_datetime, call_mode, notes } = req.body;

  if (!patient_id || !doctor_id || !appointment_datetime) {
    return res.status(400).json({
      msg: "patient_id, doctor_id, appointment_datetime are required"
    });
  }

  // ============================
  //  1) التحقق إذا المريض موجود
  // ============================
  const checkPatient = `
     SELECT * FROM patient WHERE patient_id = ?
  `;

  db.query(checkPatient, [patient_id], (err, patientResult) => {
    if (err) return res.status(500).json(err);

    if (patientResult.length === 0) {
      return res.status(404).json({ msg: "Patient does not exist" });
    }

    // ============================
    //  2) التحقق إذا الدكتور موجود
    // ============================
    const checkDoctor = `
        SELECT * FROM doctor WHERE doctor_id = ?
    `;

    db.query(checkDoctor, [doctor_id], (err, doctorResult) => {
      if (err) return res.status(500).json(err);

      if (doctorResult.length === 0) {
        return res.status(404).json({ msg: "Doctor does not exist" });
      }

      // ============================
      //  3) التحقق من تعارض الموعد
      // ============================
      const checkQuery = `
          SELECT * FROM appointments
          WHERE doctor_id = ?
          AND appointment_datetime = ?
          AND status != 'CANCELLED'
      `;

      db.query(checkQuery, [doctor_id, appointment_datetime], (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length > 0) {
          return res.status(400).json({
            msg: "Doctor is already booked at this time"
          });
        }

        // ============================
        //  4) إدخال الموعد + call_mode
        // ============================
        const insertQuery = `
          INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, call_mode, status, notes)
          VALUES (?, ?, ?, ?, 'PENDING', ?)
        `;

        db.query(
          insertQuery,
          [patient_id, doctor_id, appointment_datetime, call_mode || "video", notes || null],
          (err, result) => {
            if (err) return res.status(500).json(err);

            res.status(201).json({
              msg: "Appointment created successfully (PENDING)",
              appointment_id: result.insertId,
            });
          }
        );
      });
    });
  });
});

// ============================
// GET all appointments
// ============================
router.get("/", (req, res) => {
  const query = `
    SELECT 
      a.id,
      a.patient_id,
      a.doctor_id,
      a.appointment_datetime,
      a.call_mode,              
      a.status,
      a.notes,
      a.created_at,
      a.updated_at,
      
      d.first_name AS doctor_first_name,
      d.last_name AS doctor_last_name,
      d.specialty AS doctor_specialty,

      u.first_name AS patient_first_name,
      u.last_name AS patient_last_name

    FROM appointments a
    LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
    LEFT JOIN users u ON a.patient_id = u.user_id
    ORDER BY a.appointment_datetime ASC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ============================
// جلب مواعيد دكتور معيّن
// GET /appointments/doctor/:doctor_id
// ============================
router.get("/doctor/:doctor_id", (req, res) => {
  const doctorId = req.params.doctor_id;

  const query = `
    SELECT 
      appointments.id,
      appointments.patient_id,
      appointments.doctor_id,
      appointments.appointment_datetime,
      appointments.call_mode,        
      appointments.status,
      appointments.notes,
      appointments.created_at
    FROM appointments
    WHERE appointments.doctor_id = ?
    ORDER BY appointments.appointment_datetime ASC
  `;

  db.query(query, [doctorId], (err, results) => {
    if (err) return res.status(500).json(err);

    res.json({
      doctor_id: doctorId,
      total_appointments: results.length,
      appointments: results
    });
  });
});

// ============================
// جلب المواعيد المعلّقة للدكتور
// GET /appointments/pending/:doctor_id
// ============================
router.get("/pending/:doctor_id", (req, res) => {
  const doctorId = req.params.doctor_id;

  const query = `
    SELECT 
      a.id,
      a.appointment_datetime,
      a.call_mode,                 
      a.notes,
      a.status,

      p.patient_id,
      u.first_name AS patient_first_name,
      u.last_name AS patient_last_name,
      p.phone AS patient_phone

    FROM appointments a
    JOIN patient p ON a.patient_id = p.patient_id
    JOIN users u ON p.user_id = u.user_id

    WHERE a.doctor_id = ?
      AND a.status = 'PENDING'
    ORDER BY a.appointment_datetime ASC
  `;

  db.query(query, [doctorId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ============================
// Approve appointment
// ============================
router.put("/approve/:appointment_id", (req, res) => {
  const id = req.params.appointment_id;

  const query = `
    UPDATE appointments
    SET status = 'APPROVED'
    WHERE id = ?
  `;

  db.query(query, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "Appointment approved" });
  });
});

// ============================
// Reject appointment
// ============================
router.put("/reject/:appointment_id", (req, res) => {
  const id = req.params.appointment_id;

  const query = `
    UPDATE appointments
    SET status = 'REJECTED'
    WHERE id = ?
  `;

  db.query(query, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "Appointment rejected" });
  });
});

// ============================
// المواعيد المتاحة للدكتور
// ============================
router.get("/available-all/:doctor_id", (req, res) => {
  const doctor_id = req.params.doctor_id;

  const availabilityQuery = `
    SELECT * FROM doctor_availability
    WHERE doctor_id = ?
  `;

  db.query(availabilityQuery, [doctor_id], (err, availability) => {
    if (err) return res.status(500).json(err);

    if (availability.length === 0) {
      return res.status(404).json({ msg: "No availability found for this doctor" });
    }

    const daysMap = {
      "Sunday": 0,
      "Monday": 1,
      "Tuesday": 2,
      "Wednesday": 3,
      "Thursday": 4,
      "Friday": 5,
      "Saturday": 6
    };

    let upcomingWeek = [];

    availability.forEach(a => {
      let today = new Date();

      while (today.getDay() !== daysMap[a.day_of_week]) {
        today.setDate(today.getDate() + 1);
      }

      const dateStr = today.toISOString().split("T")[0];

      upcomingWeek.push({
        doctor_id,
        day: a.day_of_week,
        date: dateStr,
        start: a.start_time,
        end: a.end_time
      });
    });

    const dates = upcomingWeek.map(d => d.date);

    const bookedQuery = `
      SELECT appointment_datetime
      FROM appointments
      WHERE doctor_id = ?
      AND DATE(appointment_datetime) IN (?)
    `;

    db.query(bookedQuery, [doctor_id, dates], (err, booked) => {
      if (err) return res.status(500).json(err);

      const bookedMap = booked.map(b =>
        b.appointment_datetime.toISOString().slice(0, 16)
      );

      let final = [];

      upcomingWeek.forEach(day => {
        let slots = [];
        let start = new Date(`${day.date} ${day.start}`);
        let end = new Date(`${day.date} ${day.end}`);

        let current = new Date(start);

        while (current < end) {
          let slotStr = current.toISOString().slice(0, 16);

          if (!bookedMap.includes(slotStr)) {
            slots.push(slotStr.slice(11, 16));
          }

          current.setMinutes(current.getMinutes() + 30);
        }

        final.push({
          day: day.day,
          date: day.date,
          slots
        });
      });

      res.json({ doctor_id, available: final });
    });
  });
});
// ============================
// Translation API
// POST /appointments/translate
// ============================
router.post("/translate", async (req, res) => {
  try {
    const { text, target } = req.body;

    if (!text || !target) {
      return res.status(400).json({ msg: "text and target are required" });
    }

    const result = await translate(text, { to: target });

    res.json({
      original: text,
      translated: result,
      target_language: target
    });

  } catch (error) {
    res.status(500).json({
      msg: "Translation failed",
      error: error.message
    });
  }
});


module.exports = router;
