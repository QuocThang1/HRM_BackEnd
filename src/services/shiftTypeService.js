const shiftTypeDAO = require("../DAO/shiftTypeDAO");

const calculateTimeDifference = (fromTime, toTime) => {
    const [fromHour, fromMinute] = fromTime.split(':').map(Number);
    const [toHour, toMinute] = toTime.split(':').map(Number);

    let fromMinutes = fromHour * 60 + fromMinute;
    let toMinutes = toHour * 60 + toMinute;

    // Nếu toTime nhỏ hơn fromTime, nghĩa là ca làm qua ngày (ví dụ: 22:00 - 06:00)
    if (toMinutes < fromMinutes) {
        toMinutes += 24 * 60; // Cộng thêm 24 giờ
    }

    const diffMinutes = toMinutes - fromMinutes;
    const diffHours = diffMinutes / 60;

    return diffHours;
};

const createShiftTypeService = async (shiftData) => {
    try {
        // Kiểm tra shiftCode đã tồn tại chưa
        const existingShift = await shiftTypeDAO.findByShiftCode(shiftData.shiftCode);
        if (existingShift) {
            return { EC: 1, EM: "Shift code already exists" };
        }

        const timeDiff = calculateTimeDifference(shiftData.fromTime, shiftData.toTime);
        if (timeDiff < 6 || timeDiff > 8) {
            return { EC: 2, EM: "Shift duration must be at least 6 hours and at most 8 hours" };
        }

        const newShift = await shiftTypeDAO.createShiftType(shiftData);
        return { EC: 0, EM: "Shift type created successfully", data: newShift };
    } catch (error) {
        console.error("Service Error - createShiftTypeService:", error);
        return { EC: -1, EM: "Error creating shift type" };
    }
};

const getAllShiftTypesService = async () => {
    try {
        const shiftTypes = await shiftTypeDAO.getAllShiftTypes();
        return { EC: 0, EM: "Success", data: shiftTypes };
    } catch (error) {
        console.error("Service Error - getAllShiftTypesService:", error);
        return { EC: -1, EM: "Error fetching shift types" };
    }
};

const getShiftTypeService = async (id) => {
    try {
        const shiftType = await shiftTypeDAO.getShiftTypeById(id);
        if (!shiftType) {
            return { EC: 1, EM: "Shift type not found" };
        }
        return { EC: 0, EM: "Success", data: shiftType };
    } catch (error) {
        console.error("Service Error - getShiftTypeService:", error);
        return { EC: -1, EM: "Error fetching shift type" };
    }
};

const updateShiftTypeService = async (id, data) => {
    try {
        const shiftType = await shiftTypeDAO.getShiftTypeById(id);
        if (!shiftType) {
            return { EC: 1, EM: "Shift type not found" };
        }

        // Kiểm tra nếu thay đổi shiftCode, có bị trùng không
        if (data.shiftCode && data.shiftCode !== shiftType.shiftCode) {
            const existingShift = await shiftTypeDAO.findByShiftCode(data.shiftCode);
            if (existingShift) {
                return { EC: 2, EM: "Shift code already exists" };
            }
        }

        if (data.fromTime || data.toTime) {
            const fromTime = data.fromTime || shiftType.fromTime;
            const toTime = data.toTime || shiftType.toTime;

            const timeDiff = calculateTimeDifference(fromTime, toTime);
            if (timeDiff < 6 || timeDiff > 8) {
                return { EC: 3, EM: "Shift duration must be at least 6 hours and at most 8 hours" };
            }

            const shiftInUse = await shiftTypeDAO.checkShiftTypeInUse(id);
            if (shiftInUse) {
                return {
                    EC: 4,
                    EM: "Cannot update shift time. There are staff members currently scheduled for this shift",
                };
            }
        }

        const updatedShift = await shiftTypeDAO.updateShiftType(id, data);
        return { EC: 0, EM: "Shift type updated successfully", data: updatedShift };
    } catch (error) {
        console.error("Service Error - updateShiftTypeService:", error);
        return { EC: -1, EM: "Error updating shift type" };
    }
};

const deleteShiftTypeService = async (id) => {
    try {
        const shiftType = await shiftTypeDAO.getShiftTypeById(id);
        if (!shiftType) {
            return { EC: 1, EM: "Shift type not found" };
        }

        const shiftInUse = await shiftTypeDAO.checkShiftTypeInUse(id);
        if (shiftInUse) {
            return {
                EC: 2,
                EM: "Cannot delete shift type. There are staff members currently scheduled for this shift",
            };
        }

        await shiftTypeDAO.deleteDepartmentShiftsByShiftType(id);

        await shiftTypeDAO.deleteShiftType(id);
        return { EC: 0, EM: "Shift type deleted successfully" };
    } catch (error) {
        console.error("Service Error - deleteShiftTypeService:", error);
        return { EC: -1, EM: "Error deleting shift type" };
    }
};

module.exports = {
    createShiftTypeService,
    getAllShiftTypesService,
    getShiftTypeService,
    updateShiftTypeService,
    deleteShiftTypeService,
};