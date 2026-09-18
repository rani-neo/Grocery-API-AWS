const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const {
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const dynamoDB = require("../config/dynamodb");
const { verifyToken } = require("../middleware/authMiddleware");

const TABLE_NAME =
  process.env.EMPLOYEES_TABLE || "GroceryEmployees";

// GET ALL EMPLOYEES
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    // Never return password hashes
    const employees = (result.Items || []).map(
      ({ Password, ...employee }) => employee
    );

    res.json(employees);
  } catch (err) {
    console.error("Get employees error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// GET ONE EMPLOYEE BY USERNAME
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const Username = req.params.id;

    const result = await dynamoDB.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          Username,
        },
      })
    );

    if (!result.Item) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Do not expose password hash
    const { Password, ...employee } = result.Item;

    res.json(employee);
  } catch (err) {
    console.error("Get employee error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// CREATE EMPLOYEE
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      Username,
      Password,
      Empid,
      Role,
    } = req.body;

    if (!Username || !Password) {
      return res.status(400).json({
        message: "Username and Password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(
      Password,
      10
    );

    const employee = {
      Username,
      Password: hashedPassword,
      Role: Role || "user",
    };

    if (Empid !== undefined) {
      employee.Empid = Number(Empid);
    }

    await dynamoDB.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: employee,
        ConditionExpression:
          "attribute_not_exists(Username)",
      })
    );

    // Don't send Password back
    const {
      Password: hiddenPassword,
      ...safeEmployee
    } = employee;

    res.status(201).json(safeEmployee);
  } catch (err) {
    if (
      err.name === "ConditionalCheckFailedException"
    ) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    console.error("Create employee error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// UPDATE EMPLOYEE
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const Username = req.params.id;

    const {
      Empid,
      Role,
    } = req.body;

    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLE_NAME,

        Key: {
          Username,
        },

        UpdateExpression:
          "SET Empid = :empid, #role = :role",

        ExpressionAttributeNames: {
          "#role": "Role",
        },

        ExpressionAttributeValues: {
          ":empid": Number(Empid),
          ":role": Role || "user",
        },

        ConditionExpression:
          "attribute_exists(Username)",

        ReturnValues: "ALL_NEW",
      })
    );

    const {
      Password,
      ...safeEmployee
    } = result.Attributes;

    res.json(safeEmployee);
  } catch (err) {
    if (
      err.name === "ConditionalCheckFailedException"
    ) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    console.error("Update employee error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// DELETE EMPLOYEE
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const Username = req.params.id;

    await dynamoDB.send(
      new DeleteCommand({
        TableName: TABLE_NAME,

        Key: {
          Username,
        },

        ConditionExpression:
          "attribute_exists(Username)",
      })
    );

    res.json({
      message: "Employee deleted",
    });
  } catch (err) {
    if (
      err.name === "ConditionalCheckFailedException"
    ) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    console.error("Delete employee error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;