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
let myChart;
const continentsBtns = document.querySelectorAll(".continent-btn");
let countriesContainer = document.querySelector(".countries-container");
let chartContainer = document.querySelector(".chart-container");

//! ------------------------ async functions ------------------------

const fetchCountriesAndPopulation = async (continent) => {
  try {
    const data = await fetch(
      `https://restcountries.com/v3.1/region/${continent}`
    );
    const res = await data.json();
    transformCountriesData(res, continent);
  } catch {
    console.log("error" + e);
  }
};

const transformCountriesData = async (arr, continent) => {
  try {
    countriesArr = await arr;
    // console.log(countriesArr);
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

//! ------------------------ continents clicks functions ------------------------

const addContinentsEvents = () => {
  continentsBtns.forEach((btn) => {
    btn.addEventListener("click", handleContinentClicks);
  });
};

const handleContinentClicks = async (e) => {
  app.continentDisplay = e.target.id;
  if (app.data[e.target.id].length > 0) {
    createChart();
    return;
  } else {
    await fetchCountriesAndPopulation(e.target.id);
    createChart();
  }
};
//! ------------------------ create countries buttons functions ------------------------

const createCountriesBTN = (continent) => {
  // console.log(app.data[continent]);
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
    console.log(data);
    transformCitiesData(data, e);
  } catch {
    console.log("error");
  }
};

const transformCitiesData = async (data, e) => {
  try {
    const rawInfon = await data;
    console.log(rawInfon);
    let country = e.target.id; //!fix the prblem that official name needto convert into capitalCamal
    country = country[0].toUpperCase() + country.slice(1);
    console.log(country);
    let countryOBJ = app.data[app.continentDisplay].find((c) => {
      return c.name == country;
    });
    if (countryOBJ == undefined) {
      console.log("undefinde");
      countryOBJ = app.data[app.continentDisplay].find((c) => {
        return c.official == country;
      });
    }
    console.log(countryOBJ);
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

//? mali etiophia venezuela el salvador, trinidad and tobago

//! ------------------------ CHART------------------------
function displayChart(labels, data1) {
  if (myChart != undefined) myChart.destroy();

  const data = {
    labels: [...labels],
    datasets: [
      {
        label: "My First dataset",
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgb(255, 99, 132)",
        data: [...data1],
      },
    ],
  };
  const config = {
    type: "bar",
    data: data,
    options: {},
  };

  canvas = document.createElement("canvas");
  canvas.setAttribute("id", "canvas");
  chartContainer.appendChild(canvas);

  myChart = new Chart(document.getElementById("canvas"), config);
}

function getChartLables() {
  const labels = app.data[app.continentDisplay].map((country) => {
    return country.name;
  });
  return labels;
}
function getChartValues() {
  const values = app.data[app.continentDisplay].map((country) => {
    return country.population;
  });
  return values;
}

function createChart() {
  const labels = getChartLables();
  const data = getChartValues();
  displayChart(labels, data);
}
