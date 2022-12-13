const API_KEY = "f9e91a1cae7737f7bd57b26477b88939";

const genres_query = [];
const genres_query_results = [];
let pageNumber = {};

const lenguageSelect = document.querySelector("nav select");
lenguageSelect.value= localStorage.getItem("lenguage")

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3/",
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
  params: {
    api_key: API_KEY,
    language: localStorage.getItem("lenguage") ?? "en",
  },
});

lenguageSelect.addEventListener("change", () => {
  localStorage.setItem("lenguage", lenguageSelect.value)
  location.reload()
});

const infScrollObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const page = entry.target.attributes.page.value;
      getMovies(page);
    }
  });
});

const getMovies = async (page) => {
  const endElement = document.querySelector(".end" + page);
  const moviesContainer = document.querySelector(".movies" + page);
  if (moviesContainer.childElementCount < 2 || pageNumber[page] >= 1) {
    pageNumber[page] = pageNumber[page] ? pageNumber[page] + 1 : 1;
    createLoadingSkeletons(moviesContainer);
    let dataResults;

    if (genres_query.length > 0) {
      const { data } = await api("discover/movie", {
        params: {
          page: pageNumber[page],
          with_genres: genres_query.join(","),
        },
      });
      dataResults = data;
    } else {
      const { data } = await api("/trending/movie/day", {
        params: {
          page: pageNumber[page],
        },
      });
      dataResults = data;
    }

    const results = filterGenres(dataResults.results);
    const number = results.length * (pageNumber[page] - 1);

    createMovieCard(results, moviesContainer, number);
    if (endElement) {
      infScrollObserver.disconnect();
      infScrollObserver.observe(endElement);
    }
    if (dataResults.total_pages <= pageNumber[page]) {
      infScrollObserver.disconnect();
      return;
    }

    if (page === "Home") {
      pageNumber["Home"] = 0;
      const bestMovie = results[0];

      const mainMovieTitle = document.querySelector(".main-movie-title");

      const mainMovie = document.querySelector(".main-movie");
      const mainImg = document.createElement("img");
      const watchNowButn = document.querySelector(".main-movie .button");

      watchNowButn.addEventListener("click", () => {
        window.location = "#movie=" + bestMovie.id;
      });

      mainMovieTitle.innerText = bestMovie.title;
      mainImg.setAttribute("alt", bestMovie.title);
      mainImg.src = `https://image.tmdb.org/t/p/original/${bestMovie.poster_path}`;
      mainMovie.appendChild(mainImg);
    }
  }
};
// };

const createMovieCard = (data, container, number = 0) => {
  const toDelete = [];
  for (let i = 0; i < container.childElementCount; i++) {
    const element = container.childNodes[i + number];
    const movie = data[i];
    if (movie) {
      const addToFavBtn = document.createElement("button");
      const shadow = document.createElement("div");
      const a = element.childNodes[0];
      const img = a.childNodes[0];

      if (isInLocalStorage(movie.id)) {
        addToFavBtn.classList.add("added");
      }
      addToFavBtn.classList.add("fav-btn");
      shadow.classList.add("shadow");

      a.href = `#movie=${movie.id}`;
      img.setAttribute("alt", movie.title);
      img.src = movie.poster_path
        ? `https://image.tmdb.org/t/p/w300/${movie.poster_path}`
        : `https://via.placeholder.com/1600x1000/040b1f99/ffffff?text=${movie.title}`;

      addToFavBtn.addEventListener("click", () => {
        createAddToFavBtn(movie, addToFavBtn, 1);
        setTimeout(() => {
          getLikedMovies();
        });
      });
      a.appendChild(shadow);
      element.appendChild(addToFavBtn);
    } else {
      if (element) {
        toDelete.push(element);
      }
    }
  }

  toDelete.forEach((element) => {
    element.parentElement.removeChild(element);
  });
};

const createLoadingSkeletons = (container, number = 20, resetContainer) => {
  if (resetContainer) {
    container.innerHTML = "";
  }
  for (let i = 0; i < number; i++) {
    const movieCard = document.createElement("li");
    const linkTag = document.createElement("a");
    movieCard.id = i;

    movieCard.classList.add("movie-card");
    const movieImg = document.createElement("img");
    movieImg.loading = "lazy";
    linkTag.appendChild(movieImg);
    movieCard.appendChild(linkTag);
    container.appendChild(movieCard);
  }
};

const getGenres = async (page) => {
  const genresContainer = document.querySelector(".genres" + page);
  const genresItemsSkeleton = 15;
  if (!genresContainer.hasChildNodes()) {
    for (let i = 0; i < genresItemsSkeleton; i++) {
      const genreCard = document.createElement("div");
      genreCard.classList.add("genreSkeleton");
      genresContainer.appendChild(genreCard);
    }
    const { data } = await api("/genre/movie/list");
    const genres = data.genres;

    for (let i = 0; i < genresItemsSkeleton; i++) {
      const element = genresContainer.childNodes[i];
      if (genres.length - i > 0) {
        element.classList.remove("genreSkeleton");
        const genre = genres[i];

        element.setAttribute("id", genre.id);
        element.addEventListener("click", () => {
          element.classList.toggle("genre-card--active");
          if (element.classList[0] === "genre-card--active") {
            genres_query.push(Number(genre.id));
            window.scrollTo(0, 0);
            search(true);
          } else {
            window.scrollTo(0, 0);
            const genreIndex = genres_query.findIndex(
              (genreId) => genreId == element.id
            );
            genres_query.splice(genreIndex, 1);
          }
          search(true);
        });
        element.innerText = genre.name;
      } else {
        element.style.display = "none";
      }
    }
  }
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

const searcInfObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        search();
      }
    });
  },
  {
    rootMargin: "50px",
  }
);

