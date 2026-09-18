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

const TABLE_NAME = process.env.PRODUCTS_TABLE || "GroceryProducts";

// GET ALL PRODUCTS
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    res.json(result.Items || []);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET ONE PRODUCT
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const ProductCode = Number(req.params.id);

    if (Number.isNaN(ProductCode)) {
      return res.status(400).json({
        message: "ProductCode must be a number",
      });
    }

    const result = await dynamoDB.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          ProductCode,
        },
      })
    );

    if (!result.Item) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(result.Item);
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({ message: err.message });
  }
});

// CREATE PRODUCT
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      ProductCode,
      ProductName,
      ProductQuantity,
      Product_price,
    } = req.body;

    if (
      ProductCode === undefined ||
      !ProductName ||
      ProductQuantity === undefined ||
      Product_price === undefined
    ) {
      return res.status(400).json({
        message:
          "ProductCode, ProductName, ProductQuantity and Product_price are required",
      });
    }

    const product = {
      ProductCode: Number(ProductCode),
      ProductName,
      ProductQuantity: Number(ProductQuantity),
      Product_price: Number(Product_price),
    };

    if (
      Number.isNaN(product.ProductCode) ||
      Number.isNaN(product.ProductQuantity) ||
      Number.isNaN(product.Product_price)
    ) {
      return res.status(400).json({
        message: "ProductCode, ProductQuantity and Product_price must be numbers",
      });
    }

    await dynamoDB.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: product,

        // Prevent accidentally replacing an existing ProductCode
        ConditionExpression: "attribute_not_exists(ProductCode)",
      })
    );

    res.status(201).json(product);
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return res.status(409).json({
        message: "ProductCode already exists",
      });
    }

    console.error("Create product error:", err);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PRODUCT
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const ProductCode = Number(req.params.id);

    if (Number.isNaN(ProductCode)) {
      return res.status(400).json({
        message: "ProductCode must be a number",
      });
    }

    const {
      ProductName,
      ProductQuantity,
      Product_price,
    } = req.body;

    if (
      !ProductName ||
      ProductQuantity === undefined ||
      Product_price === undefined
    ) {
      return res.status(400).json({
        message:
          "ProductName, ProductQuantity and Product_price are required",
      });
    }

    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLE_NAME,

        Key: {
          ProductCode,
        },

        UpdateExpression:
          "SET ProductName = :name, ProductQuantity = :quantity, Product_price = :price",

        ExpressionAttributeValues: {
          ":name": ProductName,
          ":quantity": Number(ProductQuantity),
          ":price": Number(Product_price),
        },

        ConditionExpression: "attribute_exists(ProductCode)",
        ReturnValues: "ALL_NEW",
      })
    );

    res.json(result.Attributes);
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    console.error("Update product error:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE PRODUCT
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const ProductCode = Number(req.params.id);

    if (Number.isNaN(ProductCode)) {
      return res.status(400).json({
        message: "ProductCode must be a number",
      });
    }

    await dynamoDB.send(
      new DeleteCommand({
        TableName: TABLE_NAME,

        Key: {
          ProductCode,
        },

        ConditionExpression: "attribute_exists(ProductCode)",
      })
    );

    res.json({
      message: "Product deleted",
    });
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    console.error("Delete product error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;