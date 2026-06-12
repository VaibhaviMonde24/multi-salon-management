const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const salonController = require("../controllers/salonController");

// ----------------------
// Public routes
// ----------------------
router.get("/all", salonController.getAllSalons);
router.get("/search", salonController.searchSalons); // <-- public search
router.get("/by-service/:serviceId", salonController.getSalonsByService);
router.get("/public/:salon_id", salonController.getPublicSalonById);

// ----------------------
// Owner-only routes (authenticated)
// ----------------------
router.use(authenticateToken);
router.get("/dropdown", salonController.getOwnerSalonsDropdown);
router.get("/", salonController.getOwnerSalons);
router.get("/:salon_id", salonController.getSalonById);
router.post("/", salonController.createSalon);
router.put("/:salon_id", salonController.updateSalon);
router.delete("/:salon_id", salonController.deleteSalon);
router.get("/:salon_id/services", salonController.getServicesBySalon);
router.get("/:salon_id/branches", salonController.getBranchesBySalon);

module.exports = router;
