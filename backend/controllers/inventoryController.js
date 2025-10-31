const db = require('../db');

// -------------------------
// Add a new inventory product
// -------------------------
exports.addProduct = async (req, res) => {
  const { salon_id, product_name, product_quantity, product_price } = req.body;

  if (!salon_id || !product_name || product_quantity == null || !product_price) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    // Check ownership
    const [salon] = await db.promise().query(
      "SELECT * FROM salon WHERE salon_id = ? AND user_id = ? AND is_deleted = 0",
      [salon_id, req.user.user_id]
    );
    if (!salon.length) {
      return res.status(403).json({ success: false, message: "Unauthorized: You do not own this salon" });
    }

    const [result] = await db.promise().query(
      `INSERT INTO inventory (salon_id, product_name, product_quantity, product_price, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [salon_id, product_name, product_quantity, product_price]
    );

    res.status(201).json({ success: true, message: "Product added", inventory_id: result.insertId });
  } catch (err) {
    console.error("Add inventory error:", err);
    res.status(500).json({ success: false, message: "Database error while adding product" });
  }
};

// -------------------------
// Get all products for a salon
// -------------------------
exports.getProductsBySalon = async (req, res) => {
  const salon_id = Number(req.params.salon_id);
  if (!salon_id) return res.status(400).json({ success: false, message: "Invalid salon ID" });

  try {
    const [products] = await db.promise().query(
      "SELECT * FROM inventory WHERE salon_id = ? ORDER BY created_at DESC",
      [salon_id]
    );
    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("Fetch inventory error:", err);
    res.status(500).json({ success: false, message: "Database error while fetching products" });
  }
};

// -------------------------
// Update a product
// -------------------------
exports.updateProduct = async (req, res) => {
  const inventory_id = Number(req.params.inventory_id);
  const { product_name, product_quantity, product_price } = req.body;
  if (!inventory_id) return res.status(400).json({ success: false, message: "Invalid inventory ID" });

  try {
    // Check ownership
    const [inventory] = await db.promise().query(
      `SELECT i.* FROM inventory i
       JOIN salon s ON i.salon_id = s.salon_id
       WHERE i.inventory_id = ? AND s.user_id = ?`,
      [inventory_id, req.user.user_id]
    );
    if (!inventory.length) return res.status(403).json({ success: false, message: "Unauthorized or product not found" });

    const [result] = await db.promise().query(
      "UPDATE inventory SET product_name = ?, product_quantity = ?, product_price = ?, updated_at = NOW() WHERE inventory_id = ?",
      [product_name, product_quantity, product_price, inventory_id]
    );

    res.status(200).json({ success: true, message: "Product updated successfully" });
  } catch (err) {
    console.error("Update inventory error:", err);
    res.status(500).json({ success: false, message: "Database error while updating product" });
  }
};

// -------------------------
// Delete a product
// -------------------------
exports.deleteProduct = async (req, res) => {
  const inventory_id = Number(req.params.inventory_id);
  if (!inventory_id) return res.status(400).json({ success: false, message: "Invalid inventory ID" });

  try {
    // Check ownership
    const [inventory] = await db.promise().query(
      `SELECT i.* FROM inventory i
       JOIN salon s ON i.salon_id = s.salon_id
       WHERE i.inventory_id = ? AND s.user_id = ?`,
      [inventory_id, req.user.user_id]
    );
    if (!inventory.length) return res.status(403).json({ success: false, message: "Unauthorized or product not found" });

    await db.promise().query(
      "DELETE FROM inventory WHERE inventory_id = ?",
      [inventory_id]
    );

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete inventory error:", err);
    res.status(500).json({ success: false, message: "Database error while deleting product" });
  }
};
