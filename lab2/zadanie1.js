function funkcja_zwrotna_B() {
  console.log("Tekst 1");
  window.alert("Tekst 2");
  // document.write('Tekst 3');
}

function funkcja_zwrotna_C() {
  const text = document.getElementById("pole_tekstowe").value;
  const number = document.getElementById("pole_liczbowe").value;
  console.log(`${text}:${typeof text}`);
  console.log(`${number}:${typeof number}`);
}
