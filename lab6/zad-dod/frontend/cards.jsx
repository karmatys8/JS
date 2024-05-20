const serverUrl = "http://localhost:8008";
const userId = 1;

const handleError = (error) => {
  // normally it would be handled better
  window.alert(error.message);
};

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<DataFetcher />);

function BookCard({ id, cardHeader, cardTitle, subject, amount, img, handleLend }) {
  async function handleSell(event) {
    if (event.keyCode === 13) {
      // enter
      try {
        const response = await fetch(`${serverUrl}/sell/${id}`, {
          method: "PATCH",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const xmlData = await response.text();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
        const xmlRootElement = xmlDoc.documentElement;

        const jsonData = xmlToJson(xmlRootElement);
        console.log(jsonData);
      } catch (error) {
        handleError(error);
      }
    }
  }

  return (
    <div className="card" id={id}>
      <div className="card-header">
        <span>{cardHeader}</span>
      </div>
      <div className="card-body">
        <h3 className="card-title h4">{cardTitle}</h3>
        <img
          className="card-img-bottom"
          src={img}
          onClick={() => {
            amount > 0 && handleLend(id);
          }}
          tabIndex="0"
          onKeyDown={handleSell}
        />
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

function DataFetcher() {
  const [bookData, setBookData] = React.useState([]);
  const [userData, setUserData] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);

  const handleBorrow = async (bookId) => {
    if (selectedUser === null) {
      window.alert("There is no selected user for whom to make a request");
      return;
    }
    try {
      const response = await fetch(`${serverUrl}/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain; charset=utf-8",
        },
        body: JSON.stringify({
          userId: selectedUser,
          bookId: bookId,
        }),
      });
      // here we would normally notify user
      if (!response.ok) {
        console.log(await response.text());
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleReturn = async (bookId) => {
    if (selectedUser === null) {
      window.alert("There is no selected user for whom to make a request");
      return;
    }
    try {
      const response = await fetch(`${serverUrl}/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain; charset=utf-8",
        },
        body: JSON.stringify({
          userId: selectedUser,
          bookId: bookId,
        }),
      });
      // here we would normally notify user
      if (!response.ok) {
        console.log(await response.text());
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleLoanHist = async () => {
    if (selectedUser === null) {
      window.alert("There is no selected user for whom to make a request");
      return;
    }
    try {
      const response = await fetch(`${serverUrl}/reader/${selectedUser}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain; charset=utf-8",
        },
      });

      // here we would normally notify user
      if (response.ok) {
        console.log(await response.json());
      } else {
        console.log(await response.text());
      }
    } catch (error) {
      handleError(error);
    }
  };

  React.useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${serverUrl}`);
        if (response.ok) {
          const data = await response.json();
          setBookData(data.books);
          setUserData(data.users);
        } else {
          console.error(await response.text());
        }
      } catch (error) {
        handleError(error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <React.Fragment>
      <div className="headers-container">
        <h1>Akademia Górniczo-Hutnicza</h1>
        <h2>Dostępne książki</h2>
        <button onClick={handleLoanHist}>Show loan history</button>
        {/* <BooksList bookData={bookData}/> */}
      </div>
      <div>
        {userData.map((user) => (
          <UserCard
            {...user}
            key={user.id}
            setSelectedUser={setSelectedUser}
            isSelected={user.id === selectedUser}
            handleReturn={handleReturn}
          />
        ))}
      </div>
      <div>
        {bookData.map((book) => (
          <BookCard
            id={book.id}
            cardHeader={book.department}
            cardTitle={book.course}
            subject={book.name}
            amount={book.amount}
            img={book.src}
            handleLend={handleBorrow}
            key={book.id}
          />
        ))}
      </div>
    </React.Fragment>
  );
}

const placeholder =
  "https://t3.ftcdn.net/jpg/03/58/90/78/360_F_358907879_Vdu96gF4XVhjCZxN2kCG0THTsSQi8IhT.jpg";
const UserCard = ({
  firstName,
  lastName,
  id,
  img,
  hist,
  setSelectedUser,
  isSelected,
  handleReturn,
}) => (
  <div className={`card ${isSelected ? "border border-primary" : ""}`}>
    <img
      src={img || placeholder} // here should be ?? but it does not work
      className="card-img-top"
      alt={`profile picture of ${firstName} ${lastName}`}
      onClick={() => setSelectedUser(id)}
    />
    <div className="card-body">
      <h5 className="card-title">{`${firstName} ${lastName}`}</h5>
      <div>
        {hist.length > 0 &&
          hist.map((entry) => (
            <img
              src={entry.src}
              key={entry.id}
              width="25%"
              onClick={() => handleReturn(entry.id)}
            />
          ))}
      </div>
    </div>
  </div>
);

// this is how generating a select list with radio buttons below would look like
const BooksList = ({ bookData }) => (
  <React.Fragment>
    <select class="form-select m-2" aria-label="Default select example">
      <option selected>Books to choose from</option>
      {bookData.map((book) => (
        <option value={book.id} key={book.id}>
          {book.course}
        </option>
      ))}
    </select>
    <div class="btn-group m-2 gap-1" role="group" aria-label="Basic example">
      <button type="button" class="btn btn-primary">
        Wypożycz
      </button>
      <button type="button" class="btn btn-primary">
        Sprzedaj
      </button>
    </div>
  </React.Fragment>
);
