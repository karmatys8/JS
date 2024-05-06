const serverUrl = "http://localhost:8008";
const userId = 1;

const handleError = (error) => {
  // normally it would be handled better
  window.alert(error.message);
};

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<CardDataFetcher />);

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
    <div className="card" id={id}>
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
  const [bookData, setBookData] = React.useState([]);

  const handleBorrow = async (bookId) => {
    try {
      const response = await fetch(`${serverUrl}/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain; charset=utf-8",
        },
        body: JSON.stringify({
          userId: userId,
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
    try {
      const response = await fetch(`${serverUrl}/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain; charset=utf-8",
        },
        body: JSON.stringify({
          userId: userId,
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
    try {
      const response = await fetch(`${serverUrl}/reader/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain; charset=utf-8",
        }
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
          setBookData(data);
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
      {bookData.map((book) => (
        <Card
          id={book.id}
          cardHeader={book.department}
          cardTitle={book.course}
          subject={book.name}
          amount={book.amount}
          img={book.src}
          handleLend={handleBorrow}
          handleReturn={handleReturn}
          key={book.id}
        />
      ))}
    </React.Fragment>
  );
}

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
