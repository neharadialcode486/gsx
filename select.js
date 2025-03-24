const API_URLS = {
  location:
    "http://16.171.233.34/index.php/wp-json/wp/v2/property-city?_fields=id,name",
  propertyType:
    "http://16.171.233.34/index.php/wp-json/wp/v2/property-type?_fields=id,name",
  bedrooms:
    "http://16.171.233.34/index.php/wp-json/wp/v2/property-bed?_fields=id,name",
  bathrooms:
    "http://16.171.233.34/index.php/wp-json/wp/v2/property-bath?_fields=id,name",
  main: "http://16.171.233.34/index.php/wp-json/wp/v2/properties?acf_format=standard&per_page=99",
};

const selects = {
  location: {
    box: document.getElementById("gskLocationBox"),
    optionsContainer: document.getElementById("gskLocationOptions"),
    selected: document.getElementById("gskLocationSelected"),
    arrow: document.getElementById("gskLocationArrow"),
  },
  propertyType: {
    box: document.getElementById("gskPropertyTypeBox"),
    optionsContainer: document.getElementById("gskPropertyTypeOptions"),
    selected: document.getElementById("gskPropertyTypeSelected"),
    arrow: document.getElementById("gskPropertyTypeArrow"),
  },
  bedrooms: {
    box: document.getElementById("gskSizeBox"),
    optionsContainer: document.getElementById("gskSizeOptions"),
    selected: document.getElementById("gskSizeSelected"),
    arrow: document.getElementById("gskSizeArrow"),
  },
  bathrooms: {
    box: document.getElementById("gskPriceBox"),
    optionsContainer: document.getElementById("gskPriceOptions"),
    selected: document.getElementById("gskPriceSelected"),
    arrow: document.getElementById("gskPriceArrow"),
  },
};

let mainData = [];
let selectedOptions = {
  location: null,
  propertyType: null,
  bedrooms: null,
  bathrooms: null,
};

let optionsData = {
  propertyType: [],
  bedrooms: [],
  bathrooms: [],
};

async function fetchAndPopulateOptions() {
  const urls = Object.entries(API_URLS);
  for (const [key, url] of urls) {
    if (key !== "main") {
      const data = await fetch(url).then((res) => res.json());
      populateOptions(key, data);
    }
  }
  mainData = await fetch(API_URLS.main).then((res) => res.json());
  applyFilters();
}

function populateOptions(selectId, data) {
  if (optionsData[selectId]) {
    optionsData[selectId] = data;
  }
  const optionsContainer = selects[selectId].optionsContainer;
  optionsContainer.innerHTML = data
    .map(
      (item) =>
        `<div class="gsk-option" data-value="${item.id}">${item.name}</div>`
    )
    .join("");
  initOptionClick(selectId);
}

function initOptionClick(selectId) {
  document
    .querySelectorAll(`#${selects[selectId].optionsContainer.id} .gsk-option`)
    .forEach((option) => {
      option.addEventListener("click", (e) => {
        selects[selectId].selected.innerText = e.target.innerText;
        selects[selectId].optionsContainer.classList.remove("gsk-show");
        selects[selectId].arrow.classList.remove("gsk-rotate");
        selectedOptions[selectId] = e.target.dataset.value;
        applyFilters();
      });
    });
}

function applyFilters() {
  let filteredData = mainData;
  if (selectedOptions.location) {
    filteredData = filteredData.filter(
      (item) => item["property-city"] == selectedOptions.location
    );
  }
  if (selectedOptions.propertyType) {
    filteredData = filteredData.filter((item) =>
      item["property-type"].includes(parseInt(selectedOptions.propertyType))
    );
  }
  if (selectedOptions.bedrooms) {
    filteredData = filteredData.filter((item) =>
      item["property-bed"].includes(parseInt(selectedOptions.bedrooms))
    );
  }
  if (selectedOptions.bathrooms) {
    filteredData = filteredData.filter((item) =>
      item["property-bath"].includes(parseInt(selectedOptions.bathrooms))
    );
  }
  console.log(filteredData, "filteredDatafilteredData");
  populateFilteredOptions("propertyType", filteredData, "property-type");
  populateFilteredOptions("bedrooms", filteredData, "property-bed");
  populateFilteredOptions("bathrooms", filteredData, "property-bath");
}

function populateFilteredOptions(selectId, data, key) {
  const options = [];
  data.forEach((item) => {
    if (item[key]) {
      item[key].forEach((val) => {
        if (!options.some((opt) => opt.id == val)) {
          const nameObj = optionsData[selectId].find((opt) => opt.id == val);
          if (nameObj) {
            options.push({ id: val, name: nameObj.name });
          }
        }
      });
    }
  });
  const optionsContainer = selects[selectId].optionsContainer;
  if (options.length === 0) {
    optionsContainer.innerHTML =
      '<div class="gsk-option">No options available</div>';
  } else {
    optionsContainer.innerHTML = options
      .map(
        (item) =>
          `<div class="gsk-option" data-value="${item.id}">${item.name}</div>`
      )
      .join("");
    initOptionClick(selectId);
  }
}

function initCustomSelect(selectId) {
  const select = selects[selectId];
  select.box.addEventListener("click", () => {
    select.optionsContainer.classList.toggle("gsk-show");
    select.arrow.classList.toggle("gsk-rotate");
  });
  document.addEventListener("click", (e) => {
    if (!select.box.contains(e.target)) {
      select.optionsContainer.classList.remove("gsk-show");
      select.arrow.classList.remove("gsk-rotate");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  Object.keys(selects).forEach((key) => initCustomSelect(key));
  fetchAndPopulateOptions();
});
