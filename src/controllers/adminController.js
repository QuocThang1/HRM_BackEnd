const { detailEmployeeService, updateEmployeeService, deleteEmployeeService } = require("../services/adminService.js");

const detailEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await detailEmployeeService(id);
        if (result.EC !== 0) {
            return res.status(404).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            EC: 2,
            EM: "Server error",
        });
    }
};

const updateEmloyee = async (req, res) => {
    const staffId = req.params.id; // ID nhận từ URL
    const updateData = req.body; // dữ liệu update gửi từ frontend

    const result = await updateEmployeeService(staffId, updateData);

    if (result.success) {
        return res.status(200).json({
            message: "Staff updated successfully",
            staff: result.staff,
        });
    } else {
        return res.status(404).json({ message: result.message });
    }
};

const deleteEmployee = async (req, res) => {
    const staffId = req.params.id; // ID nhận từ route /api/staff/:id

    const result = await deleteEmployeeService(staffId);

    if (result.success) {
        return res.status(200).json({ message: "Staff deleted successfully", staff: result.staff });
    } else {
        return res.status(404).json({ message: result.message });
    }
};


module.exports = {
    detailEmployee,
    updateEmloyee,
    deleteEmployee,
};