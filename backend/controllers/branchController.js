const db = require('../db');

// -------------------------
// Create a new branch
// -------------------------
exports.createBranch = async (req, res) => {
  let { salon_id, branch_name, address, contact_number, branch_email } = req.body;
  salon_id = Number(salon_id);
  branch_name = branch_name?.trim();
  address = address?.trim();

  if (!salon_id || !branch_name || !address) {
    return res.status(400).json({ success: false, message: "Salon ID, branch name, and address are required." });
  }

  try {
    // OWNER CHECK
    const [salon] = await db.promise().query(
      "SELECT * FROM salon WHERE salon_id = ? AND is_deleted = 0",
      [salon_id]
    );
    if (!salon.length || salon[0].user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: "Unauthorized to add branch for this salon" });
    }

    const [result] = await db.promise().query(
      `INSERT INTO branch 
       (salon_id, branch_name, address, contact_number, branch_email, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [salon_id, branch_name, address, contact_number || null, branch_email || null]
    );

    res.status(201).json({ success: true, message: "Branch created successfully", data: { branch_id: result.insertId } });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "Branch contact number or email already exists." });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Get all branches (optional salon filter)
// -------------------------
exports.getBranches = async (req, res) => {
  const salon_id = req.query.salon_id ? Number(req.query.salon_id) : null;
  if (req.query.salon_id && isNaN(salon_id)) {
    return res.status(400).json({ success: false, message: "Salon ID must be a number" });
  }

  try {
    let query = `
      SELECT b.*, s.salon_name, s.city, s.category 
      FROM branch b
      JOIN salon s ON b.salon_id = s.salon_id
      WHERE b.is_deleted = 0
    `;
    const params = [];

    if (salon_id) {
      query += " AND b.salon_id = ?";
      params.push(salon_id);
    }

    query += " ORDER BY b.created_at DESC";

    const [rows] = await db.promise().query(query, params);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Get a single branch by ID
// -------------------------
exports.getBranchById = async (req, res) => {
  const branch_id = Number(req.params.branch_id);
  if (!branch_id) return res.status(400).json({ success: false, message: "Invalid branch ID" });

  try {
    const [rows] = await db.promise().query(
      `SELECT b.*, s.salon_name, s.city, s.category 
       FROM branch b
       JOIN salon s ON b.salon_id = s.salon_id
       WHERE b.branch_id = ? AND b.is_deleted = 0`,
      [branch_id]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: "Branch not found" });

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Update a branch
// -------------------------
exports.updateBranch = async (req, res) => {
  const branch_id = Number(req.params.branch_id);
  if (!branch_id) return res.status(400).json({ success: false, message: "Invalid branch ID" });

  let { branch_name, address, contact_number, branch_email } = req.body;
  branch_name = branch_name?.trim();
  address = address?.trim();

  if (!branch_name || !address) return res.status(400).json({ success: false, message: "Branch name and address are required" });

  try {
    // OWNER CHECK
    const [branch] = await db.promise().query(
      `SELECT b.*, s.user_id 
       FROM branch b 
       JOIN salon s ON b.salon_id = s.salon_id 
       WHERE b.branch_id = ? AND b.is_deleted = 0`,
      [branch_id]
    );
    if (!branch.length || branch[0].user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this branch" });
    }

    const [result] = await db.promise().query(
      `UPDATE branch 
       SET branch_name = ?, address = ?, contact_number = ?, branch_email = ?, updated_at = NOW()
       WHERE branch_id = ? AND is_deleted = 0`,
      [branch_name, address, contact_number || null, branch_email || null, branch_id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Branch not found or deleted" });

    res.status(200).json({ success: true, message: "Branch updated successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ success: false, message: "Branch contact number or email already exists." });
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Soft delete a branch
// -------------------------
exports.deleteBranch = async (req, res) => {
  const branch_id = Number(req.params.branch_id);
  if (!branch_id) return res.status(400).json({ success: false, message: "Invalid branch ID" });

  try {
    // OWNER CHECK
    const [branch] = await db.promise().query(
      `SELECT b.*, s.user_id 
       FROM branch b 
       JOIN salon s ON b.salon_id = s.salon_id 
       WHERE b.branch_id = ? AND b.is_deleted = 0`,
      [branch_id]
    );
    if (!branch.length || branch[0].user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this branch" });
    }

    const [result] = await db.promise().query(
      `UPDATE branch SET is_deleted = 1, updated_at = NOW() WHERE branch_id = ? AND is_deleted = 0`,
      [branch_id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Branch not found" });

    res.status(200).json({ success: true, message: "Branch deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
