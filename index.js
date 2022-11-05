const app = {
  data: {
    europe: [],
    africa: [],
    asia: [],
    oceania: [],
    americas: [],
  },
  countryToDisplay: null,
  continentDisplay: null,
};
let myChart;
const continentsBtns = document.querySelectorAll(".continent-btn");
let countriesContainer = document.querySelector(".countries-container");
let chartContainer = document.querySelector(".chart-container");

//! ------------------------ async functions ------------------------

const fetchCountriesAndPopulation = async (continent) => {
  try {
    setSpinner(true);
    const data = await fetch(
      `https://restcountries.com/v3.1/region/${continent}`
    );
    const res = await data.json();
    console.log(res);
    transformCountriesData(res, continent);
    setSpinner(false);
  } catch {
    console.log("error");
  }
};

const transformCountriesData = async (arr, continent) => {
  try {
    countriesArr = await arr;
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
    app.data[continent] = [...res.slice(0, 45)];
  } catch {
    console.log("error");
  }
};

//! ------------------------ continents clicks events ------------------------

const addContinentsEvents = () => {
  continentsBtns.forEach((btn) => {
    btn.addEventListener("click", handleContinentClicks);
  });
};

const handleContinentClicks = async (e) => {
  app.continentDisplay = e.target.id;
  app.countryToDisplay = null;
  if (app.data[e.target.id].length > 0) {
    createChart();
    createCountriesBTN();
    return;
  } else {
    await fetchCountriesAndPopulation(e.target.id);
    createChart();
    createCountriesBTN();
  }
};

const createCountriesBTN = () => {
  countriesContainer.textContent = "";
  app.data[app.continentDisplay]
    .sort((a, b) => {
      //* check the sort
      return a.name - b.name;
    })
    .forEach((c) => {
      let button = document.createElement("button");
      button.setAttribute("id", `${c.name}`);
      button.setAttribute("official", `${c.official}`);
      button.classList.add("country-btn");
      button.textContent = `${c.name}`;
      countriesContainer.append(button);
    });
  addCountriesClicks();
};
//! ------------------------ countries clicks events ------------------------

const addCountriesClicks = () => {
  const countriesBTN = document.querySelectorAll(".country-btn");
  countriesBTN.forEach((btn) => {
    btn.addEventListener("click", handleCountryClick);
  });
};

async function handleCountryClick(e) {
  app.countryToDisplay = app.data[app.continentDisplay].find((country) => {
    return country.name == e.target.id;
  });
  if (app.countryToDisplay.cities) {
    createChart();
  } else {
    await fetchCitiesInfo(e);
  }
}

function setSpinner(bool) {
  if (bool) {
    const spinner = document.createElement("h3");
    spinner.textContent = "Loading";
    spinner.classList.add("spinner");
    chartContainer.appendChild(spinner);
  } else {
    const spinner = document.querySelector("h3");
    chartContainer.removeChild(spinner);
  }
}

function displayErrorMsg() {
  setSpinner(false);
  let errorMsg = document.createElement("div");
  errorMsg.textContent = `Oops...\n
  information for ${app.countryToDisplay.name} is'nt available!`;
  errorMsg.classList.add("error");
  chartContainer.appendChild(errorMsg);
  setTimeout(() => {
    errorMsg.remove();
  }, 2000);
}

//! ------------------------ fetch cities population functions------------------------

const fetchCitiesInfo = async (e) => {
  try {
    setSpinner(true);
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
    // console.log(data);
    if (data.error) {
      await fetchCitiesPopByOfficial(e);
    } else {
      transformCitiesData(data, e);
    }
  } catch {
    console.log("error");
  }
};

const fetchCitiesPopByOfficial = async (e) => {
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
    if (res.ok == false) {
      displayErrorMsg();
      return;
    }
    const data = await res.json();
    if (data.error == false) transformCitiesData(data, e);
  } catch {
    console.log("error");
  }
};

const transformCitiesData = async (data) => {
  try {
    const rawInfo = await data;
    console.log(rawInfo);
    setSpinner(false);
    const cities = [];
    rawInfo.data.forEach((c) => {
      const cityObj = {};
      cityObj["city"] = c.city;

      cityObj["population"] = c.populationCounts[0].value;
      cityObj["year"] = c.populationCounts[0].year;
      cities.push(cityObj);
    });
    app.countryToDisplay.cities = [...cities];
    createChart();
  } catch {
    console.log("error");
  }
};

//! ------------------------ App srats here ------------------------

const startApp = () => {
  addContinentsEvents();
};

startApp();

//! ------------------------ CHART functions ------------------------
async function createChart() {
  if (app.countryToDisplay) {
    const labelsAndValues = getCitiesLables();
    displayChart(labelsAndValues);
  } else {
    const labelsandVal = getCountriesLables();
    displayChart(labelsandVal);
  }
}

function displayChart(data1) {
  if (myChart != undefined) {
    myChart.destroy();
    canvas.remove();
  }
  const data = {
    labels: [...data1[0]],
    datasets: [
      {
        label: "Population",
        backgroundColor: [
          "rgb(147,209,255)",
          "rgb(120,196,253)",
          "rgb(96,186,253)",
          "rgb(62,172,255)",
          "rgb(13,151,255)",
        ],
        color: "#eeeeee;",
        data: [...data1[1]],
        borderWidth: 2,
        borderColor: "rgb(174,174,174)",
        hoverBorderWidth: 2,
        hoverBorderColor: "rgb(153,153,153)",
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

function getCountriesLables() {
  const labels = app.data[app.continentDisplay].map((country) => {
    return `${country.name} ${country.flag}`;
  });
  const values = app.data[app.continentDisplay].map((country) => {
    return country.population;
  });
  return [labels, values];
}

function getCitiesLables() {
  const lables = [];
  const values = [];
  for (key in app.countryToDisplay) {
    if (key == "cities") {
      for (city of app.countryToDisplay.cities) {
        lables.push(city.city);
        values.push(city.population);
      }
    }
  }
  return [lables, values];
}
