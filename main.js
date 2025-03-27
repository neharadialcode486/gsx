const appURL = "http://16.171.233.34/index.php/wp-json/wp/v2";

// Properties container
const propertiesContainer = document.querySelector("#gsk_property_list");
const totalPropertiesCountContainer =
  document.querySelector("#total_properties");

// Price range
const minInput = document.getElementById("gskMinInput");
const maxInput = document.getElementById("gskMaxInput");
const range = document.getElementById("gskRange");

// Select inputs
const selectCity = document.querySelector("select[name='city']");
const selectType = document.querySelector("select[name='type']");
const selectBeds = document.querySelector("select[name='bed']");
const selectBaths = document.querySelector("select[name='bath']");

//buttons
const submitButton = document.querySelector("#submit-btn");
const resetButton = document.querySelector("#reset-btn");

// Globals
let MANAGERS = [];
let TAGS = [];
let PROP_TYPE = [];
let CITY = [];
let BED = [];
let BATH = [];
let PROPERTIES = [];
let FILTERED_PROPERTIES = [];
let FILTERED_PROPERTIES_TYPE = [];
let FILTER_QUERY = { minPrice: 0, maxPrice: 2500 };
let STATE = "loading";

//disabling selects
selectCity.disabled = true;
selectType.disabled = true;
selectBeds.disabled = true;
selectBaths.disabled = true;

const renderOptions = (selectElement, options) => {
  options.forEach((option) => {
    selectElement.innerHTML += `<option value='${option.id}'>${option.name}</option>`;
  });
};

const resetOptions = (selectElement, label) => {
  selectElement.innerHTML = `<option value=''>Select ${label}</option>`;
};

const getValueById = (array, id, id_label = "id") => {
  const item = array.find((element) => element[id_label] === id);
  return item;
};

const sortByName = (arr) => {
  return arr.sort((a, b) => {
    const nameA = a.name.replace(/\D+/g, "") || "0";
    const nameB = b.name.replace(/\D+/g, "") || "0";
    const numA = parseInt(nameA, 10);
    const numB = parseInt(nameB, 10);

    if (numA !== numB) return numA - numB;

    return a.name.localeCompare(b.name);
  });
};

const renderPropertyTags = (tags) => {
  let tagString = "";
  tags.map(
    (tag) => (tagString += `<p>${getValueById(TAGS, tag, "id").name}</p>`)
  );
  return tagString;
};

