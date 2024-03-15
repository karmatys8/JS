import { performTransaction, addUser, checkEntityExistence } from "./utils.js";

export const commandHandlers = {
  lendABook: { func: lendABook, expectedArgs: 2 },
  returnABook: { func: returnABook, expectedArgs: 2 },
  showUserLentBooks: { func: showUserLentBooks, expectedArgs: 1 },
  showLibraryDetails: { func: showLibraryDetails, expectedArgs: 0 },
  showCurrentReaders: { func: showCurrentReaders, expectedArgs: 1 },
};

async function lendABook(userId, bookId) {
  if (!(await checkEntityExistence("books", bookId, "Book"))) return;
  if (!(await checkEntityExistence("users", userId, "User"))) {
    addUser(userId);
  }

  performTransaction("loanHist", "readwrite", (store) => {
    const request = store.add({
      userId: userId,
      bookId: bookId,
      didReturn: false,
    });

    request.onsuccess = () => {
      console.log("Book lend successfully");
    };

    request.onerror = (event) => {
      console.error("Error lending book:", event.target.error);
    };
  });
}

async function returnABook(userId, bookId) {
  if (!(await checkEntityExistence("books", bookId, "Book"))) return;
  if (!(await checkEntityExistence("users", userId, "User"))) return;

  performTransaction("loanHist", "readwrite", (store) => {
    const index = store.index("userIdIndex");
    const range = IDBKeyRange.only(userId);
    const request = index.openCursor(range);

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const loanHistRecord = cursor.value;
        if (loanHistRecord.bookId === bookId) {
          loanHistRecord.didReturn = true;
          const updateRequest = cursor.update(loanHistRecord);

          updateRequest.onsuccess = ()  =>{
            console.log("Book returned successfully");
          };

          updateRequest.onerror = (event) => {
            console.error("Error returning book:", event.target.error);
          };
        }
        cursor.continue();
      }
    };

    request.onerror = (event) => {
      console.error("Error retrieving book:", event.target.error);
    };
  });
}

async function showUserLentBooks(userId) {
  if (!(await checkEntityExistence("users", userId, "User"))) return;

  performTransaction("loanHist", "readonly", (store) => {
    const index = store.index("userIdIndex");
    const range = IDBKeyRange.only(userId);
    const request = index.openCursor(range);

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const loanHistRecord = cursor.value;
        if (!loanHistRecord.didReturn) {
          console.log(
            `Book with id: ${loanHistRecord.bookId} lent by user: ${userId}`
          );
        }
        cursor.continue();
      }
    };

    request.onerror = (event) => {
      console.error("Error listing user's books:", event.target.error);
    };
  });
}

async function showLibraryDetails() {
  performTransaction("books", "readonly", (store) => {
    const request = store.openCursor();
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        console.group();
        console.log(cursor.value);
        showCurrentReaders(cursor.value.id);
        console.groupEnd();
        cursor.continue();
      }
    };

    request.onerror = (event) => {
      console.error("Error showing library details:", event.target.error);
    };
  });
}

async function showCurrentReaders(bookId) {
  if (!(await checkEntityExistence("books", bookId, "Book"))) return;

  performTransaction("loanHist", "readonly", (store) => {
    const index = store.index("bookIdIndex");
    const range = IDBKeyRange.only(bookId);
    const request = index.openCursor(range);

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const loanHistRecord = cursor.value;
        if (!loanHistRecord.didReturn) {
          console.log(
            `Book with id: ${bookId} lent by user: ${loanHistRecord.userId}`
          );
        }
        cursor.continue();
      }
    };

    request.onerror = (event) => {
      console.error("Error listing book's users:", event.target.error);
    };
  });
}
