import http from "node:http";
import { URL } from "node:url";
import fs from "fs";

/**
 * Path to the file where posts data is stored.
 * @type {string}
 */
const filepath = "./src/posts.json";

/**
 * Array to store posts data.
 * @type {Array<Object>}
 */
let postsData = [];

/**
 * Reads posts data from the file.
 * @returns {void}
 */
function readPosts() {
  fs.readFile(filepath, "utf8", (err, data) => {
    if (err) console.error(err);
    postsData = JSON.parse(data);
  });
}

/**
 * Writes posts data to the file.
 * @returns {void}
 */
function writePosts() {
  fs.writeFile(filepath, JSON.stringify(postsData, null, 2), (err) => {
    console.error(err);
  });
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

  switch ([request.method, url.pathname].join(" ")) {
    case "GET /":
      readPosts();
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Zad-dom 2</title>
          </head>
          <body style="margin-left: 20px">
            <main>
              <div>
                ${
                  postsData.map(
                    (post) => `
                  <div style="border: grey solid 1px; padding: 0 10px 10px;">
                    <h2>${post["full-name"]}</h2>
                    <span>${post.message}</span>
                  </div>
                `
                  ) // scuffed version of jsx
                }
              </div>
              <form method="GET" action="/submit">
                <legend><h4>New post:</h4></legend>
                <div style="margin-left: 10px; display: flex; flex-direction: column; width: 200px">
                  <label for="full-name">Give your full name</label>
                  <input name="full-name" placeholder="John Smith" style="margin-bottom:10px">
                  <label for="message">Post message</label>
                  <textarea name="message" placeholder="Did anyone have problem with ...?" style="margin-bottom:10px"></textarea>
                  <div style="display: flex; justify-content: space-around">
                    <input type="submit">
                    <input type="reset">
                  </div>
                </div>
              </form>
            </main>
          </body>
        </html>`);

      response.end();
      break;

    case "GET /submit":
      response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      response.write(`Hello ${url.searchParams.get("full-name")}`);

      const newPost = {};

      for (const [key, value] of url.searchParams.entries()) {
        newPost[key] = value;
      }
      postsData.push(newPost);
      writePosts();

      response.end();
      break;

    default:
      response.writeHead(501, { "Content-Type": "text/plain; charset=utf-8" });
      response.write("Error 501: Not implemented");
      response.end();
  }
}

// Create HTTP server
const server = http.createServer(requestListener);

// Start listening on port 8001
server.listen(8001);
console.log("The server was started on port 8001");
console.log('To stop the server, press "CTRL + C"');