const propertyCard = (property) => {
  const manager = getValueById(MANAGERS, property.acf.manager[0].ID);

  return `
    <div class="sgk_properties_card">
        <div class="gsk_property_card_image">
          <img
            src="${
              property._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
              "https://via.placeholder.com/150"
            }"
            alt="property image"
          />
          <div class="gsk_absolute_text">
            <p>${getValueById(PROP_TYPE, property["property-type"][0]).name}</p>
            ${renderPropertyTags(property["property-tag"])}
          </div>
        </div>
        <div class="gsk_card_content">
          <div>
            <p class="gsk_property_card_heading">Starting From</p>
            <p class="gsk_amount">$${
              property.acf.price_from || "N/A"
            } <span> /mo </span></p>
          </div>
          <p class="gsk_property_card_name">${property.acf.property_name}</p>
          <div class="gsk_property_location">
            <span><svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 16" fill="none"><g clip-path="url(#clip0_70_139)"><path d="M9.24902 6C9.22819 6.70833 8.98861 7.30208 8.53027 7.78125C8.05111 8.23958 7.45736 8.47917 6.74902 8.5C6.04069 8.47917 5.44694 8.23958 4.96777 7.78125C4.50944 7.30208 4.26986 6.70833 4.24902 6C4.26986 5.29167 4.50944 4.69792 4.96777 4.21875C5.44694 3.76042 6.04069 3.52083 6.74902 3.5C7.45736 3.52083 8.05111 3.76042 8.53027 4.21875C8.98861 4.69792 9.22819 5.29167 9.24902 6ZM6.74902 5C6.45736 5 6.21777 5.09375 6.03027 5.28125C5.84277 5.46875 5.74902 5.70833 5.74902 6C5.74902 6.29167 5.84277 6.53125 6.03027 6.71875C6.21777 6.90625 6.45736 7 6.74902 7C7.04069 7 7.28027 6.90625 7.46777 6.71875C7.65527 6.53125 7.74902 6.29167 7.74902 6C7.74902 5.70833 7.65527 5.46875 7.46777 5.28125C7.28027 5.09375 7.04069 5 6.74902 5ZM12.749 6C12.7074 6.9375 12.374 8.02083 11.749 9.25C11.1032 10.4792 10.374 11.6667 9.56152 12.8125C8.74902 13.9792 8.06152 14.9062 7.49902 15.5938C7.29069 15.8438 7.04069 15.9688 6.74902 15.9688C6.45736 15.9688 6.20736 15.8438 5.99902 15.5938C5.43652 14.9062 4.73861 13.9792 3.90527 12.8125C3.09277 11.6667 2.37402 10.4792 1.74902 9.25C1.12402 8.02083 0.79069 6.9375 0.749023 6C0.79069 4.29167 1.37402 2.875 2.49902 1.75C3.62402 0.625 5.04069 0.041667 6.74902 0C8.45736 0.041667 9.87402 0.625 10.999 1.75C12.124 2.875 12.7074 4.29167 12.749 6ZM6.74902 1.5C5.47819 1.54167 4.41569 1.97917 3.56152 2.8125C2.72819 3.66667 2.29069 4.72917 2.24902 6C2.24902 6.39583 2.40527 6.98958 2.71777 7.78125C3.07194 8.57292 3.51986 9.40625 4.06152 10.2812C4.49902 11.0104 4.95736 11.6979 5.43652 12.3438C5.91569 13.0104 6.35319 13.6042 6.74902 14.125C7.14486 13.6042 7.58236 13.0208 8.06152 12.375C8.54069 11.7083 8.99902 11.0104 9.43652 10.2812C9.97819 9.40625 10.4261 8.57292 10.7803 7.78125C11.0928 6.98958 11.249 6.39583 11.249 6C11.2074 4.72917 10.7699 3.66667 9.93652 2.8125C9.08236 1.97917 8.01986 1.54167 6.74902 1.5Z" fill="#1C2D37"></path></g><defs><clipPath id="clip0_70_139"><rect width="12" height="16" fill="white" transform="matrix(1 0 0 -1 0.749023 16)"></rect></clipPath></defs></svg> ${
              property.acf.address || "N/A"
            }</span>
          </div>
          <p class="gsk_property_desc">${property.acf.about_property}</p>

          <div class="gsk_profile_and_buttons">
            <div class="gsk_profile_container">
              <img
                src="${
                  manager.acf.logo.url ||
                  "http://16.171.233.34/wp-content/uploads/2025/01/Photo-2025-02-03-11-39-53-AM.jpg"
                }"
                alt="profile"
              />
              <div>
                <p class="gsk_profile_name">
                  ${manager.acf.name || "N/A"} 
<svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M5.73366 15L4.46699 12.8667L2.06699 12.3333L2.30033 9.86667L0.666992 8L2.30033 6.13333L2.06699 3.66667L4.46699 3.13333L5.73366 1L8.00033 1.96667L10.267 1L11.5337 3.13333L13.9337 3.66667L13.7003 6.13333L15.3337 8L13.7003 9.86667L13.9337 12.3333L11.5337 12.8667L10.267 15L8.00033 14.0333L5.73366 15ZM6.30033 13.3L8.00033 12.5667L9.73366 13.3L10.667 11.7L12.5003 11.2667L12.3337 9.4L13.567 8L12.3337 6.56667L12.5003 4.7L10.667 4.3L9.70033 2.7L8.00033 3.43333L6.26699 2.7L5.33366 4.3L3.50033 4.7L3.66699 6.56667L2.43366 8L3.66699 9.4L3.50033 11.3L5.33366 11.7L6.30033 13.3ZM7.30033 10.3667L11.067 6.6L10.1337 5.63333L7.30033 8.46667L5.86699 7.06667L4.93366 8L7.30033 10.3667Z"
                fill="#00BB06"
              ></path>
            </svg>

                </p>
                <p class="gsk_profile_post">Manager</p>
              </div>
            </div>
            <div class="gsk_btn_container">
              <a
                class="gsk_view_details_btn"
                href="${property.link}"
                target="_blank"
              >
              <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M13.3337 1.66675H6.66699C3.90949 1.66675 1.66699 3.90925 1.66699 6.66675V17.5001C1.66699 17.7211 1.75479 17.9331 1.91107 18.0893C2.06735 18.2456 2.27931 18.3334 2.50033 18.3334H13.3337C16.0912 18.3334 18.3337 16.0909 18.3337 13.3334V6.66675C18.3337 3.90925 16.0912 1.66675 13.3337 1.66675ZM16.667 13.3334C16.667 15.1717 15.172 16.6667 13.3337 16.6667H3.33366V6.66675C3.33366 4.82841 4.82866 3.33341 6.66699 3.33341H13.3337C15.172 3.33341 16.667 4.82841 16.667 6.66675V13.3334Z"
              fill="white"
            ></path>
            <path
              d="M5.83301 7.5H14.1663V9.16667H5.83301V7.5ZM5.83301 10.8333H11.6663V12.5H5.83301V10.8333Z"
              fill="white"
            ></path>
          </svg>
                View Details
              </a>
              <a
                class="gsk_profile_btn"
                target="_blank"
                href="${property.acf.book_an_appointment_link || "#"}"
              >      <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M2.50033 17.1583L5.49199 14.1667H15.0003C15.4424 14.1667 15.8663 13.9911 16.1788 13.6785C16.4914 13.3659 16.667 12.942 16.667 12.5V5C16.667 4.55797 16.4914 4.13405 16.1788 3.82149C15.8663 3.50893 15.4424 3.33333 15.0003 3.33333H4.16699C3.72496 3.33333 3.30104 3.50893 2.98848 3.82149C2.67592 4.13405 2.50033 4.55797 2.50033 5V17.1583ZM2.50033 18.3333H1.66699V5C1.66699 4.33696 1.93038 3.70107 2.39923 3.23223C2.86807 2.76339 3.50395 2.5 4.16699 2.5H15.0003C15.6634 2.5 16.2993 2.76339 16.7681 3.23223C17.2369 3.70107 17.5003 4.33696 17.5003 5V12.5C17.5003 13.163 17.2369 13.7989 16.7681 14.2678C16.2993 14.7366 15.6634 15 15.0003 15H5.83366L2.50033 18.3333Z"
              fill="#002A52"
            ></path>
          </svg>
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
};

const renderProperties = (properties) => {
  propertiesContainer.innerHTML = "";

  for (const property of properties) {
    propertiesContainer.innerHTML += propertyCard(property);
  }

  totalPropertiesCountContainer.innerHTML = properties.length;
};

const setLoading = () => {
  STATE = "loading";
  propertiesContainer.innerHTML =
    '<div class="gsk_loader_container"><div class="gsk_loader"></div></div>';
  totalPropertiesCountContainer.innerHTML = '<div class="gsk_loader_small">';
};

const setError = () => {
  propertiesContainer.innerHTML = `<div class="gsk_error_container">Something went wrong!</div>`;
  totalPropertiesCountContainer.innerHTML = "0";
};

const setNoResults = () => {
  propertiesContainer.innerHTML = `<div class="gsk_error_container">Nothing Found!</div>`;
  totalPropertiesCountContainer.innerHTML = "0";
};

const getAllProperties = async () => {
  try {
    const response = await fetch(
      `${appURL}/properties?acf_format=standard&per_page=99&_embed`
    );

    if (!response.ok) {
      setError();
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    PROPERTIES = data;
    FILTERED_PROPERTIES = data;

    data.length > 0 && renderProperties(data);

    return data;
  } catch (error) {
    console.error("Failed to fetch properties:", error.message);
    return null; // or handle the error in a way that suits your app
  }
};

const getAllTags = async () => {
  try {
    const response = await fetch(
      `${appURL}/property-tag?acf_format=standard&per_page=99`
    );

    if (!response.ok) {
      setError();
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    TAGS = data;
  } catch (error) {
    console.error("Failed to fetch tags:", error.message);
    return null; // or handle the error in a way that suits your app
  }
};

const getAllManagers = async () => {
  try {
    const response = await fetch(
      `${appURL}/manager?acf_format=standard&per_page=99`
    );

    if (!response.ok) {
      setError();
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    MANAGERS = data;
  } catch (error) {
    console.error("Failed to fetch managers:", error.message);
    return null; // or handle the error in a way that suits your app
  }
};

const getAllPropBath = async () => {
  try {
    const response = await fetch(
      `${appURL}/property-bath?acf_format=standard&per_page=99`
    );

    if (!response.ok) {
      setError();
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    BATH = data;
  } catch (error) {
    console.error("Failed to fetch property baths:", error.message);
    return null; // or handle the error in a way that suits your app
  }
};

const getAllPropBed = async () => {
  try {
    const response = await fetch(
      `${appURL}/property-bed?acf_format=standard&per_page=99`
    );

    if (!response.ok) {
      setError();
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    renderOptions(selectBeds, data);
    BED = data;
  } catch (error) {
    console.error("Failed to fetch property beds:", error.message);
    return null; // or handle the error in a way that suits your app
  }
};

const getAllPropCity = async () => {
  try {
    const response = await fetch(
      `${appURL}/property-city?acf_format=standard&per_page=99`
    );

    if (!response.ok) {
      setError();
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    renderOptions(selectCity, data);
    CITY = data;
  } catch (error) {
    console.error("Failed to fetch property cities:", error.message);
    return null; // or handle the error in a way that suits your app
  }
};

const getAllPropTypes = async () => {
  try {
    const response = await fetch(
      `${appURL}/property-type?acf_format=standard&per_page=99`
    );

    if (!response.ok) {
      setError();
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    renderOptions(selectType, data);
    PROP_TYPE = data;
  } catch (error) {
    console.error("Failed to fetch property types:", error.message);
    return null; // or handle the error in a way that suits your app
  }
};

const getInitialData = async () => {
  await getAllManagers();
  await getAllPropTypes();
  await getAllTags();
  await getAllPropCity();
  await getAllPropBath();
  await getAllPropBed();
  await getAllProperties();

  getFiltersFromURL();

  STATE = "done";

  selectCity.disabled = false;
  selectType.disabled = false;
  selectBeds.disabled = false;
  selectBaths.disabled = false;
};

setLoading();

getInitialData();

/// mobile menu open/close
const btn = document.getElementById("gsk_mobile_filter_btn");
const overlay = document.getElementById("gsk_mobile_overlay");
const cross = document.getElementById("gsk_mobile_cross");
const sidebar = document.getElementById("gsk_mobile_sidebar");
btn.addEventListener("click", function () {
  sidebar.style.left = "0px";
  overlay.style.display = "block";
});

overlay.addEventListener("click", function () {
  sidebar.style.left = "-400px";
  overlay.style.display = "none";
});
cross.addEventListener("click", function () {
  sidebar.style.left = "-400px";
  overlay.style.display = "none";
});

// Hierarchal Filter City
selectCity.addEventListener("change", (e) => {
  resetOptions(selectType, "Type");
  resetOptions(selectBeds, "Bedrooms");
  resetOptions(selectBaths, "Bathrooms");

  const selectedCity = e.target.value;

  FILTER_QUERY.type = "";
  FILTER_QUERY.bed = "";
  FILTER_QUERY.bath = "";

  FILTER_QUERY.city = selectedCity;

  if (!selectedCity) {
    renderOptions(selectBeds, BED);
    renderOptions(selectType, PROP_TYPE);
    FILTER_QUERY.city = "";
    appyFilters();
    return;
  }

  appyFilters();

  FILTERED_PROPERTIES = PROPERTIES.filter(
    (prop) => Number(prop["property-city"][0]) === Number(selectedCity)
  );

  const types = [
    ...new Set(FILTERED_PROPERTIES.map((prop) => prop["property-type"][0])),
  ];

  const options = types
    .map((type) => getValueById(PROP_TYPE, type))
    .filter(Boolean);
  renderOptions(selectType, options);
});

// Hierarchal Filter Type
selectType.addEventListener("change", (e) => {
  resetOptions(selectBeds, "Bedrooms");
  resetOptions(selectBaths, "Bathrooms");

  const selectedType = e.target.value;

  FILTER_QUERY.bed = "";
  FILTER_QUERY.bath = "";

  FILTER_QUERY.type = selectedType;

  if (!selectedType) {
    FILTER_QUERY.type = "";
    appyFilters();
    return;
  }

  appyFilters();

  const PROPERTIES_TO_FILTER =
    FILTERED_PROPERTIES.length < 1 ? PROPERTIES : FILTERED_PROPERTIES;

  FILTERED_PROPERTIES_TYPE = PROPERTIES_TO_FILTER.filter(
    (prop) => Number(prop["property-type"][0]) === Number(selectedType)
  );

  const beds = [
    ...new Set(
      FILTERED_PROPERTIES_TYPE.flatMap((prop) => prop["property-bed"])
    ),
  ];

  const options = beds.map((type) => getValueById(BED, type)).filter(Boolean);

  renderOptions(selectBeds, sortByName(options));
});

// Hierarchal Filter Bedroom
selectBeds.addEventListener("change", (e) => {
  resetOptions(selectBaths, "Bathrooms");

  const selectedValue = e.target.value;

  FILTER_QUERY.bath = "";

  FILTER_QUERY.bed = selectedValue;

  if (!selectedValue) {
    resetOptions(selectBaths, "Bathrooms");
    FILTER_QUERY.bed = "";
    appyFilters();
    return;
  }

  appyFilters();

  //   flat_baths;

  //   flat_baths;

  const PROPERTIES_TO_FILTER =
    FILTERED_PROPERTIES_TYPE.length < 1 ? PROPERTIES : FILTERED_PROPERTIES_TYPE;

  const TEMP_FILTERED_PROPERTIES = PROPERTIES_TO_FILTER.filter((prop) =>
    prop.acf.room.some(
      (room) => Number(room.flat_beds) === Number(selectedValue)
    )
  );

  const baths = [
    ...new Set(
      TEMP_FILTERED_PROPERTIES.flatMap((prop) =>
        prop.acf.room.flatMap(
          (room) =>
            Number(room.flat_beds) === Number(selectedValue) && room.flat_baths
        )
      )
    ),
  ];

  const options = baths.map((type) => getValueById(BATH, type)).filter(Boolean);

  renderOptions(selectBaths, sortByName(options));
});

// Hierarchal Filter Bathroom
selectBaths.addEventListener("change", (e) => {
  const selectedValue = e.target.value;
  FILTER_QUERY.bath = selectedValue;

  if (!selectedValue) {
    FILTER_QUERY.bath = "";
    appyFilters();
    return;
  }
  appyFilters();
});

// making filter work

const filterProperties = (filters) => {
  return PROPERTIES.filter((property) => {
    const priceFrom = parseInt(property.acf.price_from, 10);
    const priceTo = parseInt(property.acf.price_to, 10);

    // Check price range
    if (filters.minPrice > priceTo || filters.maxPrice < priceFrom) {
      return false;
    }

    // Check city (if selected)
    if (
      filters.city &&
      !property["property-city"].includes(parseInt(filters.city, 10))
    ) {
      return false;
    }

    // Check type (if selected)
    if (
      filters.type &&
      !property["property-type"].includes(parseInt(filters.type, 10))
    ) {
      return false;
    }

    // Check bedrooms (if selected)
    if (filters.bed) {
      const bedId = parseInt(filters.bed, 10);
      if (!property.acf.beds.includes(bedId)) {
        return false;
      }

      // If a bedroom is selected, check bathrooms (if selected)
      if (filters.bath) {
        const bathId = parseInt(filters.bath, 10);
        if (!property.acf.baths.includes(bathId)) {
          return false;
        }
      }
    }

    return true;
  });
};

const resetAllFilters = () => {
  selectCity.selectedIndex = 0;
  selectBaths.selectedIndex = 0;
  selectType.selectedIndex = 0;
  selectBeds.selectedIndex = 0;

  range.noUiSlider.set([0, 2500]);

  const url = window.location.origin + window.location.pathname;
  window.history.pushState({}, "", url);

  renderProperties(PROPERTIES);
};

const generateFilterQuery = (filters) => {
  const params = new URLSearchParams();

  if (filters.minPrice) params.append("minPrice", filters.minPrice);
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
  if (filters.city) params.append("city", filters.city);
  if (filters.type) params.append("type", filters.type);
  if (filters.bed) params.append("bed", filters.bed);
  if (filters.bath && filters.bed) params.append("bath", filters.bath); // Only add bath if bed is selected

  return "?" + params.toString();
};

const appyFilters = () => {
  if (STATE === "loading") {
    return;
  }

  const filteredResults = filterProperties(FILTER_QUERY);

  if (filteredResults.length < 1) {
    setNoResults();
    return;
  }

  renderProperties(filteredResults);

  const url =
    window.location.origin +
    window.location.pathname +
    generateFilterQuery(FILTER_QUERY);
  window.history.pushState({}, "", url);
};

resetButton.addEventListener("click", resetAllFilters);

//filtering on pageload

const getFiltersFromURL = () => {
  const params = new URLSearchParams(window.location.search);

  console.log("before params");

  if (params.size < 1) return;

  console.log("after params");
  const filters = {
    minPrice: params.get("minPrice")
      ? parseInt(params.get("minPrice"), 10)
      : null,
    maxPrice: params.get("maxPrice")
      ? parseInt(params.get("maxPrice"), 10)
      : null,
    city: params.get("city") || null,
    type: params.get("type") || null,
    bed: params.get("bed") || null,
    bath: params.get("bath") || null,
  };

  FILTER_QUERY = filters;

  if (params.get("bath")) {
    renderOptions(selectBaths, BATH);
  }

  selectCity.value = filters.city || "";
  selectBaths.value = filters.bath || "";
  selectType.value = filters.type || "";
  selectBeds.value = filters.bed || "";

  range.noUiSlider.set([filters.minPrice, filters.maxPrice]);

  const filteredResults = filterProperties(filters);

  if (filteredResults.length < 1) {
    setNoResults();
    return;
  }

  renderProperties(filteredResults);
};

//Price Slider Filter
noUiSlider.create(range, {
  start: [0, 2500],
  connect: true,
  step: 1,
  range: {
    min: 0,
    max: 2500,
  },
});

range.noUiSlider.on("update", (values) => {
  minInput.value = Math.round(values[0]);
  FILTER_QUERY.minPrice = Math.round(values[0]);
  maxInput.value = Math.round(values[1]);
  FILTER_QUERY.maxPrice = Math.round(values[1]);
  appyFilters();
});

minInput.addEventListener("change", () => {
  let minValue = parseInt(minInput.value);
  let maxValue = parseInt(maxInput.value);
  if (minValue >= maxValue) {
    minValue = maxValue - 100;
  }
  range.noUiSlider.set([minValue, null]);
  FILTER_QUERY.maxPrice = maxValue;
  FILTER_QUERY.minPrice = minValue;
  appyFilters();
});

maxInput.addEventListener("change", () => {
  let minValue = parseInt(minInput.value);
  let maxValue = parseInt(maxInput.value);
  if (maxValue <= minValue) {
    maxValue = minValue + 100;
  }
  range.noUiSlider.set([null, maxValue]);
  FILTER_QUERY.maxPrice = maxValue;
  FILTER_QUERY.minPrice = minValue;
  appyFilters();
});
