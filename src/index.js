const API_KEY = "f9e91a1cae7737f7bd57b26477b88939";

const genres_query = [];

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3/",
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
  params: {
    api_key: API_KEY,
    language: "en",
  },
});

const getMovies = async (page) => {
  const moviesContainer = document.querySelector(".movies" + page);
  if (moviesContainer.childElementCount < 2) {
    const { data } = await api("/trending/movie/day");

    const results =
      page === "Explore" ? filterGenres(data.results) : data.results;
      createMovieCard(results, moviesContainer);

    if (page === "Home") {
      const bestMovie = results[0];

      const mainMovieTitle = document.querySelector(".main-movie-title");

      const mainMovie = document.querySelector(".main-movie");
      const mainImg = document.createElement("img");
      const watchLinkBtn = document.querySelector(".main-movie a");

      watchLinkBtn.href = `#movie=${bestMovie.id}`;
      mainMovieTitle.innerText = bestMovie.title;
      mainImg.setAttribute("alt", bestMovie.title);
      mainImg.setAttribute(
        "src",
        `https://image.tmdb.org/t/p/w300/${bestMovie.poster_path}`
      );
      mainMovie.appendChild(mainImg);
    }

  }
};

const getGenres = async (page) => {
  const { data } = await api("/genre/movie/list");
  const genres = data.genres;
  const genresContainer = document.querySelector(".genres" + page);
  genres.forEach((genre) => {
    const genreCard = document.createElement("div");
    genreCard.setAttribute("id", genre.id);
    genreCard.addEventListener("click", () => {
      genreCard.classList.toggle("genre-card--active");
      if (genreCard.classList[0] === "genre-card--active") {
        genres_query.push(Number(genreCard.id));
        search();
      } else {
        const genreIndex = genres_query.findIndex(
          (genreId) => genreId == genreCard.id
        );
        genres_query.splice(genreIndex, 1);
        search();
      }
    });
    genreCard.innerText = genre.name;
    genresContainer.appendChild(genreCard);
  });
};

const filterGenres = (results) => {
  const filteredResults = [];
  results.forEach((result) => {
    const genresResult = result.genre_ids;
    let found = true;
    genres_query.forEach((query_id) => {
      if (!genresResult.includes(query_id)) {
        found = false;
      }
    });
    if (found) {
      filteredResults.push(result);
    }
  });
  return filteredResults;
};

const search = async () => {
  const moviesContainer = document.querySelector(".moviesExplore");
  moviesContainer.innerHTML = "";
  const query =
    window.location.hash.split("=")[1]?.replaceAll("%20", " ") || "";
  if (!query) {
    getMovies("Explore");
  } else {
    const { data } = await api("/search/movie?query=" + query);
    const results = data.results;
    const filteredResults = filterGenres(results);
    createMovieCard(filteredResults, moviesContainer);
  }
  syncInputs(query);
};

const syncInputs = (newValue) => {
  const searchInputs = document.querySelectorAll(".search input");
  searchInputs.forEach((searchInput) => {
    searchInput.value = newValue;
  });
};

const searchContainers = document.querySelectorAll(".search");
searchContainers.forEach((searchContainer) => {
  const searchInput = document.createElement("input");
  searchInput.placeholder = "Search movie...";
  const searchBtn = document.createElement("span");

  searchBtn.addEventListener("click", () => {
    window.location = "#explore=" + searchInput.value;
  });
  searchContainer.append(searchInput, searchBtn);
});

const createMovieCard = (data, container, resetContainer) => {
  if (resetContainer) {
    container.innerHTML = "";
  }
  data.forEach((movie) => {
    const movieCard = document.createElement("li");
    const linkTag = document.createElement("a");
    linkTag.href = `#movie=${movie.id}`;
    movieCard.classList.add("movie-card");
    const movieImg = document.createElement("img");
    movieImg.setAttribute("alt", movie.title);
    movieImg.setAttribute(
      "src",
      `https://image.tmdb.org/t/p/w300/${movie.poster_path}`
    );
    linkTag.appendChild(movieImg);
    movieCard.appendChild(linkTag);

    container.appendChild(movieCard);
  });
};

const backButton = document.querySelector(".image .back-icon");
backButton.addEventListener("click", () => {
  history.back();
});

const getMovie = async (id) => {
  const { data } = await api("movie/" + id);
  getSimilarMovies(id);
  const img = document.querySelector(".image img");
  const title = document.querySelector(".image .title");
  const description = document.querySelector(".MovieDetails p");

  img.src = `https://image.tmdb.org/t/p/w300/${data.poster_path}`;
  title.innerText = data.title;
  description.innerText = data.overview;
};

const getSimilarMovies = async (id) => {
  const { data } = await api(`movie/${id}/recommendations`);
  const container = document.querySelector(".moviesRecomendations");
  createMovieCard(data.results, container, true);
  const subtitle = document.querySelector(".recomendations-subtitle");
  subtitle.classList.remove("inactive");
  if (data.total_results < 1) {
    subtitle.classList.add("inactive");
  }
};
