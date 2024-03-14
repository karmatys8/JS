let request = indexedDB.open("library", 2);

let db;

request.onsuccess = function (event) {
  console.log("Connection to IndexedDB established");
  db = event.target.result;
};

request.onerror = function () {
  console.error("Connection to IndexedDB failed");
};

document
  .getElementById("exampleCommandForm")
  .addEventListener("submit", executeCommand);

export function executeCommand(e) {
  e.preventDefault();

  const command = document.getElementById("exampleCommandInput").value;

  let commandValues = command.split(" ");
  // now it also includes the command name
  const commandName = commandValues.shift();

  switch (commandName) {
    case "lendABook":
      if (commandValues.length === 2) {
        lendABook(...commandValues);
      } else {
        console.error("Inappropriate number of arguments");
      }
      break;
    case "returnABook":
      if (commandValues.length === 2) {
        returnABook(...commandValues);
      } else {
        console.error("Inappropriate number of arguments");
      }
      break;
    case "showUserLentBooks":
      if (commandValues.length === 1) {
        showUserLentBooks(...commandValues);
      } else {
        console.error("Inappropriate number of arguments");
      }
      break;
    case "showLibraryDetails":
      if (commandValues.length === 0) {
        showLibraryDetails(...commandValues);
      } else {
        console.error("Inappropriate number of arguments");
      }
      break;
    case "showCurrentReaders":
      if (commandValues.length === 1) {
        showCurrentReaders(...commandValues);
      } else {
        console.error("Inappropriate number of arguments");
      }
      break;
    default:
      console.error("Unrecognized command");
  }
}

function checkUser(userId) {
  db.transaction(["users"], "readwrite");
  const store = transaction.objectStore("users");

  const request = store.get(userId);

  request.onsuccess = function (event) {
    const userData = event.target.result;
    if (!userData) {
      createRequest = store.add({
        id: userId,
        firstName: "created",
        lastName: "ok",
      });

      createRequest.onerror = function (event) {
        console.error("Error adding user:", event.target.error);
      };
    }
  };

  request.onerror = function (event) {
    console.error("Error checking a user:", event.target.error);
  };

  transaction.onerror = function (event) {
    console.error("Transaction error:", event.target.error);
  };
}

function lendABook(userId, bookId) {
  checkUser(userId);

  const transaction = db.transaction(["loanHist"], "readwrite");
  const store = transaction.objectStore("loanHist");

  const index = store.index("userIdIndex");

  const range = IDBKeyRange.only(userId);
  const request = index.openCursor(range);

  request.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const loanHistRecord = cursor.value;
      if (loanHistRecord.bookId === bookId && !loanHistRecord.didReturn) {
        cursor.didReturn = true;

        const updateRequest = store.put(cursor);

        updateRequest.onsuccess = function (event) {
          console.log("Book updated successfully");
        };

        updateRequest.onerror = function (event) {
          console.error("Error updating book:", event.target.error);
        };
      }
      cursor.continue();
    } else {
      console.error("Book not found");
    }
  };

  request.onerror = function (event) {
    console.error("Error retrieving book:", event.target.error);
  };

  transaction.onerror = function (event) {
    console.error("Transaction error:", event.target.error);
  };
}

function returnABook(userId, bookId) {
  const transaction = db.transaction(["loanHist"], "readwrite");
  const store = transaction.objectStore("loanHist");

  const index = store.index("userIdIndex");

  const range = IDBKeyRange.only(userId);
  const request = index.openCursor(range);

  request.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const loanHistRecord = cursor.value;
      if (loanHistRecord.bookId === bookId) {
        cursor.didReturn = true;

        const updateRequest = cursor.update(loanHistRecord);

        updateRequest.onsuccess = function (event) {
          console.log("Book updated successfully");
        };

        updateRequest.onerror = function (event) {
          console.error("Error updating book:", event.target.error);
        };
      }
      cursor.continue();
    } else {
      console.error("Book not found");
    }
  };

  request.onerror = function (event) {
    console.error("Error retrieving book:", event.target.error);
  };

  transaction.oncomplete = function () {
    console.log("Transaction completed");
  };

  transaction.onerror = function (event) {
    console.error("Transaction error:", event.target.error);
  };
}

function showUserLentBooks(userId) {
  const transaction = db.transaction(["loanHist"], "readonly");
  const store = transaction.objectStore("loanHist");

  const index = store.index("userIdIndex");

  const range = IDBKeyRange.only(userId);
  const request = index.openCursor(range);

  request.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const loanHistRecord = cursor.value;
      if (!loanHistRecord.didReturn) {
        console.log(
          `Book with id: ${loanHistRecord.bookId} borrowed by user:${loanHistRecord.userId}`
        );
      }
    }
  };

  request.onerror = function (event) {
    console.error("Error listing user's books:", event.target.error);
  };

  transaction.oncomplete = function () {
    console.log("Transaction completed");
  };

  transaction.onerror = function (event) {
    console.error("Transaction error:", event.target.error);
  };
}

function showLibraryDetails() {}

function showCurrentReaders(bookId) {}
