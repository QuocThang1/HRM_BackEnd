const express = require("express");
const {
  createDepartmentReview,
  getDepartmentReviews,
  getDepartmentReviewsByAdmin,
  updateDepartmentReview,
  deleteDepartmentReview,
} = require("../controllers/departmentController");

const checkRole = require("../middleware/checkRole");

const routerAPI = express.Router();

routerAPI.get(
  "/reviews/admin",
  checkRole("admin"),
  getDepartmentReviewsByAdmin,
);
routerAPI.put("/reviews/:reviewId", checkRole("admin"), updateDepartmentReview);
routerAPI.delete(
  "/reviews/:reviewId",
  checkRole("admin"),
  deleteDepartmentReview,
);
routerAPI.post("/:id/reviews", checkRole("admin"), createDepartmentReview);
routerAPI.get(
  "/:id/reviews",
  checkRole("admin", "manager"),
  getDepartmentReviews,
);

module.exports = routerAPI;
