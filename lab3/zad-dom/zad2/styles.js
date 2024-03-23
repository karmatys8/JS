let areStylesEnabled = false;

document.getElementById("set-button").onclick = () => {
  areStylesEnabled = true;

  styleAllElements();
};

document.getElementById("delete-button").onclick = () => {
  areStylesEnabled = false;

  styleAllElements();
};

function applyStyles(elements, styles) {
  for (const element of elements) {
    for (const key in styles) {
      element.style[key] = areStylesEnabled ? styles[key] : null;
    }
  }
}

function styleAllElements() {
  document.body.style.marginInline = areStylesEnabled ? "16px" : null;

  // tags
  applyStyles(document.getElementsByTagName("aside"), {
    padding: "8px",
    height: "fit-content",
  });

  applyStyles(document.getElementsByTagName("footer"), {
    padding: "8px",
  });

  applyStyles(document.getElementsByTagName("main"), {
    padding: "8px",
    width: "80%",
  });

  applyStyles(document.querySelectorAll("nav ul"), {
    margin: 0,
    padding: "20px 8px 20px 40px",
  });

  applyStyles(document.getElementsByTagName("blockQuote"), {
    margin: "8px 12px 30px",
  });

  applyStyles(document.querySelectorAll("h1, h2"), {
    margin: 0,
    padding: "4px",
  });

  applyStyles(document.querySelectorAll("aside :where(h1,h2)"), {
    padding: 0,
  });

  // classes
  applyStyles(document.getElementsByClassName("azure"), {
    "background-color": "#eeffff",
    border: "1px solid black",
    "box-shadow": "0px 0px 8px grey",
  });

  applyStyles(document.getElementsByClassName("grid"), {
    margin: "16px 0 12px",
    display: "grid",
  });

  applyStyles(document.getElementsByClassName("flex-box"), {
    display: "flex",
    "flex-direction": "column",
    gap: "12px",
  });

  applyStyles(document.getElementsByClassName("color-changing-text"), {
    animation: "color-change 5s linear infinite alternate",
  });

  applyStyles(document.getElementsByClassName("controls-container"), {
    padding: "16px",
    "text-align": "center",
  });

  // media queries
  function mobileQueries(isMobile) {
    applyStyles(document.getElementsByClassName("grid"), {
      "grid-template-columns": isMobile ? "100%" : "50% 50%",
    });

    applyStyles(document.getElementsByClassName("flex-box"), {
      "margin-right": isMobile ? 0 : "12px",
      "margin-bottom": isMobile ? "12px" : "default",
    });

    applyStyles(document.querySelectorAll(".flex-box > *"), {
      width: isMobile ? "auto" : "fit-content",
    });
  }

  const mobileMediaQuery = window.matchMedia("(max-width: 600px)");
  mobileQueries(mobileMediaQuery.matches);

  mobileMediaQuery.onchange = () => mobileQueries(mobileMediaQuery.matches);
}
