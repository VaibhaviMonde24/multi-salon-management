const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// Customer: submit a new contact message
router.post("/", contactController.saveContactMessage);

// Admin: fetch all contact messages
router.get("/", contactController.getAllContacts);

// Admin: fetch a single message by ID
router.get("/:id", contactController.getContactById);

// Admin: delete a message
router.delete("/:id", contactController.deleteContact);

module.exports = router;
