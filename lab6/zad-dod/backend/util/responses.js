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

module.exports = {
  respondWith200,
  respondWith400
}