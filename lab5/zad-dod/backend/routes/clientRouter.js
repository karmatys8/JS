const express = require("express");
const { getDb } = require("../db");
const cors = require("cors");
const { respondWith200, respondWith400 } = require("../util/responses");

const router = express.Router();
router.use(cors());

/* ------------- */
/* Route 'GET /' */
/* ------------- */
router.get("/", async (req, res) => {
  const db = getDb();

  res.status(200);
  res.send(await db.collection("books").find().toArray());
});

/* ------------- */
/* Route 'POST /borrow' */
/* ------------- */
router.post("/borrow", async (req, res) => {
  const { bookId, userId } = req.body;

  const db = getDb();
  const books = db.collection("books");

  const bookResponse = await books.updateOne(
    { id: bookId },
    { $inc: { amount: -1 } }
  );

  if (!bookResponse) {
    respondWith400(res, "Book does not exist");
  } else {
    const loanHist = db.collection("loanHist");

    const histResponse = await loanHist.insertOne({
      bookId: bookId,
      userId: userId,
      didReturn: false,
    });
    respondWith200(res, "application/json", JSON.stringify(histResponse));
  }
});

/* ------------- */
/* Route 'POST /return' */
/* ------------- */
router.post("/return", async (req, res) => {
  const { bookId, userId } = req.body;
  const db = getDb();
  const books = db.collection("books");
  const users = db.collection("users");
  const loanHist = db.collection("loanHist");

  const usersFound = await users.findOne({ id: userId });

  if (!usersFound) {
    respondWith400(res, `User with provided id: ${userId} does not exist`);
    return;
  }

  const booksFound = await books.findOne({ id: bookId });

  if (!booksFound) {
    respondWith400(res, `Book with provided id: ${bookId} does not exist`);
    return;
  }

  const histFound = await loanHist.findOne({
    bookId: bookId,
    userId: userId,
    didReturn: false,
  });

  if (!histFound) {
    respondWith400(
      res,
      `There is no unreturned book with id: ${bookId} by a user with id: ${userId}`
    );
    return;
  }

  await loanHist.updateOne(
    { _id: histFound._id },
    { $set: { didReturn: true } }
  );

  await books.updateOne({ id: bookId }, { $inc: { amount: 1 } });

  respondWith200(
    res,
    "text/plain; charset=utf-8",
    `Book with id: ${bookId} returned by a user with id: ${userId} successfully`
  );
});

/* ------------- */
/* Route 'POST /reader' */
/* ------------- */
router.post("/reader/:userId", async (req, res) => {
  let { userId } = req.params;

  userId = parseInt(userId);
  if (userId === NaN) {
    respondWith400(res, `User id has to be a number`);
    return;
  }

  const db = getDb();
  const collection = db.collection("users");

  if (!collection.findOne({ id: userId })) {
    respondWith400(res, `User with provided id: ${userId} does not exist`);
    return;
  }

  const data = await db
    .collection("loanHist")
    .find({ userId: userId })
    .toArray();
  respondWith200(res, "application/json", JSON.stringify(data));
});

module.exports = router;
