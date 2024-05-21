const express = require("express");
const { getDb } = require("../db");
const cors = require("cors");
const { respondWith400 } = require("../util/responses");

const router = express.Router();
router.use(cors());

const noImageSrc =
  "https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg";

router.post("/", async (req, res) => {
  let { amount, course, name, department, src } = req.body;

  if (!Number.isInteger(amount)) {
    amount = parseInt(amount);
    if (isNaN(amount)) {
      respondWith400(res, "Amount value has to be numerical");
      return;
    }
  }
  if (amount < 0) {
    respondWith400(res, "Amount has to be non-negative");
    return;
  }

  const db = getDb();
  const books = db.collection("books");

  const newBook = {
    amount,
    course,
    name,
    department,
    src: src ?? noImageSrc,
  };

  try {
    const bookResponse = await books.insertOne(newBook);
    if (!bookResponse) {
      respondWith400(res, `Failed to insert the new book into database`);
      return;
    }
    res.status(200).json({ message: "Book added successfully" });
  } catch (error) {
    respondWith400(
      res,
      `Failed to insert the new book into database. Error: ${error.message}`
    );
  }
});

module.exports = router;
