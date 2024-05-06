import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

/* *************************** */
/* Configuring the application */
/* *************************** */
const app = express();

app.locals.pretty = app.get("env") === "development"; // The resulting HTML code will be indented in the development environment

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());

let mongoDB;
const mongoConnect = async (callback) => {
  try {
    const client = await MongoClient.connect(
      "mongodb://127.0.0.1:27017/library"
    );
    mongoDB = client.db();

    callback();
  } catch (error) {
    console.error(error);
  }
};

const getDb = () => {
  if (mongoDB) {
    return mongoDB;
  }
  throw "Not connected to mongo";
};

// /**
//  * Safely handle the req callbacks.
//  * @returns {void}
//  */
// async function safeReqProcessing({
//   req,
//   resp,
//   body,
//   initialAction,
//   onEndAction,
// }) {
//   try {
//     await initialAction();

//     req.on("data", (chunk) => {
//       body.push(chunk);
//     });
//     req.on("end", onEndAction);
//   } catch (error) {
//     resp.writeHead(501, {
//       "Content-Type": "text/plain; charset=utf-8",
//     });
//     resp.write(
//       `Error 501: ${error.message ?? "Error while processing req"}`
//     );
//     resp.end();
//   }
// }

/**
 * Send the response when req data is incorrect.
 * @returns {void}
 */
function respondWith400(res, resBody) {
  res.writeHead(400, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.write(`Error 400: ${resBody}`);
  res.end();
}

/**
 * Send the response after successful request and processing.
 * @returns {void}
 */
function respondWith200(res, contentType, resBody) {
  res.writeHead(200, {
    "Content-Type": contentType,
  });
  res.write(resBody);
  res.end();
}

/* ******** */
/* "Routes" */
/* ******** */

/* ------------- */
/* Route 'GET /' */
/* ------------- */
app.get("/", async (req, res) => {
  const db = getDb();

  res.status(200);
  res.send(await db.collection("books").find().toArray());
});

/* ------------- */
/* Route 'POST /borrow' */
/* ------------- */
app.post("/borrow", async (req, res) => {
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
app.post("/return", async (req, res) => {
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
app.post("/reader/:userId", async (req, res) => {
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
    .find({ userId: userId }).toArray();
  respondWith200(res, "application/json", JSON.stringify(data));
});

/* ************************************************ */

mongoConnect(() => {
  app.listen(8008, () => {
    console.log("The server was started on port 8008");
    console.log('To stop the server, press "CTRL + C"');
  });
});
