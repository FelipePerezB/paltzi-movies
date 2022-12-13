// import nodes from "./nodes.mjs";
window.addEventListener("DOMContentLoaded", navigator, false);
window.addEventListener("hashchange", navigator, false);

const navItemsTag = document.querySelector(".nav-items");
const navItems = ["Home", "Trends", "Explore"];
navItems.forEach((item) => {
  const liTag = document.createElement("li");
  const aTag = document.createElement("a");
  aTag.setAttribute("href", `#${item.toLowerCase()}`);
  aTag.setAttribute("id", `${item}`);
  aTag.innerText = item;
  liTag.appendChild(aTag);
  navItemsTag.appendChild(liTag);

  nodes[`${item.toLowerCase()}Tag`] = document.getElementById(item);
});

function navigator() {
  Object.entries(nodes.pages).forEach((page) =>
    page[1].classList.add("inactive")
  );

  nodes.homeTag.classList.remove("nav-text--active");
  nodes.exploreTag.classList.remove("nav-text--active");
  nodes.trendsTag.classList.remove("nav-text--active");

  if (location.hash.startsWith("#trends")) {
    nodes.trendsTag.classList.add("nav-text--active");
    trendsPage();
  } else if (location.hash.startsWith("#search=")) {
    searchPage();
  } else if (location.hash.startsWith("#movie=")) {
    movieDetailsPage();
  } else if (location.hash.startsWith("#explore")) {
    nodes.exploreTag.classList.add("nav-text--active");
    explorePage();
  } else {
    nodes.homeTag.classList.add("nav-text--active");
    homePage();
    syncInputs("");
  }
  window.scrollTo(0, 0);
}

async function homePage() {
  nodes.nav.classList.remove("inactive");
  Object.entries(nodes.pages).forEach((page) => {
    if (page[0] === "Home") {
      page[1].classList.remove("inactive");
    }
  });
  getMovies("Home");
  getLikedMovies();
}

function explorePage() {
  nodes.nav.classList.remove("inactive");
  Object.entries(nodes.pages).forEach((page) => {
    if (page[0] === "Explore") {
      page[1].classList.remove("inactive");
    }
  });
  getGenres("Explore");
  search(true);
}

function movieDetailsPage() {
  nodes.nav.classList.remove("inactive");
  nodes.nav.classList.add("inactive");
  Object.entries(nodes.pages).forEach((page) => {
    if (page[0] === "MovieDetails") {
      page[1].classList.remove("inactive");
    }
  });
  getMovie(Number(window.location.hash.split("=")[1]));
}

function searchPage() {
  console.log("Search!!");
  Object.values(nodes.homeMenu).forEach((tag) => {
    tag.classList.add("inactive");
  });
}

async function trendsPage() {
  nodes.nav.classList.remove("inactive");
  Object.entries(nodes.pages).forEach((page) => {
    if (page[0] === "Trends") {
      page[1].classList.remove("inactive");
    }
  });
  await getMovies("Trends");
}
