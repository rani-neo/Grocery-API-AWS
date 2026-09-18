const express = require("express");
const router = express.Router();

const {
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const dynamoDB = require("../config/dynamodb");
const { verifyToken } = require("../middleware/authMiddleware");

const TABLE_NAME = process.env.ORDERS_TABLE || "GroceryOrders";

// GET ALL ORDERS
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    res.json(result.Items || []);
  } catch (err) {
    console.error("Get orders error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// GET ONE ORDER
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const OrderNo = Number(req.params.id);

    if (Number.isNaN(OrderNo)) {
      return res.status(400).json({
        message: "OrderNo must be a number",
      });
    }

    const result = await dynamoDB.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          OrderNo,
        },
      })
    );

    if (!result.Item) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(result.Item);
  } catch (err) {
    console.error("Get order error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// CREATE ORDER
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      OrderNo,
      OrderDate,
      CustomerNumber,
      ProductCode,
      ProductName,
      ProductQuantity,
      ProductPrice,
      TotalAmount,
      ModeOfPayment,
    } = req.body;

    if (
      OrderNo === undefined ||
      !OrderDate ||
      CustomerNumber === undefined ||
      ProductCode === undefined ||
      !ProductName ||
      ProductQuantity === undefined ||
      ProductPrice === undefined ||
      TotalAmount === undefined ||
      !ModeOfPayment
    ) {
      return res.status(400).json({
        message: "All order fields are required",
      });
    }

    const order = {
      OrderNo: Number(OrderNo),
      OrderDate,
      CustomerNumber: Number(CustomerNumber),
      ProductCode: Number(ProductCode),
      ProductName,
      ProductQuantity: Number(ProductQuantity),
      ProductPrice: Number(ProductPrice),
      TotalAmount: Number(TotalAmount),
      ModeOfPayment,
    };

    const numericFields = [
      order.OrderNo,
      order.CustomerNumber,
      order.ProductCode,
      order.ProductQuantity,
      order.ProductPrice,
      order.TotalAmount,
    ];

    if (numericFields.some(Number.isNaN)) {
      return res.status(400).json({
        message: "Numeric order fields must contain valid numbers",
      });
    }

    await dynamoDB.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: order,
        ConditionExpression: "attribute_not_exists(OrderNo)",
      })
    );

    res.status(201).json(order);
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return res.status(409).json({
        message: "OrderNo already exists",
      });
    }

    console.error("Create order error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// UPDATE ORDER
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const OrderNo = Number(req.params.id);

    if (Number.isNaN(OrderNo)) {
      return res.status(400).json({
        message: "OrderNo must be a number",
      });
    }

    const {
      OrderDate,
      CustomerNumber,
      ProductCode,
      ProductName,
      ProductQuantity,
      ProductPrice,
      TotalAmount,
      ModeOfPayment,
    } = req.body;

    if (
      !OrderDate ||
      CustomerNumber === undefined ||
      ProductCode === undefined ||
      !ProductName ||
      ProductQuantity === undefined ||
      ProductPrice === undefined ||
      TotalAmount === undefined ||
      !ModeOfPayment
    ) {
      return res.status(400).json({
        message: "All order fields are required",
      });
    }

    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLE_NAME,

        Key: {
          OrderNo,
        },

        UpdateExpression:
          "SET OrderDate = :date, CustomerNumber = :customer, ProductCode = :code, ProductName = :name, ProductQuantity = :quantity, ProductPrice = :price, TotalAmount = :total, ModeOfPayment = :payment",

        ExpressionAttributeValues: {
          ":date": OrderDate,
          ":customer": Number(CustomerNumber),
          ":code": Number(ProductCode),
          ":name": ProductName,
          ":quantity": Number(ProductQuantity),
          ":price": Number(ProductPrice),
          ":total": Number(TotalAmount),
          ":payment": ModeOfPayment,
        },

        ConditionExpression: "attribute_exists(OrderNo)",
        ReturnValues: "ALL_NEW",
      })
    );

    res.json(result.Attributes);
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    console.error("Update order error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// DELETE ORDER
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const OrderNo = Number(req.params.id);

    if (Number.isNaN(OrderNo)) {
      return res.status(400).json({
        message: "OrderNo must be a number",
      });
    }

    await dynamoDB.send(
      new DeleteCommand({
        TableName: TABLE_NAME,

        Key: {
          OrderNo,
        },

        ConditionExpression: "attribute_exists(OrderNo)",
      })
    );

    res.json({
      message: "Order deleted successfully",
    });
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    console.error("Delete order error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;