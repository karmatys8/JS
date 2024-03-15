import { commandHandlers } from "./commands.js";

let request = indexedDB.open("library", 3);

let db;

request.onsuccess = (event) => {
  console.log("Connection to IndexedDB established");
  db = event.target.result;
};

request.onerror = () => {
  console.error("Connection to IndexedDB failed");
};

document
  .getElementById("exampleCommandForm")
  .addEventListener("submit", executeCommand);

export async function executeCommand(e) {
  e.preventDefault();

  const commandInput = document.getElementById("exampleCommandInput");

  if (!commandInput.value) {
    console.error("No command provided");
    return;
  }

  let [commandName, ...args] = commandInput.value.split(/\s+/);

  commandInput.value = "";

  try {
    if (args.length) {
      args = args.map((element) => parseInt(element));
    }
  } catch {
    console.error("Arguments should be numbers");
  }

  if (commandHandlers.hasOwnProperty(commandName)) {
    const { func, expectedArgs } = commandHandlers[commandName];
    await handleCommand(args, func, expectedArgs);
  } else {
    console.error("Unrecognized command");
  }
}

async function handleCommand(args, func, expectedArgs) {
  if (args.length !== expectedArgs) {
    console.error("Inappropriate number of arguments");
    return;
  }
  await func(...args);
}
