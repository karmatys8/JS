import http from "node:http";
import { URL } from "node:url";
import fs from "fs";

const filepath = "./src/posts.json";

/**
 * Handles incoming requests.
 *
 * @param {IncomingMessage} request - Input stream — contains data received from the browser, e.g,. encoded contents of HTML form fields.
 * @param {ServerResponse} response - Output stream — put in it data that you want to send back to the browser.
 * The answer sent by this stream must consist of two parts: the header and the body.
 * <ul>
 *  <li>The header contains, among others, information about the type (MIME) of data contained in the body.
 *  <li>The body contains the correct data, e.g. a form definition.
 * </ul>
 * @author Stanisław Polak <polak@agh.edu.pl>
 */

let postsData = [];

function readPosts() {
  fs.readFile(filepath, "utf8", (err, data) => {
    if (err) console.error(err);
    postsData = JSON.parse(data);
  });
}

function writePosts() {
  fs.writeFile(filepath, JSON.stringify(postsData, null, 2), (err) => {
    console.error(err);
  });
}

function requestListener(request, response) {
  console.log("--------------------------------------");
  console.log(`The relative URL of the current request: ${request.url}`);
  console.log(`Access method: ${request.method}`);
  console.log("--------------------------------------");
  // Create the URL object
  const url = new URL(request.url, `http://${request.headers.host}`);
  /* ************************************************** */
  // if (!request.headers['user-agent'])
  if (url.pathname !== "/favicon.ico")
    // View detailed URL information
    console.log(url);

  /* *************** */
  /* "Routes" / APIs */
  /* *************** */

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

    /* 
          ------------------------------------------------------
          Processing the form content, if 
              the GET method was used to send data to the server
          and 
              the relative URL is '/submit', 
          ------------------------------------------------------
        */
    case "GET /submit":
      /* ************************************************** */
      // Creating an answer header — we inform the browser that the returned data is plain text
      response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      /* ************************************************** */
      // Place given data (here: 'Hello <name>') in the body of the answer
      response.write(`Hello ${url.searchParams.get("full-name")}`); // "url.searchParams.get('name')" contains the contents of the field (form) named 'name'

      const newPost = {};

      for (const [key, value] of url.searchParams.entries()) {
        newPost[key] = value;
      }
      postsData.push(newPost);
      writePosts();
      // readPosts();
      /* ************************************************** */
      response.end(); // The end of the response — send it to the browser
      break;

    /* 
          ----------------------
          If no route is matched 
          ---------------------- 
        */
    default:
      response.writeHead(501, { "Content-Type": "text/plain; charset=utf-8" });
      response.write("Error 501: Not implemented");
      response.end();
  }
}

/* ************************************************** */
/* Main block
/* ************************************************** */
const server = http.createServer(requestListener); // The 'requestListener' function is defined above
server.listen(8001);
console.log("The server was started on port 8001");
console.log('To stop the server, press "CTRL + C"');
