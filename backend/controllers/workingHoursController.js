const db = require("../db");

// ----------------------
// Add or update working hours for a branch (owner-only)
// ----------------------
exports.setWorkingHours = async (req, res) => {
  const { branch_id, day_of_week, opening_time, closing_time } = req.body;

  if (!branch_id || !day_of_week) {
    return res.status(400).json({ success: false, message: "branch_id and day_of_week are required" });
  }

  try {
    // Verify branch ownership
    const [branchResults] = await db.promise().query(
      `SELECT b.branch_id 
       FROM branch b
       JOIN salon s ON b.salon_id = s.salon_id
       WHERE b.branch_id = ? AND s.user_id = ?`,
      [branch_id, req.user.id]
    );

    if (branchResults.length === 0) {
      return res.status(403).json({ success: false, message: "Unauthorized to set hours for this branch" });
    }

    // Normalize times: set null if empty string
    const open = opening_time?.trim() || null;
    const close = closing_time?.trim() || null;

    // Upsert: check if record exists
    const [existing] = await db.promise().query(
      `SELECT * FROM working_hours WHERE branch_id = ? AND day_of_week = ?`,
      [branch_id, day_of_week]
    );

    if (existing.length > 0) {
      await db.promise().query(
        `UPDATE working_hours
         SET opening_time = ?, closing_time = ?
         WHERE branch_id = ? AND day_of_week = ?`,
        [open, close, branch_id, day_of_week]
      );
    } else {
      await db.promise().query(
        `INSERT INTO working_hours (branch_id, day_of_week, opening_time, closing_time)
         VALUES (?, ?, ?, ?)`,
        [branch_id, day_of_week, open, close]
      );
    }

    res.status(200).json({
      success: true,
      message: "Working hours saved successfully",
      data: { branch_id, day_of_week, opening_time: open, closing_time: close },
    });
  } catch (error) {
    console.error("Error setting working hours:", error);
    res.status(500).json({ success: false, message: "Database error while setting working hours" });
  }
};

// ----------------------
// Get working hours for a branch (owner-only)
// ----------------------
exports.getWorkingHours = async (req, res) => {
  const branch_id = Number(req.params.branch_id);
  if (!branch_id) return res.status(400).json({ success: false, message: "Invalid branch ID" });

  try {
    // Verify ownership
    const [branchResults] = await db.promise().query(
      `SELECT b.branch_id 
       FROM branch b
       JOIN salon s ON b.salon_id = s.salon_id
       WHERE b.branch_id = ? AND s.user_id = ?`,
      [branch_id, req.user.id]
    );

    if (branchResults.length === 0) {
      return res.status(403).json({ success: false, message: "Unauthorized to view hours for this branch" });
    }

    const [hours] = await db.promise().query(
      `SELECT day_of_week, opening_time, closing_time
       FROM working_hours
       WHERE branch_id = ?
       ORDER BY FIELD(day_of_week, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")`,
      [branch_id]
    );

    res.status(200).json({ success: true, branch_id, data: hours });
  } catch (error) {
    console.error("Error fetching working hours:", error);
    res.status(500).json({ success: false, message: "Database error while fetching working hours" });
  }
};

// ----------------------
// Public API: Get working hours for customers
// ----------------------
exports.getPublicWorkingHours = async (req, res) => {
  const branch_id = Number(req.params.branch_id);
  if (!branch_id) return res.status(400).json({ success: false, message: "Invalid branch ID" });

  try {
    const [hours] = await db.promise().query(
      `SELECT day_of_week, opening_time, closing_time
       FROM working_hours
       WHERE branch_id = ?
       ORDER BY FIELD(day_of_week, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")`,
      [branch_id]
    );

    res.status(200).json({ success: true, branch_id, data: hours });
  } catch (error) {
    console.error("Error fetching public working hours:", error);
    res.status(500).json({ success: false, message: "Database error while fetching working hours" });
  }
};
