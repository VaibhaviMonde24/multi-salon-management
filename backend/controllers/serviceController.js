const db = require("../db");
// Get all services (public)

exports.getAllServices = async (req, res) => {
  try {
    const [services] = await db.promise().query(
      `SELECT MIN(service_id) as service_id, 
              TRIM(service_name) as service_name 
       FROM service 
       WHERE is_deleted = 0 
       GROUP BY LOWER(TRIM(service_name))
       ORDER BY service_name ASC`
    );
    res.status(200).json({ success: true, data: services });
  } catch (err) {
    console.error("Get All Services Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// -------------------------
// Add a new service (Owner-only)
// -------------------------
exports.addService = async (req, res) => {
  const { salon_id, service_name, service_description, service_price, service_duration } = req.body;
  const user_id = req.user.user_id;

  if (!salon_id || !service_name || !service_price || !service_duration) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }

  try {
    // Verify salon ownership
    const [salon] = await db.promise().query(
      "SELECT * FROM salon WHERE salon_id = ? AND user_id = ? AND is_deleted = 0",
      [salon_id, user_id]
    );
    if (salon.length === 0) {
      return res.status(403).json({ success: false, message: "Unauthorized: You do not own this salon" });
    }

    const [result] = await db.promise().query(
      `INSERT INTO service 
        (salon_id, service_name, service_description, service_price, service_duration, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        salon_id,
        service_name.trim(),
        service_description?.trim() || null,
        service_price,
        service_duration
      ]
    );

    const [[newService]] = await db.promise().query(
      "SELECT * FROM service WHERE service_id = ?",
      [result.insertId]
    );

    res.status(201).json({ success: true, message: "Service added successfully", data: newService });
  } catch (err) {
    console.error("Add Service Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// List all services for a salon
// -------------------------
exports.getServicesBySalon = async (req, res) => {
  const salon_id = Number(req.params.salon_id);
  if (!salon_id) return res.status(400).json({ success: false, message: "Invalid salon ID" });

  try {
    const [services] = await db.promise().query(
      "SELECT * FROM service WHERE salon_id = ? AND is_deleted = 0 ORDER BY created_at DESC",
      [salon_id]
    );
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (err) {
    console.error("Get Services Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Update a service (Owner-only)
// -------------------------
exports.updateService = async (req, res) => {
  const id = Number(req.params.id);
  const { service_name, service_description, service_price, service_duration } = req.body;
  const user_id = req.user.user_id;

  if (!id) return res.status(400).json({ success: false, message: "Invalid service ID" });

  try {
    // Verify ownership
    const [service] = await db.promise().query(
      `SELECT s.* 
       FROM service s
       JOIN salon sa ON s.salon_id = sa.salon_id
       WHERE s.service_id = ? AND sa.user_id = ? AND s.is_deleted = 0 AND sa.is_deleted = 0`,
      [id, user_id]
    );

    if (service.length === 0) {
      return res.status(403).json({ success: false, message: "Unauthorized or service not found" });
    }

    await db.promise().query(
      `UPDATE service 
       SET service_name = ?, service_description = ?, service_price = ?, service_duration = ?, updated_at = NOW()
       WHERE service_id = ?`,
      [
        service_name?.trim() || service[0].service_name,
        service_description?.trim() || service[0].service_description,
        service_price || service[0].service_price,
        service_duration || service[0].service_duration,
        id
      ]
    );

    const [[updated]] = await db.promise().query("SELECT * FROM service WHERE service_id = ?", [id]);
    res.status(200).json({ success: true, message: "Service updated successfully", data: updated });
  } catch (err) {
    console.error("Update Service Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -------------------------
// Delete (soft delete) a service (Owner-only)
// -------------------------
exports.deleteService = async (req, res) => {
  const id = Number(req.params.id);
  const user_id = req.user.user_id;

  if (!id) return res.status(400).json({ success: false, message: "Invalid service ID" });

  try {
    // Verify ownership
    const [service] = await db.promise().query(
      `SELECT s.* 
       FROM service s
       JOIN salon sa ON s.salon_id = sa.salon_id
       WHERE s.service_id = ? AND sa.user_id = ? AND s.is_deleted = 0 AND sa.is_deleted = 0`,
      [id, user_id]
    );

    if (service.length === 0) {
      return res.status(403).json({ success: false, message: "Unauthorized or service not found" });
    }

    await db.promise().query(
      "UPDATE service SET is_deleted = 1, updated_at = NOW() WHERE service_id = ?",
      [id]
    );

    res.status(200).json({ success: true, message: "Service deleted successfully (soft delete)" });
  } catch (err) {
    console.error("Delete Service Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
