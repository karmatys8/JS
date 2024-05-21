const express = require("express");
const { getDb } = require("../db");
const cors = require("cors");
const { respondWith200, respondWith400 } = require("../util/responses");
const xml = require("xml");

const router = express.Router();
router.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

/* ------------- */
/* Route 'GET /' */
/* ------------- */
router.get("/", async (req, res) => {
  const db = getDb();
  try {
    const books = await db.collection("books").find().toArray();
    const users = await db.collection("users").find().toArray();

    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        const loanHist = await db
          .collection("loanHist")
          .find({ userId: user.id, didReturn: false })
          .toArray();

        return {
          ...user,
          hist: loanHist.map((entry) =>
            books.find((book) => book.id === entry.bookId)
          ),
        };
      })
    );

    res.status(200);
    res.send({ books, users: updatedUsers });
  } catch (err) {
    respondWith400(res, "Error occurred while downloading data");
  }
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

  if (typeof bookId !== "number" || typeof userId !== "number") {
    respondWith400(res, "Incorrect data type");
    return;
  }

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

  const encodedBookId = encodeURIComponent(bookId.toString());
  const encodedUserId = encodeURIComponent(userId.toString());

  respondWith200(
    res,
    "text/plain; charset=utf-8",
    `Book with id: ${encodedBookId} returned by a user with id: ${encodedUserId} successfully`
  );
});

/* ------------- */
/* Route 'POST /reader' */
/* ------------- */
router.post("/reader/:userId", async (req, res) => {
  let { userId } = req.params;

  userId = parseInt(userId);
  if (isNaN(userId)) {
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

/* ------------- */
/* Route 'PATCH /reader' */
/* ------------- */
router.patch("/sell/:bookId", async (req, res) => {
  const { bookId } = req.params;

  const db = getDb();
  const books = db.collection("books");

  const bookResponse = await books.updateOne(
    { id: parseInt(bookId) },
    { $inc: { amount: -1 } }
  );

  if (!bookResponse) {
    respondWith400(res, "Book does not exist");
  } else {
    respondWith200(res, "text/xml", xml("Book bought for 10$"));
  }
});

module.exports = router;
