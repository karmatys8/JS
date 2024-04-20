async function updateBookAmount(bookId, actionName, change) {
  performTransaction("books", "readwrite", (store) => {
    const range = IDBKeyRange.only(bookId);
    const request = store.openCursor(range);

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const bookRecord = cursor.value;
        bookRecord.amount += change;
        const updateRequest = cursor.update(bookRecord);

        updateRequest.onsuccess = () => {
          console.log(`Book ${actionName} successfully`);
        };

        updateRequest.onerror = (event) => {
          console.error(`Error ${actionName}ing book:`, event.target.error);
        };
        cursor.continue();
      }
    };

    request.onerror = (event) => {
      console.error(`Error ${actionName}ing book:`, event.target.error);
    };
  });
}

async function checkEntityExistence(storeName, entityId, entityType) {
  return new Promise((resolve, reject) => {
    performTransaction(storeName, "readonly", (store) => {
      const request = store.get(entityId);

      request.onsuccess = () => {
        if (request.result === undefined) {
          console.warn(`${entityType} with id: ${entityId} does not exist`);
          resolve(false);
        }
        resolve(true);
      };

      request.onerror = () => {
        console.error(`Error checking if ${entityType} exists`);
      };
    });
  });
}

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

  updateBookAmount(bookId, "lend", -1);
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

          updateRequest.onsuccess = () => {
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

  updateBookAmount(bookId, "return", 1);
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

let iRequest = indexedDB.open("library", 5);
let db;

iRequest.onsuccess = (event) => {
  console.log("Connection to IndexedDB established");
  db = event.target.result;

  root.render(<CardDataFetcher />);
};

function performTransaction(storeName, mode, action) {
  const transaction = db.transaction([storeName], mode);
  const store = transaction.objectStore(storeName);

  action(store);

  transaction.oncomplete = () => {
    console.log("Transaction completed");
  };

  transaction.onerror = (event) => {
    console.error("Transaction error:", event.target.error);
  };
}

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

function Card({
  id,
  cardHeader,
  cardTitle,
  subject,
  amount,
  img,
  handleLend,
  handleReturn,
}) {
  return (
    <div className={`card ${amount === 0 ? "bg-secondary" : ""}`}>
      <div className="card-header">
        <span>{cardHeader}</span>
      </div>
      <div className="card-body">
        <h3 className="card-title h4">{cardTitle}</h3>
        <img className="card-img-bottom" src={img} />
        <div className="d-flex p-2 justify-content-between">
          <button onClick={() => handleLend(id)} disabled={amount === 0}>
            Wypożycz
          </button>
          <button onClick={() => showCurrentReaders(id)}>Pokaż czytelników</button>
          <button onClick={() => handleReturn(id)}>Zwróć</button>
        </div>
      </div>
      <div className="card-footer">
        <span>
          <b>Przedmiot:</b> {subject}
        </span>
        <div className="alert alert-info" role="alert">
          Ilość egzemplarzy: {amount}
        </div>
      </div>
    </div>
  );
}

function CardDataFetcher() {
  const [data, setData] = React.useState([]);

  const handleLend = (bookId) => {
    if (
      data.filter((book) => book.id === bookId && book.amount === 0).length > 0
    )
      return;
    lendABook(1, parseInt(bookId));
    setData((curr) =>
      [...curr].map((book) =>
        book.id === bookId && book.amount > 0
          ? { ...book, amount: book.amount - 1 }
          : { ...book }
      )
    );
  };

  const handleReturn = (bookId) => {
    returnABook(1, parseInt(bookId));
    setData((curr) =>
      [...curr].map((book) =>
        book.id === bookId ? { ...book, amount: book.amount + 1 } : { ...book }
      )
    );
  };

  React.useEffect(() => {
    performTransaction("books", "readonly", (store) => {
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          setData((curr) => [...curr, cursor.value]);
          cursor.continue();
        }
      };

      request.onerror = (event) => {
        console.error("Error showing library details:", event.target.error);
      };
    });
  }, [db]);

  return (
    <React.Fragment>
      <div className="headers-container">
        <h1>Akademia Górniczo-Hutnicza</h1>
        <h2>Dostępne książki</h2>
      </div>
      {data.map((book) => (
        <Card
          id={book.id}
          cardHeader={book.department}
          cardTitle={book.course}
          subject={book.name}
          amount={book.amount}
          img={book.src}
          handleLend={handleLend}
          handleReturn={handleReturn}
          key={book.id}
        />
      ))}
    </React.Fragment>
  );
}

async function loadFromBackend() {
  try {
    const response = await fetch("http://localhost:8008/");
    if (response.ok) {
      const data = await response.json();
      console.log(data);
    } else {
      console.error(response.error());
    }
  } catch (error) {
    console.error(error);
  }
}

loadFromBackend();
