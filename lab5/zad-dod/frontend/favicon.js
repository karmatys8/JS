"use strict";

const canvas = document.getElementById("logoCanvas");
const ctx = canvas.getContext("2d");
ctx.lineWidth = 4;

const textWidth = canvas.width / 3;
const shiftX = textWidth * 1.1;
const shiftY = textWidth * 0.8;

// Draw "O"
const oWidth = textWidth;
const oHeight = textWidth * 1.6;
const oX = (canvas.width - shiftX) / 2;
const oY = canvas.height / 2;
ctx.beginPath();
ctx.ellipse(oX, oY, oWidth / 2, oHeight / 2, 0, 0, Math.PI * 2);
ctx.stroke();

// Draw "K" (book-shaped)
const lineX = oX + oWidth / 2 + textWidth / 4;
ctx.beginPath();
ctx.moveTo(lineX, oY - oHeight / 2);
ctx.lineTo(lineX, oY + oHeight / 2);
ctx.stroke();

ctx.beginPath();
ctx.ellipse(
  oX + shiftX,
  oY - shiftY,
  oWidth / 2,
  oHeight / 2,
  0,
  0,
  Math.PI * 0.5
);
ctx.stroke();

ctx.beginPath();
ctx.ellipse(
  oX + shiftX,
  oY + shiftY,
  oWidth / 2,
  oHeight / 2,
  0,
  Math.PI * 1.5,
  0
);
ctx.stroke();

// Get the data URL of the canvas
const dataURL = canvas.toDataURL("image/png");

// Create a link element for favicon
const faviconLink = document.createElement("link");
faviconLink.rel = "icon";
faviconLink.href = dataURL;

// Append the link element to the document head
document.head.appendChild(faviconLink);
