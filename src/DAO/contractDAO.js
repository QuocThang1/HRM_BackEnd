const Contract = require("../models/contract");
const mongoose = require("mongoose");
const department = require("../models/department");

class ContractDAO {
    async createContract(data) {
        try {
            const existingContract = await Contract.findOne({
                staffId: data.staffId,
                status: "active",
            });

            if (existingContract) {
                throw new Error("Staff already has an active contract");
            }

            if (data.toDate && data.fromDate && new Date(data.toDate) <= new Date(data.fromDate)) {
                throw new Error("ToDate must be after FromDate");
            }


            const contract = new Contract(data);
            return await contract.save();
        } catch (error) {
            console.error("DAO Error - createContract:", error);
            throw error;
        }
    }

    async getAllContracts() {
        try {
            return await Contract.find()
                .populate("staffId", "personalInfo.fullName personalInfo.email role")
                .populate("createdBy", "personalInfo.fullName")
                .sort({ createdAt: -1 });
        } catch (error) {
            console.error("DAO Error - getAllContracts:", error);
            throw error;
        }
    }

    async getContractById(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid Contract ID");
            }

            return await Contract.findById(id)
                .populate({
                    path: "staffId",
                    select: "personalInfo.fullName personalInfo.email role ",
                    populate: {
                        path: "departmentId",
                        select: "departmentName"
                    }
                })
                .populate("createdBy", "personalInfo.fullName");
        } catch (error) {
            console.error("DAO Error - getContractById:", error);
            throw error;
        }
    }

    async getContractByStaffId(staffId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(staffId)) {
                throw new Error("Invalid Staff ID");
            }

            return await Contract.findOne({ staffId })
                .populate("staffId", "personalInfo.fullName personalInfo.email role")
                .populate("createdBy", "personalInfo.fullName");
        } catch (error) {
            console.error("DAO Error - getContractByStaffId:", error);
            throw error;
        }
    }

    async getContractsByStatus(status) {
        try {
            return await Contract.find({ status })
                .populate("staffId", "personalInfo.fullName personalInfo.email role")
                .populate("createdBy", "personalInfo.fullName")
                .sort({ createdAt: -1 });
        } catch (error) {
            console.error("DAO Error - getContractsByStatus:", error);
            throw error;
        }
    }

    async updateContract(id, data) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid Contract ID");
            }

            if (data.toDate && data.fromDate && new Date(data.toDate) <= new Date(data.fromDate)) {
                throw new Error("ToDate must be after FromDate");
            }

            return await Contract.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            })
                .populate("staffId", "personalInfo.fullName personalInfo.email role")
                .populate("createdBy", "personalInfo.fullName");
        } catch (error) {
            console.error("DAO Error - updateContract:", error);
            throw error;
        }
    }

    async updateContractStatus(id, status) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid Contract ID");
            }

            if (!["active", "expired"].includes(status)) {
                throw new Error("Invalid status");
            }

            return await Contract.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            )
                .populate("staffId", "personalInfo.fullName personalInfo.email role")
                .populate("createdBy", "personalInfo.fullName");
        } catch (error) {
            console.error("DAO Error - updateContractStatus:", error);
            throw error;
        }
    }

    async deleteContract(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid Contract ID");
            }

            return await Contract.findByIdAndDelete(id);
        } catch (error) {
            console.error("DAO Error - deleteContract:", error);
            throw error;
        }
    }

    async autoExpireContracts() {
        try {
            const now = new Date();
            const result = await Contract.updateMany(
                {
                    status: "active",
                    toDate: { $lte: now },
                },
                {
                    status: "expired",
                }
            );

            console.log(`Auto-expired ${result.modifiedCount} contracts`);
            return result;
        } catch (error) {
            console.error("DAO Error - autoExpireContracts:", error);
            throw error;
        }
    }

    async getExpiringContracts(daysUntilExpiry = 30) {
        try {
            const now = new Date();
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + daysUntilExpiry);

            return await Contract.find({
                status: "active",
                toDate: { $gte: now, $lte: futureDate },
            })
                .populate("staffId", "personalInfo.fullName personalInfo.email role")
                .populate("createdBy", "personalInfo.fullName")
                .sort({ toDate: 1 });
        } catch (error) {
            console.error("DAO Error - getExpiringContracts:", error);
            throw error;
        }
    }
}

module.exports = new ContractDAO();