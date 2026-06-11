const db = require("../db");

// -------------------------
// Create a new salon (Owner-only)
// -------------------------
exports.createSalon = async (req, res) => {
  const user_id = req.user.user_id;
  let {
    salon_name,
    salon_address,
    salon_phone_number,
    salon_email,
    salon_description,
    salon_logo,
    city,
    category,
  } = req.body;

  salon_name = salon_name?.trim();
  salon_address = salon_address?.trim();
  salon_phone_number = salon_phone_number?.trim();
  city = city?.trim();

  if (!salon_name || !salon_address || !salon_phone_number || !city) {
    return res.status(400).json({
      success: false,
      message: "Salon name, address, phone number, and city are required.",
    });
  }

  try {
    // Check if main salon already exists for this owner
    const [mainSalonExists] = await db.promise().query(
      "SELECT * FROM salon WHERE user_id = ? AND is_main = 1 AND is_deleted = 0",
      [user_id]
    );

    const isMain = mainSalonExists.length === 0; // first salon automatically becomes main

    // Insert into salon table
    const [result] = await db.promise().query(
      `INSERT INTO salon 
        (user_id, salon_name, salon_address, salon_phone_number, salon_email, salon_description, salon_logo, city, category, status, is_main, is_deleted, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 0, NOW(), NOW())`,
      [
        user_id,
        salon_name,
        salon_address,
        salon_phone_number,
        salon_email || null,
        salon_description || null,
        salon_logo || null,
        city,
        category || null,
        isMain ? 1 : 0
      ]
    );

    // If this is not main, insert into branch table
    if (!isMain) {
      await db.promise().query(
        `INSERT INTO branch 
          (salon_id, branch_name, address, contact_number, branch_email, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [result.insertId, salon_name, salon_address, salon_phone_number, salon_email || null]
      );
    }

    res.status(201).json({
      success: true,
      message: isMain
        ? "Salon submitted as main for approval"
        : "Branch submitted for approval",
      data: { salon_id: result.insertId },
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Salon phone number or email already exists.",
      });
    }
    console.error("Create Salon Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Get all salons for logged-in owner (with branches)
// -------------------------
exports.getOwnerSalons = async (req, res) => {
  const ownerId = req.user.user_id;

  try {
    const [salons] = await db.promise().query(
      `SELECT s.*, u.username AS owner_name
       FROM salon s
       JOIN user u ON s.user_id = u.user_id
       WHERE s.user_id = ? AND s.is_deleted = 0
       ORDER BY s.created_at DESC`,
      [ownerId]
    );

    // Attach branches
    for (const salon of salons) {
      const [branches] = await db.promise().query(
        `SELECT * FROM branch 
         WHERE salon_id = ? AND is_deleted = 0 
         ORDER BY created_at DESC`,
        [salon.salon_id]
      );
      salon.branches = branches;
    }

    res.status(200).json({ success: true, data: salons });
  } catch (err) {
    console.error("Get Owner Salons Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// -------------------------
// Update a salon (Owner-only)
// -------------------------
exports.updateSalon = async (req, res) => {
  const { salon_id } = req.params;
  const user_id = req.user.user_id;
  const {
    salon_name,
    salon_address,
    salon_phone_number,
    salon_email,
    salon_description,
    salon_logo,
    city,
    category,
    is_main,
  } = req.body;

  if (!salon_id || isNaN(salon_id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid salon ID" });
  }

  try {
    const [salonRows] = await db
      .promise()
      .query(
        "SELECT * FROM salon WHERE salon_id = ? AND user_id = ? AND is_deleted = 0",
        [salon_id, user_id]
      );

    if (!salonRows.length) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized or salon not found" });
    }

    // If this salon is being marked as main
    if (is_main === true || is_main === 1) {
      await db
        .promise()
        .query(
          "UPDATE salon SET is_main = 0 WHERE user_id = ? AND salon_id != ? AND is_deleted = 0",
          [user_id, salon_id]
        );

      await db.promise().query(
        `UPDATE salon 
         SET salon_name=?, salon_address=?, salon_phone_number=?, salon_email=?, 
             salon_description=?, salon_logo=?, city=?, category=?, is_main=1, updated_at=NOW()
         WHERE salon_id=?`,
        [
          salon_name || salonRows[0].salon_name,
          salon_address || salonRows[0].salon_address,
          salon_phone_number || salonRows[0].salon_phone_number,
          salon_email || salonRows[0].salon_email,
          salon_description || salonRows[0].salon_description,
          salon_logo || salonRows[0].salon_logo,
          city || salonRows[0].city,
          category || salonRows[0].category,
          salon_id,
        ]
      );

      // Convert other salons into branches if not already
      const [otherSalons] = await db
        .promise()
        .query(
          "SELECT * FROM salon WHERE user_id = ? AND salon_id != ? AND is_deleted = 0",
          [user_id, salon_id]
        );

      for (const other of otherSalons) {
        const [exists] = await db
          .promise()
          .query(
            "SELECT * FROM branch WHERE salon_id = ? AND branch_name = ?",
            [salon_id, other.salon_name]
          );

        if (!exists.length) {
          await db.promise().query(
            `INSERT INTO branch 
              (salon_id, branch_name, address, contact_number, branch_email, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              salon_id,
              other.salon_name,
              other.salon_address,
              other.salon_phone_number,
              other.salon_email,
            ]
          );
        }
      }

      return res.status(200).json({
        success: true,
        message: "Salon updated as main and branches assigned",
        data: { salon_id: Number(salon_id) },
      });
    }

    // If not main → normal update
    await db.promise().query(
      `UPDATE salon 
       SET salon_name=?, salon_address=?, salon_phone_number=?, salon_email=?, 
           salon_description=?, salon_logo=?, city=?, category=?, updated_at=NOW()
       WHERE salon_id=?`,
      [
        salon_name || salonRows[0].salon_name,
        salon_address || salonRows[0].salon_address,
        salon_phone_number || salonRows[0].salon_phone_number,
        salon_email || salonRows[0].salon_email,
        salon_description || salonRows[0].salon_description,
        salon_logo || salonRows[0].salon_logo,
        city || salonRows[0].city,
        category || salonRows[0].category,
        salon_id,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Salon updated successfully",
      data: { salon_id: Number(salon_id) },
    });
  } catch (err) {
    console.error("Update Salon Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Get all salons (Public)
// -------------------------
exports.getAllSalons = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT salon_id, salon_name, salon_address, salon_phone_number,
              salon_email, salon_description, salon_logo, city, category
       FROM salon
       WHERE is_deleted = 0 AND status = 'approved'
       ORDER BY created_at DESC`
    );

    res.status(200).json({ success: true, salons: rows });
  } catch (err) {
    console.error("Get All Salons Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};
// -------------------------
// Get a single salon by ID (Owner-only)
// -------------------------
exports.getSalonById = async (req, res) => {
  const { salon_id } = req.params;
  const ownerId = req.user.user_id;

  if (!salon_id || isNaN(salon_id)) {
    return res.status(400).json({ success: false, message: "Invalid salon ID" });
  }

  try {
    const [rows] = await db.promise().query(
      `SELECT s.*, u.username AS owner_name
       FROM salon s
       JOIN user u ON s.user_id = u.user_id
       WHERE s.salon_id = ? AND s.user_id = ? AND s.is_deleted = 0`,
      [salon_id, ownerId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }

    // Include branches for this salon
    const [branches] = await db.promise().query(
      `SELECT * FROM branch 
       WHERE salon_id = ? AND is_deleted = 0
       ORDER BY created_at DESC`,
      [salon_id]
    );

    rows[0].branches = branches;

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Get Salon By ID Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// In salonController.js
exports.getOwnerSalonsDropdown = async (req, res) => {
  const ownerId = req.user.user_id;

  try {
    const [rows] = await db.promise().query(
      `SELECT salon_id, salon_name 
       FROM salon 
       WHERE user_id = ? AND is_deleted = 0 
       ORDER BY created_at DESC`,
      [ownerId]
    );

    res.status(200).json({ success: true, salons: rows });
  } catch (err) {
    console.error("getOwnerSalonsDropdown Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};
exports.getBranchesBySalon = async (req, res) => {
  const salon_id = Number(req.params.salon_id);
  if (!salon_id) return res.status(400).json({ success: false, message: "Invalid salon ID" });

  try {
    const [branches] = await db.promise().query(
      `SELECT branch_id, branch_name, is_main 
       FROM branch 
       WHERE salon_id = ? AND is_deleted = 0 
       ORDER BY is_main DESC`,
      [salon_id]
    );

    res.status(200).json({ success: true, data: branches });
  } catch (err) {
    console.error('GetBranchesBySalon Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// -------------------------
// Soft delete a salon (Owner-only)
// -------------------------
exports.deleteSalon = async (req, res) => {
  const { salon_id } = req.params;
  const user_id = req.user.user_id;

  if (!salon_id || isNaN(salon_id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid salon ID" });
  }

  try {
    const [salon] = await db
      .promise()
      .query(
        "SELECT * FROM salon WHERE salon_id = ? AND user_id = ? AND is_deleted = 0",
        [salon_id, user_id]
      );

    if (!salon.length) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized or salon not found" });
    }

    await db
      .promise()
      .query(
        `UPDATE salon SET is_deleted = 1, updated_at = NOW() WHERE salon_id = ?`,
        [salon_id]
      );

    res.status(200).json({
      success: true,
      message: "Salon deleted successfully",
      data: { salon_id: Number(salon_id) },
    });
  } catch (err) {
    console.error("Delete Salon Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.getServicesBySalon = async (req, res) => {
  const salon_id = Number(req.params.salon_id);
  if (!salon_id) return res.status(400).json({ success: false, message: "Invalid salon ID" });

  try {
    const [services] = await db.promise().query(
      `SELECT service_id, service_name, service_price, service_duration
       FROM service
       WHERE salon_id = ? AND is_deleted = 0`,
      [salon_id]
    );
    res.status(200).json({ success: true, data: services });
  } catch (err) {
    console.error("GetServicesBySalon Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// -------------------------
// Search salons (Public)
// -------------------------
exports.searchSalons = async (req, res) => {
  const query = req.query.query;

  if (!query || query.trim() === "") {
    return res.status(200).json({ success: true, salons: [] });
  }

  try {
    const searchQuery = `%${query.toLowerCase()}%`;

    const [rows] = await db.promise().query(
      `SELECT salon_id, salon_name, salon_address, salon_phone_number,
              salon_email, salon_description, salon_logo, city, category
       FROM salon
       WHERE is_deleted = 0
         AND status = 'approved'
         AND (
           LOWER(salon_name) LIKE ? OR
           LOWER(salon_address) LIKE ? OR
           LOWER(city) LIKE ? OR
           LOWER(category) LIKE ?
         )
       ORDER BY created_at DESC`,
      [searchQuery, searchQuery, searchQuery, searchQuery]
    );

    res.status(200).json({ success: true, salons: rows });
  } catch (err) {
    console.error("Search Salons Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};
// -------------------------
// Get salons by service name (Public)
// -------------------------
exports.getSalonsByService = async (req, res) => {
  const serviceId = Number(req.params.serviceId);

  if (!serviceId) {
    return res.status(400).json({ success: false, message: "Invalid service ID" });
  }

  try {
    // पहिले service_name काढ त्या serviceId वरून
    const [[service]] = await db.promise().query(
      `SELECT service_name FROM service WHERE service_id = ? AND is_deleted = 0`,
      [serviceId]
    );

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // मग त्याच नावाची service असलेले सगळे approved salons आण
    const [salons] = await db.promise().query(
      `SELECT DISTINCT s.salon_id, s.salon_name, s.salon_address, 
              s.salon_phone_number, s.salon_logo, s.city, s.category
       FROM salon s
       INNER JOIN service sv ON s.salon_id = sv.salon_id
       WHERE LOWER(TRIM(sv.service_name)) = LOWER(TRIM(?))
         AND s.status = 'approved'
         AND s.is_deleted = 0
         AND sv.is_deleted = 0`,
      [service.service_name]
    );

    res.status(200).json({
      success: true,
      service_name: service.service_name,
      count: salons.length,
      salons: salons
    });

  } catch (err) {
    console.error("GetSalonsByService Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};