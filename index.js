const app = {
  data: {
    europe: [],
    africa: [],
    asia: [],
    oceania: [],
    americas: [],
  },
  currentSortOption: null,
};
const continentsBtns = document.querySelectorAll(".continent-btn");

//! ------------------------ async functions ------------------------

const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    // return data;
  } catch (e) {
    console.log("ERROE" + e);
  }
};

const fetchCountriesData = async (continent) => {
  try {
    const data = await fetch(
      `https://restcountries.com/v3.1/region/${continent}`
    );
    const res = await data.json();
    console.log(res);
    getCountriesData(res, continent);
  } catch {
    console.log("error" + e);
  }
};

const getCountriesData = async (arr, continent) => {
  try {
    countriesArr = await arr;
    const res = countriesArr
      .map((country) => {
        const countryObj = {};
        countryObj["name"] = country.name.common;
        countryObj["population"] = country.population;
        countryObj["flag"] = country.flag;
        return countryObj;
      })
      .sort((a, b) => {
        return b.population - a.population;
      });
    app.data[continent] = [...res.slice(0, 19)];
  } catch {
    console.log("error" + e);
  }
};

//! ------------------------ continents buttons functions ------------------------

const addContinentsEvents = () => {
  continentsBtns.forEach((btn) => {
    btn.addEventListener("click", showCountriesData);
  });
};

const showCountriesData = (e) => {
  if (app.data[e.target.id].length > 0) {
    console.log("country data full");
    return;
  }
  console.log(e.target.id);
  fetchCountriesData(e.target.id);
};

//! ------------------------ App srats here ------------------------

const startApp = () => {
  addContinentsEvents();
};

startApp();
