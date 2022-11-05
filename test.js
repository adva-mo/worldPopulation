const table = document.querySelector(".table");
const titles = ["Name", "Hair", "Height", "Planet Name", "Planet Population"];

// fetch the data
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (e) {
    console.log(e);
  }
}; //will return promise

const getArrOfCharacters = async () => {
  const { results } = await fetchData("https://swapi.dev/api/people/");

  const arrPromises = [];
  for (let i = 0; i < results.length; i++) {
    const planet = fetchData(results[i].homeworld);
    arrPromises.push(planet);
  }
  //* Good practice
  const arrOfWorlds = await Promise.all(arrPromises);
  const structureData = structureCharObj(results, arrOfWorlds);
  return structureData;

  //   //! Bad practice ↓
  //   const arrOfWorlds = [];
  //   for (let i = 0; i < results.length; i++) {
  //     const planet = await fetchData(results[i].homeworld);
  //     arrOfWorlds.push(planet);
  //   }
  //   const structureData = structureCharObj(results, arrOfWorlds);
  //   return structureData;
};

const structureCharObj = (charArr, worldsArr) => {
  return charArr.map((char, index) => {
    return {
      name: char.name,
      hair: char.hair_color,
      height: char.height,
      planet: {
        name: worldsArr[index].name,
        population: worldsArr[index].population,
      },
    };
  });
};

// display the data
const paintHead = (text) => {
  const heading = document.createElement("div");
  heading.textContent = text;
  heading.classList.add("title");
  table.appendChild(heading);
};
const paintRow = (arrOfData) => {
  const row = document.createElement("div");
  row.classList.add("row");

  arrOfData.forEach((e) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.textContent = e;
    row.appendChild(cell);
  });

  table.appendChild(row);
};

function setSpinner(bool) {
  if (bool) {
    const spinner = document.createElement("h3");
    spinner.textContent = "Loading";
    table.appendChild(spinner);
  } else {
    const spinner = document.querySelector("h3");
    table.removeChild(spinner);
  }
}

const paintPage = async () => {
  let isLoading = true;
  paintHead("Star Wars");
  paintRow(titles);
  setSpinner(isLoading);
  const charDataArr = await getArrOfCharacters();
  charDataArr.forEach((char) => {
    const newArr = [
      char.name,
      char.hair,
      char.height,
      char.planet.name,
      char.planet.population,
    ];
    paintRow(newArr);
  });
  isLoading = false;
  setSpinner(isLoading);
};
paintPage();
// style HTML

//! OFF topic
const obj = {
  name: "Bob",
  last: "Marley",
};
// const name = obj.name;
// const last = obj.last;
// * Both the same ↑
const { last, name } = obj;
