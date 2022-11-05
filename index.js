const app = {
  data: {
    europe: [],
    africa: [],
    asia: [],
    oceania: [],
    americas: [],
  },
  currentSortOption: null,
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
    console.log("fetching");
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
    // createCountriesBTN(continent);
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
//! ------------------------ countries clicks functions ------------------------

const addCountriesClicks = () => {
  const countriesBTN = document.querySelectorAll(".country-btn");
  countriesBTN.forEach((btn) => {
    btn.addEventListener("click", handleCountryClick);
  });
};

async function handleCountryClick(e) {
  app.countryToDisplay = e.target.id;
  if (true) {
    await fetchCitiesInfo(e);
    createChart();
  } else {
    // createChart()
  }
}
//! ------------------------ display cities population functions------------------------

const fetchCitiesInfo = async (e) => {
  try {
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
    if (data.error == true) {
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
    const data = await res.json();
    if (data.error == false) transformCitiesData(data, e);
  } catch {
    console.log("error");
  }
};

const transformCitiesData = async (data, e) => {
  try {
    const rawInfo = await data;
    if (rawInfo.error) {
      console.log(rawInfo.msg);
      return;
    }
    let countryOBJ = app.data[app.continentDisplay].find((c) => {
      return c.name == e.target.id;
    });
    if (countryOBJ == undefined) {
      countryOBJ = app.data[app.continentDisplay].find((c) => {
        return c.official == e.target.id;
      });
    }
    const cities = [];
    rawInfo.data.forEach((c) => {
      const cityObj = {};
      cityObj["city"] = c.city;
      cityObj["population"] = c.populationCounts[0].value;
      cityObj["year"] = c.populationCounts[0].year;
      cities.push(cityObj);
    });
    countryOBJ.cities = [...cities]; //=array of city objects
    app.countryToDisplay = countryOBJ;
  } catch {
    console.log("error");
  }
};

//! ------------------------ App srats here ------------------------

const startApp = () => {
  addContinentsEvents();
};

startApp();

//? taiwan mali etiophia venezuela el salvador, trinidad and tobago drcongo somalia

//! ------------------------ CHART------------------------
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
  if (myChart != undefined) myChart.destroy();

  const data = {
    labels: [...data1[0]],
    datasets: [
      {
        label: "population",
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgb(174,174,174)",
        color: "#eeeeee;",
        data: [...data1[1]],
        borderWidth: "2px",
      },
      {
        label: "population",
        backgroundColor: "rgba(174,174,174,0.6)",
        borderColor: "rgba(174,174,174,0.6)",
        data: [...data1[1]],
        borderWidth: 2,
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

//! ------------------------ CHART - CITIES------------------------

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