const search = async (reset) => {
  const genresContainer = document.querySelector(".genres-container");
  const page = "Explore";
  const endElement = document.querySelector(".end" + page);
  const moviesContainer = document.querySelector(".moviesExplore");
  const query =
    window.location.hash.split("=")[1]?.replaceAll("%20", " ") || "";
  if (reset) {
    moviesContainer.innerHTML = "";
    pageNumber[page] = 0;
  }
  if (!query) {
    genresContainer.classList.remove("inactive");
    getMovies(page);
  } else {
    genresContainer.classList.add("inactive");
    const { data } = await api("/search/movie?query=" + query, {
      params: {
        page: pageNumber[page] + 1,
      },
    });
    const results = data.results;
    pageNumber[page] = pageNumber[page] ? pageNumber[page] + 1 : 1;
    if (data.total_pages <= pageNumber[page] + 1) {
      searcInfObs.disconnect();
      return;
    }
    searcInfObs.observe(endElement);
    createLoadingSkeletons(moviesContainer);
    const number = results.length * (pageNumber[page] - 1);
    const filteredResults = filterGenres(results);
    createMovieCard(filteredResults, moviesContainer, number);
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
  searchInput.addEventListener("keyup", (key) => {
    if (key.key === "Enter") {
      window.location = "#explore=" + searchInput.value;
      window.location.reload();
    }
  });
  searchInput.placeholder = "Search movie...";
  const searchBtn = document.createElement("span");

  searchBtn.addEventListener("click", () => {
    window.location = "#explore=" + searchInput.value;
    window.location.reload();
  });
  searchContainer.append(searchInput, searchBtn);
});

const backButton = document.querySelector(".image .back-icon");
backButton.addEventListener("click", () => {
  history.back();
});

const getMovie = async (id) => {
  const { data } = await api("movie/" + id);
  pageNumber["details"] = pageNumber["details"] ? pageNumber["details"] + 1 : 1;
  getSimilarMovies(id);

  const img = document.querySelector(".image img");
  const title = document.querySelector(".image .title");
  const description = document.querySelector(".MovieDetails p");
  const addToFavoritesBtn = document.querySelector(".favButton");

  if (isInLocalStorage(id)) {
    addToFavoritesBtn.classList.add("added");
  } else {
    addToFavoritesBtn.classList.remove("added");
  }
  addToFavoritesBtn.onclick = null;
  addToFavoritesBtn.onclick = () =>{
    createAddToFavBtn(data, addToFavoritesBtn, 2);
  }

  img.src = `https://image.tmdb.org/t/p/original/${data.poster_path}`;
  title.innerText = data.title;
  description.innerText = data.overview;
};

const createAddToFavBtn = (data, btnElement, classListNumber) => {
  btnElement.classList.toggle("added");
  console.log(btnElement);
  if (btnElement.classList[classListNumber] === "added") {
    const storageData = localStorage.getItem("FavMovies") ?? "";
    const separation = storageData ? "---" : "";
    const newData =
      storageData +
      separation +
      `${data.id}|||${data.title}|||${data.poster_path}|||`;
    localStorage.setItem("FavMovies", newData);
  } else {
    const dataArray = localStorage.getItem("FavMovies")?.split("---");
    let dataIndex;
    dataArray.forEach((e)=>{
      const elementArray = e.split("|||");
      const id = elementArray[0]
      if(id == data.id){
        dataIndex= dataArray.indexOf(e)
      }
    })

    dataArray.splice(dataIndex,1)
    localStorage.setItem("FavMovies", dataArray.join("---"))
  }
};
const getLikedMovies = () => {
  const moviesFavsContainer = document.querySelector(".moviesFavs");
  moviesFavsContainer.innerHTML = "";
  const favsMoviesContainer = document.querySelector(".favs-movies");
  favsMoviesContainer.classList.remove("inactive");

  const dataArray = localStorage.getItem("FavMovies")?.split("---");
  const data = dataArray?.map((element) => {
    const elementArray = element.split("|||");
    return {
      id: elementArray[0],
      title: elementArray[1],
      poster_path: elementArray[2],
    };
  });
  console.log(data);
  if (data?.at(0)?.id) {
    createLoadingSkeletons(moviesFavsContainer, data.length, true);
    createMovieCard(data, moviesFavsContainer);
  } else{
    favsMoviesContainer.classList.add("inactive");
  }
  // const data = dataString.map((e) => (e));
};

const getSimilarMovies = async (id) => {
  const container = document.querySelector(".moviesRecomendations");
  createLoadingSkeletons(container, 10, true);

  const { data } = await api(`movie/${id}/recommendations`);
  createMovieCard(data.results, container);
  const subtitle = document.querySelector(".recomendations-subtitle");
  container.classList.remove("inactive");
  subtitle.classList.remove("inactive");
  if (data.total_results < 1) {
    subtitle.classList.add("inactive");
    container.classList.add("inactive");
  }
};

const isInLocalStorage = (id) => {
  const dataArray = localStorage.getItem("FavMovies")?.split("---");
  const data = dataArray?.map((element) => {
    const elementArray = element.split("|||");
    return {
      id: elementArray[0],
      title: elementArray[1],
      poster_path: elementArray[2],
    };
  });
  let bool = false;
  data?.forEach((e) => {
    if (e.id == id) {
      bool = true;
    }
  });
  return bool;
};
