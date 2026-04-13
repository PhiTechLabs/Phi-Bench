import Employee from "../models/Employee.js";

// ➕ Add Employee
export const addEmployee = async (req, res) => {
    try {
        console.log("Incoming Data:", req.body); // DEBUG

        const employee = await Employee.create(req.body);

        res.status(201).json({
        message: "Employee added successfully",
        employee
        });
    } catch (error) {
        res.status(500).json({
        message: error.message
        });
    }
    };

    // 📥 Get All Employees
    export const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();

        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({
        message: error.message
        });
    }
};