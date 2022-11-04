const app = {
  data: {
    europe: [],
    africa: [],
    asia: [],
    oceania: [],
    americas: [],
  },
  currentSortOption: null,
  countriesToDisplay: null,
};
const continentsBtns = document.querySelectorAll(".continent-btn");
const countriesContainer = document.querySelector(".countries-container");

//! ------------------------ async functions ------------------------

const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
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
    res.forEach((c) => {
      console.log(c.name.common);
    });
    transformCountriesData(res, continent);
  } catch {
    console.log("error" + e);
  }
};

const transformCountriesData = async (arr, continent) => {
  try {
    countriesArr = await arr;
    console.log(countriesArr);
    const res = countriesArr
      .map((country) => {
        const countryObj = {};
        countryObj["name"] = country.name.common;
        countryObj["population"] = country.population;
        countryObj["flag"] = country.flag;
        countryObj["officialN"] = country.name.official;

        return countryObj;
      })
      .sort((a, b) => {
        return b.population - a.population;
      });
    app.data[continent] = [...res.slice(0, 25)];
    await arrangeCountriesNames(continent);
    addCountriesBtn();
  } catch {
    console.log("error");
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
    console.log("country data is full");
    return;
  }
  fetchCountriesData(e.target.id);
};
//! ------------------------ create countries buttons functions ------------------------

const arrangeCountriesNames = async (continent) => {
  const countries = [];
  for (cont in app.data) {
    app.data[cont].forEach((country) => {
      countries.push(country.name);
    });
  }
  app.countriesToDisplay = [...countries.sort()];
};

const addCountriesBtn = () => {
  app.countriesToDisplay.forEach((country) => {
    let button = document.createElement("button");
    button.setAttribute("id", `${country.toLowerCase()}`);
    // button.setAttribute("official-n", `${country.toLowerCase()}`);
    button.classList.add("country-btn");
    button.textContent = `${country}`;
    countriesContainer.append(button);
  });
  addCountriesClicks();
};

const addCountriesClicks = () => {
  const countriesBTN = document.querySelectorAll(".country-btn");
  countriesBTN.forEach((btn) => {
    btn.addEventListener("click", handleCountryClick);
  });
};

//! ------------------------ display cities data functions------------------------

const handleCountryClick = async (e) => {
  try {
    // const res = await fetch(
    //   "https://countriesnow.space/api/v0.1/countries/population/cities/filter",
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       limit: 10,
    //       order: "dec",
    //       orderBy: "population",
    //       country: `${e.target.id}`,
    //     }),
    //   }
    // );
    // const data = await res.json();
    // console.log(data);
    // transformCitiesData(data);
    const res = await fetch(
      "https://countriesnow.space/api/v0.1/countries/population/cities/filter",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: 10,
          order: "dec",
          orderBy: "population",
          country: `${e.target.id}`,
        }),
      }
    );
    const data = await res.json();
    console.log(data);
    transformCitiesData(data);
  } catch {
    console.log("error");
  }
};

const transformCitiesData = async (data) => {
  const rawInfon = await data;
  console.log(rawInfon);
};
//! ------------------------ App srats here ------------------------

const startApp = () => {
  addContinentsEvents();
};

startApp();

//? "United Kingdom of Great Britain and Northern Ireland",- check for proper name
//?republic of finland
