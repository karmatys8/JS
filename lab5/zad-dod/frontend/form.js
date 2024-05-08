const form = document.getElementById("createBook");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(form);

  const jsonObject = {};
  formData.forEach(function (value, key) {
    jsonObject[key] = value;
  });

  fetch("http://localhost:8008/admin", {
    method: "POST",
    body: JSON.stringify(jsonObject),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
