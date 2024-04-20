import http from "node:http";
import { URL } from "node:url";
import fs from "fs";

/**
 * Path to the file where posts data is stored.
 * @type {string}
 */
const booksFilepath = "./data/books";
/**
 * Array to store books data.
 * @type {Array<Object>}
 */
let booksData = [];

/**
 * Path to the file where posts data is stored.
 * @type {string}
 */
const usersFilepath = "./data/users";
/**
 * Array to store users data.
 * @type {Array<Object>}
 */
let usersData = [];

/**
 * Path to the file where posts data is stored.
 * @type {string}
 */
const loanHistFilepath = "./data/loanHist";
/**
 * Array to store loan history data.
 * @type {Array<Object>}
 */
let loanHistData = [];

/**
 * Reads posts data from the file.
 * @returns {void}
 */
function readData(filepath, dataArray) {
  fs.readFile(filepath, "utf8", (err, data) => {
    if (err) console.error(err);
    dataArray = JSON.parse(data);
  });
}

/**
 * Writes posts data to the file.
 * @returns {void}
 */
function writeData(filepath, dataArray) {
  fs.writeFile(filepath, JSON.stringify(dataArray, null, 2), (err) => {
    console.error(err);
  });
}

/**
 * Safely handle the request callbacks.
 * @returns {void}
 */
function safeRequestProcessing({
  request,
  response,
  body,
  initialAction,
  onEndAction,
}) {
  try {
    initialAction;

    request.on("data", (chunk) => {
      body.push(chunk);
    });
    request.on("end", onEndAction);
  } catch (error) {
    response.writeHead(501, {
      "Content-Type": "text/plain; charset=utf-8",
    });
    response.write(
      `Error 501: ${error.message ?? "Error while processing request"}`
    );
    response.end();
  }
}

/**
 * Send the response when request data is incorrect.
 * @returns {void}
 */
function respondWith400(response, responseBody) {
  response.writeHead(400, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.write(`Error 400: ${responseBody}`);
  response.end();
}

/**
 * Send the response after successful request and processing.
 * @returns {void}
 */
function respondWith200(response, contentType, responseBody) {
  response.writeHead(200, {
    "Content-Type": contentType,
  });
  response.write(responseBody);
  response.end();
}

/**
 * Handles incoming HTTP requests.
 * @param {http.IncomingMessage} request - The request object.
 * @param {http.ServerResponse} response - The response object.
 * @returns {void}
 */
function requestListener(request, response) {
  console.log("--------------------------------------");
  console.log(`The relative URL of the current request: ${request.url}`);
  console.log(`Access method: ${request.method}`);
  console.log("--------------------------------------");

  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname !== "/favicon.ico") console.log(url);

  const body = [];
  switch ([request.method, url.pathname].join(" ")) {
    case "GET /":
      safeRequestProcessing({
        request: request,
        response: response,
        body: body,
        initialAction: () => {
          readData(booksFilepath, booksData);
          readData(usersFilepath, usersData);
          readData(loanHistFilepath, loanHistData);
        },
        onEndAction: () => {
          respondWith200(
            response,
            "application/json",
            JSON.stringify(booksData)
          );
        },
      });
      break;

    case "POST /borrow":
      safeRequestProcessing({
        request: request,
        response: response,
        body: body,
        initialAction: () => {},
        onEndAction: () => {
          const requestData = Buffer.concat(body).toString();

          const { bookId, userId } = requestData;

          if (!booksData.some((book) => book.id === bookId)) {
            respondWith400(
              response,
              `Book with provided id: ${bookId} does not exist`
            );
          }

          if (!usersData.some((user) => user.id === userId)) {
            respondWith400(
              response,
              `User with provided id: ${userId} does not exist`
            );
          }

          const currBook = booksData.find((book) => book.id === bookId);
          if (currBook.amount < 1) {
            respondWith400(
              response,
              `There are no books with id: ${bookId} left to borrow`
            );
          }

          currBook.amount--;

          loanHistData.push({
            id: loanHistData.length, // normally it would be done better
            bookId: bookId,
            userId: userId,
            didReturn: false,
          });

          // save data only after the whole operation
          writeData(booksFilepath, booksData);
          writeData(loanHistFilepath, loanHistData);

          respondWith200(
            response,
            "text/plain; charset=utf-8",
            `Book with id: ${bookId} borrowed by a user with id: ${userId} successfully`
          );
        },
      });
      break;

    case "POST /return":
      safeRequestProcessing({
        request: request,
        response: response,
        body: body,
        initialAction: () => {},
        onEndAction: () => {
          const requestData = Buffer.concat(body).toString();

          const { bookId, userId } = requestData;

          if (!booksData.some((book) => book.id === bookId)) {
            respondWith400(
              response,
              `Book with provided id: ${bookId} does not exist`
            );
          }

          if (!usersData.some((user) => user.id === userId)) {
            respondWith400(
              response,
              `User with provided id: ${userId} does not exist`
            );
          }

          const currBook = booksData.find((book) => book.id === bookId);
          const currHist = loanHistData.find(
            (hist) => hist.bookId === bookId && hist.userId === userId
          );

          if (currHist === undefined) {
            respondWith400(
              response,
              `There is no history of book with id: ${bookId} being lend to user with id: ${userId}`
            );
          }

          currBook.amount++;
          currHist.didReturn = true;

          // save data only after the whole operation
          writeData(booksFilepath, booksData);
          writeData(loanHistFilepath, loanHistData);

          respondWith200(
            response,
            "text/plain; charset=utf-8",
            `Book with id: ${bookId} returned by a user with id: ${userId} successfully`
          );
        },
      });
      break;

    case "POST /reader":
      safeRequestProcessing({
        request: request,
        response: response,
        body: body,
        initialAction: () => {
          readData(loanHistFilepath, loanHistData);
        },
        onEndAction: () => {
          const requestData = Buffer.concat(body).toString();

          const { userId } = requestData;

          if (!usersData.some((user) => user.id === userId)) {
            respondWith400(
              response,
              `User with provided id: ${userId} does not exist`
            );
          }

          respondWith200(
            response,
            "application/json",
            JSON.stringify(
              loanHistData.filter((hist) => hist.userId === userId)
            )
          );
        },
      });
      break;

    default:
      response.writeHead(501, { "Content-Type": "text/plain; charset=utf-8" });
      response.write("Error 501: Not implemented");
      response.end();
  }
}

// Create HTTP server
const server = http.createServer(requestListener);

// Start listening on port 8008
server.listen(8008);
console.log("The server was started on port 8008");
