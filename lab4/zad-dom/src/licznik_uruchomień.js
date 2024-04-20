const fs = require("fs");

const filePath = "counter.txt";

function readCounter(callback) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        // If file doesn't exist, create it with initial value 0
        return fs.writeFile(filePath, "0", (err) => {
          if (err) return callback(err);
          callback(null, 0);
        });
      }
      return callback(err);
    }
    callback(null, parseInt(data));
  });
}

function writeCounter(value, callback) {
  fs.writeFile(filePath, value.toString(), callback);
}

function incrementCounter() {
  readCounter((err, count) => {
    if (err) {
      console.error("Error reading counter:", err);
      return;
    }
    const newCount = count + 1;
    console.log("Liczba uruchomień:", newCount);
    writeCounter(newCount, (err) => {
      if (err) {
        console.error("Error writing counter:", err);
      }
    });
  });
}

if (process.argv.includes("--async")) {
  incrementCounter();
} else if (process.argv.includes("--sync")) {
  const count = fs.readFileSync(filePath, "utf8");
  console.log("Liczba uruchomień:", parseInt(count) + 1);
  fs.writeFileSync(filePath, (parseInt(count) + 1).toString());
} else {
  process.stdin.setEncoding("utf8");
  console.log(
    "Wprowadź komendy — naciśnięcie Ctrl+D kończy wprowadzanie danych"
  );
  let input = "";
  process.stdin.on("readable", () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      input += chunk;
    }
  });

  process.stdin.on("end", () => {
    const commands = input
      .split("\n")
      .filter((command) => command.trim() !== "");
    for (const command of commands) {
      console.log(command);
      // Here you can execute system commands, you may use libraries like 'child_process' to achieve this
    }
  });
}
