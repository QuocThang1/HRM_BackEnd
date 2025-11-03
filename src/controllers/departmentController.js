const {
    createDepartmentService,
    getDepartmentsService,
    getDepartmentService,
    updateDepartmentService,
    deleteDepartmentService,
    getAvailableManagersService,
    createDepartmentReviewService,
    getDepartmentReviewsService,
    getDepartmentReviewsByAdminService,
    updateDepartmentReviewService,
    deleteDepartmentReviewService,
    getDepartmentByManagerService
} = require("../services/departmentService");

const createDepartment = async (req, res) => {
    try {
        const { departmentName, description, managerId } = req.body;
        const data = await createDepartmentService(departmentName, description, managerId);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - createDepartment:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getDepartments = async (req, res) => {
    try {
        const data = await getDepartmentsService();
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getDepartments:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getDepartmentService(id);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getDepartment:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { departmentName, description, managerId } = req.body;
        const data = await updateDepartmentService(id, { departmentName, description, managerId });
        res.json(data);
    } catch (error) {
        console.error("Controller Error - updateDepartment:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await deleteDepartmentService(id);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - deleteDepartment:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getAvailableManagers = async (req, res) => {
    try {
        const data = await getAvailableManagersService();
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getAvailableManagers:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const createDepartmentReview = async (req, res) => {
    try {
        const departmentId = req.params.id;
        const { month, score, comments } = req.body;
        const staffId = req.staff._id; // lấy từ middleware

        const data = await createDepartmentReviewService({
            departmentId,
            staffId,
            month,
            score,
            comments,
        });

        res.json(data);
    } catch (error) {
        console.error("Controller Error - createDepartmentReview:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getDepartmentReviews = async (req, res) => {
    try {
        const departmentId = req.params.id;
        const { month } = req.query;
        const data = await getDepartmentReviewsService(departmentId, month);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getDepartmentReviews:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getDepartmentReviewsByAdmin = async (req, res) => {
    try {
        const staffId = req.staff._id;
        const { month } = req.query;
        const data = await getDepartmentReviewsByAdminService(staffId, month);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getDepartmentReviewsByAdmin:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};


const updateDepartmentReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const updatedData = req.body;
        const data = await updateDepartmentReviewService(reviewId, updatedData);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - updateDepartmentReview:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const deleteDepartmentReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const data = await deleteDepartmentReviewService(reviewId);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - deleteDepartmentReview:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

const getDepartmentByManager = async (req, res) => {
    try {
        const managerId = req.staff._id;
        const data = await getDepartmentByManagerService(managerId);
        res.json(data);
    } catch (error) {
        console.error("Controller Error - getDepartmentByManager:", error);
        res.json({ EC: -1, EM: "Internal Server Error" });
    }
};

module.exports = {
    createDepartment,
    getDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment,
    getAvailableManagers,
    createDepartmentReview,
    getDepartmentReviews,
    getDepartmentReviewsByAdmin,
    updateDepartmentReview,
    deleteDepartmentReview,
    getDepartmentByManager
};
