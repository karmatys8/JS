let request = indexedDB.open("library", 1);

export let db;
export let booksStore;
export let usersStore;
export let loanHistStore;

request.onupgradeneeded = function (event) {
  db = event.target.result;

  booksStore = db.createObjectStore("books", {
    keyPath: "id",
    autoIncrement: true,
  });
  usersStore = db.createObjectStore("users", {
    keyPath: "id",
    autoIncrement: true,
  });
  loanHistStore = db.createObjectStore("loanHist", {
    keyPath: "id",
    autoIncrement: true,
  });

  setUpData(booksStore, usersStore, loanHistStore);
};

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
      clientId: 1,
      didReturn: true,
    },
    {
      bookId: 3,
      clientId: 3,
      didReturn: false,
    },
    {
      bookId: 3,
      clientId: 1,
      didReturn: true,
    },
  ];

  loanHistData.map((data) => loanHistStore.add(data));
}

request.onsuccess = function (event) {
  console.log(";[");
  // Database opened successfully
};

request.onerror = function (event) {
  console.log(":]");
  // Error occurred while opening the database
};
