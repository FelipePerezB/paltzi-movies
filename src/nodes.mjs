const getTag = (selector) => document.querySelector(selector);

const nodes = {
  nav: getTag("nav"),
  pages:{
    Home: getTag(".Home"),
    Trends: getTag(".Trends"),
    Explore: getTag(".Explore"),
    MovieDetails: getTag(".MovieDetails"),
  }
};

// export default nodes;
