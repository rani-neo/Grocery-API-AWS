const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const {
  GetCommand,
  PutCommand
} = require("@aws-sdk/lib-dynamodb");

const dynamoDB = require("../config/dynamodb");

const router = express.Router();

require("dotenv").config();

const SECRET = process.env.JWT_SECRET || "mySecretKey";

const TABLE_NAME =
  process.env.EMPLOYEES_TABLE || "GroceryEmployees";


// LOGIN
router.post("/login", async (req, res) => {
  const { Username, Password } = req.body;

  if (!Username || !Password) {
    return res.status(400).json({
      message: "Username and Password are required"
    });
  }

  try {
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          Username: Username
        }
      })
    );

    const employee = result.Item;

    if (!employee) {
      return res.status(401).json({
        message: "Invalid username"
      });
    }

    const isMatch = await bcrypt.compare(
      Password,
      employee.Password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      {
        id: employee.Username,
        role: employee.Role || "user"
      },
      SECRET,
      {
        expiresIn: "1h"
      }
    );

    res.json({
      token
    });

  } catch (err) {
    console.error("Login error:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
});


// REGISTER
router.post("/register", async (req, res) => {
  const {
    Username,
    Password,
    Empid,
    Role
  } = req.body;

  if (!Username || !Password) {
    return res.status(400).json({
      message: "Username and Password are required"
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(
      Password,
      10
    );

    const employee = {
      Username,
      Password: hashedPassword,
      Role: Role || "user"
    };

    if (Empid !== undefined) {
      employee.Empid = Number(Empid);
    }

    await dynamoDB.send(
      new PutCommand({
        TableName: TABLE_NAME,

        Item: employee,

        // Username must be unique
        ConditionExpression:
          "attribute_not_exists(Username)"
      })
    );

    res.status(201).json({
      message: "Employee registered successfully"
    });

  } catch (err) {

    if (
      err.name === "ConditionalCheckFailedException"
    ) {
      return res.status(400).json({
        message: "Username already exists"
      });
    }

    console.error("Registration error:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;