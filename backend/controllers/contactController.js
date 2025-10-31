const db = require("../db");

// -------------------------
// Save Contact Message (from Contact Us page)
// -------------------------
exports.saveContactMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    await db.promise().query(
      `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`,
      [name, email, message]
    );
    res
      .status(201)
      .json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    console.error("Save Contact Message Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// -------------------------
// Get all contact messages (Admin)
// -------------------------
exports.getAllContacts = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT id, name, email, message, created_at
       FROM contacts
       ORDER BY created_at DESC`
    );
    res.status(200).json({ success: true, contacts: rows });
  } catch (err) {
    console.error("Get All Contacts Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// -------------------------
// Delete a contact message (Admin)
// -------------------------
exports.deleteContact = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db
      .promise()
      .query(`DELETE FROM contacts WHERE id = ?`, [id]);

    if (!result.affectedRows) {
      return res
        .status(404)
        .json({ success: false, message: "Contact message not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Contact message deleted successfully" });
  } catch (err) {
    console.error("Delete Contact Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};
// -------------------------
// Get single contact message (Admin)
// -------------------------
exports.getContactById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.promise().query(
      `SELECT id, name, email, message, created_at 
       FROM contacts WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.status(200).json({ success: true, contact: rows[0] });
  } catch (err) {
    console.error("Get Contact By ID Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};
