const db = require('../db');

// -------------------------
// Get Staff for Owner
// -------------------------
exports.getStaff = async (req, res) => {
  const ownerId = req.user.user_id;
  try {
    const [rows] = await db.promise().query(
      `SELECT s.staff_id, s.name, s.email, s.phone_number, s.salon_id, s.branch_id, 
              s.staff_role, s.staff_status, s.created_at, s.updated_at
       FROM staff s
       JOIN salon sa ON s.salon_id = sa.salon_id
       WHERE sa.user_id = ? AND s.is_deleted = 0
       ORDER BY s.created_at DESC`,
      [ownerId]
    );
    res.status(200).json({ success: true, staff: rows });
  } catch (err) {
    console.error('GetStaff Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// -------------------------
// ✅ Get Staff by Salon ID (Public — customer साठी)
// -------------------------
exports.getStaffBySalon = async (req, res) => {
  const salon_id = Number(req.params.salon_id);

  if (!salon_id) {
    return res.status(400).json({ success: false, message: 'Invalid salon ID' });
  }

  try {
    const [staff] = await db.promise().query(
      `SELECT staff_id, 
              name AS staff_name, 
              staff_role, 
              staff_status
       FROM staff
       WHERE salon_id = ? 
         AND is_deleted = 0 
         AND staff_status = 'Active'
       ORDER BY name ASC`,
      [salon_id]
    );

    res.status(200).json({ success: true, data: staff });
  } catch (err) {
    console.error('GetStaffBySalon Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// -------------------------
// Add Staff
// -------------------------
exports.addStaff = async (req, res) => {
  const ownerId = req.user.user_id;
  let { salon_id, branch_id, name, email, phone_number, staff_role } = req.body;

  if (!salon_id || !name || !email || !phone_number || !staff_role) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const [salon] = await db.promise().query(
      `SELECT salon_id FROM salon WHERE salon_id=? AND user_id=? AND is_deleted=0`,
      [salon_id, ownerId]
    );
    if (!salon.length) {
      return res.status(403).json({ success: false, message: 'Unauthorized to add staff to this salon.' });
    }

    if (!branch_id) {
      const [mainBranch] = await db.promise().query(
        `SELECT branch_id FROM branch WHERE salon_id=? AND is_deleted=0 ORDER BY is_main DESC LIMIT 1`,
        [salon_id]
      );
      branch_id = mainBranch.length ? mainBranch[0].branch_id : null;
    }

    const [result] = await db.promise().query(
      `INSERT INTO staff (name, email, phone_number, salon_id, branch_id, staff_role, staff_status, created_at, updated_at, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, 'Active', NOW(), NOW(), 0)`,
      [name, email, phone_number, salon_id, branch_id, staff_role]
    );

    res.status(201).json({ success: true, message: 'Staff added successfully.', staff_id: result.insertId });
  } catch (err) {
    console.error('AddStaff Error:', err);
    res.status(500).json({ success: false, message: 'Database error while adding staff.' });
  }
};

// -------------------------
// Update Staff
// -------------------------
exports.updateStaff = async (req, res) => {
  const ownerId = req.user.user_id;
  const { staff_id } = req.params;
  let { name, email, phone_number, salon_id, branch_id, staff_role, staff_status } = req.body;

  if (!name || !email || !phone_number || !salon_id || !staff_role || !staff_status) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const [staff] = await db.promise().query(
      `SELECT s.staff_id FROM staff s
       JOIN salon sa ON s.salon_id = sa.salon_id
       WHERE s.staff_id = ? AND sa.user_id = ? AND s.is_deleted=0`,
      [staff_id, ownerId]
    );
    if (!staff.length) {
      return res.status(404).json({ success: false, message: 'Staff not found or unauthorized' });
    }

    if (!branch_id) {
      const [mainBranch] = await db.promise().query(
        `SELECT branch_id FROM branch WHERE salon_id=? AND is_deleted=0 ORDER BY is_main DESC LIMIT 1`,
        [salon_id]
      );
      branch_id = mainBranch.length ? mainBranch[0].branch_id : null;
    }

    await db.promise().query(
      `UPDATE staff
       SET name=?, email=?, phone_number=?, salon_id=?, branch_id=?, staff_role=?, staff_status=?, updated_at=NOW()
       WHERE staff_id=?`,
      [name, email, phone_number, salon_id, branch_id, staff_role, staff_status, staff_id]
    );

    res.status(200).json({ success: true, message: 'Staff updated successfully.', staff_id });
  } catch (err) {
    console.error('UpdateStaff Error:', err);
    res.status(500).json({ success: false, message: 'Database error while updating staff.' });
  }
};

// -------------------------
// Delete Staff (Soft Delete)
// -------------------------
exports.deleteStaff = async (req, res) => {
  const ownerId = req.user.user_id;
  const { staff_id } = req.params;

  try {
    const [staff] = await db.promise().query(
      `SELECT s.staff_id FROM staff s
       JOIN salon sa ON s.salon_id = sa.salon_id
       WHERE s.staff_id=? AND sa.user_id=? AND s.is_deleted=0`,
      [staff_id, ownerId]
    );
    if (!staff.length) {
      return res.status(404).json({ success: false, message: 'Staff not found or unauthorized' });
    }

    await db.promise().query(
      `UPDATE staff SET is_deleted=1, updated_at=NOW() WHERE staff_id=?`,
      [staff_id]
    );

    res.status(200).json({ success: true, message: 'Staff deleted successfully.' });
  } catch (err) {
    console.error('DeleteStaff Error:', err);
    res.status(500).json({ success: false, message: 'Database error while deleting staff.' });
  }
};