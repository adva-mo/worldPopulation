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
  continentDisplay: null,
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
    // res.forEach((c) => {});
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
        countryObj["official"] = country.name.official;
        countryObj["cities"] = null;

        return countryObj;
      })
      .sort((a, b) => {
        return b.population - a.population;
      });
    app.data[continent] = [...res.slice(0, 25)];
    createCountriesBTN(continent);
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
  app.continentDisplay = e.target.id;
  if (app.data[e.target.id].length > 0) {
    console.log("country data is full");
    return;
  }
  fetchCountriesData(e.target.id);
};
//! ------------------------ create countries buttons functions ------------------------

const createCountriesBTN = (continent) => {
  console.log(app.data[continent]);
  app.data[continent]
    .sort((a, b) => {
      return a.name - b.name;
    })
    .forEach((c) => {
      //   console.log(c);
      let button = document.createElement("button");
      button.setAttribute("id", `${c.name.toLowerCase()}`);
      button.setAttribute("official", `${c.official.toLowerCase()}`);
      button.classList.add("country-btn");
      button.textContent = `${c.name}`;
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
    let offic = e.target.getAttribute("official");
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
          country: `${offic}`,
          country: `${e.target.id}`,
        }),
      }
    );
    const data = await res.json();
    if (data.error == false) {
      //   console.log(data);
      transformCitiesData(data, e);
    } else {
      console.log("no city by common name");
      handleCountryClickByOfficial(e);
    }
    // console.log(data);
  } catch {
    console.log("error");
  }
};

const handleCountryClickByOfficial = async (e) => {
  //   console.log("ok");
  try {
    let offic = e.target.getAttribute("official");
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
          country: `${offic}`,
        }),
      }
    );
    const data = await res.json();
    // console.log(data);
    transformCitiesData(data, e);
  } catch {
    console.log("error");
  }
};

const transformCitiesData = async (data, e) => {
  try {
    const rawInfon = await data;
    let country = e.target.id;
    country = country[0].toUpperCase() + country.slice(1);
    const countryOBJ = app.data[app.continentDisplay].find((c) => {
      return c.name == country;
    });
    const cities = [];
    rawInfon.data.forEach((c) => {
      const cityObj = {};
      cityObj["city"] = c.city;
      cityObj["population"] = c.populationCounts[0].value;
      cityObj["year"] = c.populationCounts[0].year;
      cities.push(cityObj);
    });
    countryOBJ.cities = [...cities];
  } catch {
    console.log("error in transformCitiesData ");
  }
};

//! ------------------------ App srats here ------------------------

const startApp = () => {
  addContinentsEvents();
};

startApp();

//? mali etiophia venezuela
