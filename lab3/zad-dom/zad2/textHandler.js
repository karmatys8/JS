let text = [
  [
    "Natenczas Wojski chwycił na taśmie przypięty",
    "Swój róg bawoli, długi, cętkowany, kręty",
    "Jak wąż boa, oburącz do ust go przycisnął,",
    "Wzdął policzki jak banię, w oczach krwią zabłysnął,",
    "Zasunął wpół powieki, wciągnął w głąb pół brzucha",
    "I do płuc wysłał z niego cały zapas ducha,",
    "I zagrał: róg jak wicher, wirowatym dechem",
    "Niesie w puszczę muzykę i podwaja echem. ",
  ],
  [
    "",
    "Umilkli strzelcy, stali szczwacze zadziwieni",
    "Mocą, czystością, dziwną harmoniją pieni.",
    "Starzec cały kunszt, którym niegdyś w lasach słynął,",
    "Jeszcze raz przed uszami myśliwców rozwinął;",
    "Napełnił wnet, ożywił knieje i dąbrowy,",
    "Jakby psiarnię w nie wpuścił i rozpoczął łowy. ",
  ],
  [
    "",
    "Bo w graniu była łowów historyja krótka:",
    "Zrazu odzew dźwięczący, rześki: to pobudka;",
    "Potem jęki po jękach skomlą: to psów granie;",
    "A gdzieniegdzie ton twardszy jak grzmot: to strzelanie.",
  ],
];

const addButton = document.getElementById("add-button");
const blockQuote = document.getElementsByTagName("blockquote")[0];

addButton.onclick = () => {
  if (text.length > 0) {
    for (const line of text.shift()) {
      const textNode = document.createTextNode(line);
      blockQuote.appendChild(textNode);

      const breakNode = document.createElement("br");
      blockQuote.appendChild(breakNode);
    }
  }

  if (text.length === 0) addButton.disabled = "true";
};
