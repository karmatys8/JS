let request = indexedDB.open("library", 5);

function setUpDB() {
  let booksStore = db.createObjectStore("books", {
    keyPath: "id",
    autoIncrement: true,
  });
  let usersStore = db.createObjectStore("users", {
    keyPath: "id",
    autoIncrement: true,
  });
  let loanHistStore = db.createObjectStore("loanHist", {
    keyPath: "id",
    autoIncrement: true,
  });

  loanHistStore.createIndex("bookIdIndex", "bookId", { unique: false });
  loanHistStore.createIndex("userIdIndex", "userId", { unique: false });

  setUpData(booksStore, usersStore, loanHistStore);
}

function setUpData(booksStore, usersStore, loanHistStore) {
  const booksData = [
    {
      department: "Wydział IET",
      course: "Cyberbezpieczeństwo",
      src: "./images/Python-Leksykon-kieszonkowy.jpg",
      name: "Programowanie skryptowe",
      amount: 1,
    },
    {
      department: "Wydział GGIOŚ",
      course: "Geoinformatyka",
      src: "./images/Geologia-regionalna-Polski.webp",
      name: "Geologia ogólna",
      amount: 10,
    },
    {
      department: "Wydział Humanistyczny",
      course: "Informatyka społeczna",
      src: "./images/abc-grafiki.jpg",
      name: "Grafika komputerowa",
      amount: 6,
    },
  ];

  booksData.map((book) => booksStore.add(book));

  const usersData = [
    {
      firstName: "Joe",
      lastName: "Doe",
    },
    {
      firstName: "Joanna",
      lastName: "Doe",
    },
    {
      firstName: "John",
      lastName: "Johns",
    },
  ];

  usersData.map((user) => usersStore.add(user));

  const loanHistData = [
    {
      bookId: 2,
      userId: 1,
      didReturn: true,
    },
    {
      bookId: 3,
      userId: 3,
      didReturn: false,
    },
    {
      bookId: 3,
      userId: 1,
      didReturn: true,
    },
  ];

  loanHistData.map((data) => loanHistStore.add(data));
}

request.onupgradeneeded = (event) => {
  db = event.target.result;
  setUpDB();
};

request.onsuccess = (event) => {
  db = event.target.result;
  console.log("Connection to IndexedDB established");
};

request.onerror = (event) => {
  console.error("Error opening database:", event.target.error);
};
