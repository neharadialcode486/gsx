const minInput = document.getElementById("gskMinInput");
const maxInput = document.getElementById("gskMaxInput");
const range = document.getElementById("gskRange");

// Initialize noUiSlider
noUiSlider.create(range, {
  start: [0, 2500],
  connect: true,
  step: 1,
  range: {
    min: 0,
    max: 2500,
  },
});

// Update input values on slider change
range.noUiSlider.on("update", (values) => {
  minInput.value = Math.round(values[0]);
  maxInput.value = Math.round(values[1]);
  updatePriceRange(); // Call to apply filters on range change
});

// Update slider when min input changes
minInput.addEventListener("change", () => {
  let minValue = parseInt(minInput.value);
  let maxValue = parseInt(maxInput.value);

  if (isNaN(minValue) || minValue < 0) {
    minValue = 0;
  }
  if (minValue >= maxValue - 100) {
    minValue = maxValue - 100;
  }
  if (minValue < 0) {
    minValue = 0;
  }

  minInput.value = minValue;
  range.noUiSlider.set([minValue, null]);
  updatePriceRange();
});

// Update slider when max input changes
maxInput.addEventListener("change", () => {
  let minValue = parseInt(minInput.value);
  let maxValue = parseInt(maxInput.value);

  if (isNaN(maxValue) || maxValue > 2500) {
    maxValue = 2500;
  }
  if (maxValue <= minValue + 100) {
    maxValue = minValue + 100;
  }
  if (maxValue > 2500) {
    maxValue = 2500;
  }

  maxInput.value = maxValue;
  range.noUiSlider.set([null, maxValue]);
  updatePriceRange();
});

// Update price range and apply filters
function updatePriceRange() {
  selectedOptions.priceFrom = parseInt(minInput.value);
  selectedOptions.priceTo = parseInt(maxInput.value);
  applyFilters(); // Apply filters after range update
}

// Apply filters with price range included
function applyFilters() {
  let filteredData = mainData;

  // Filter by location
  if (selectedOptions.location) {
    filteredData = filteredData.filter(
      (item) => item["property-city"] == selectedOptions.location
    );
  }

  // Filter by property type
  if (selectedOptions.propertyType) {
    filteredData = filteredData.filter((item) =>
      item["property-type"].includes(parseInt(selectedOptions.propertyType))
    );
  }

  // Filter by bedrooms
  if (selectedOptions.bedrooms) {
    filteredData = filteredData.filter((item) =>
      item["property-bed"].includes(parseInt(selectedOptions.bedrooms))
    );
  }

  // Filter by bathrooms
  if (selectedOptions.bathrooms) {
    filteredData = filteredData.filter((item) =>
      item["property-bath"].includes(parseInt(selectedOptions.bathrooms))
    );
  }

  // Filter by price range
  if (
    selectedOptions.priceFrom !== undefined &&
    selectedOptions.priceTo !== undefined
  ) {
    filteredData = filteredData.filter(
      (item) =>
        item["property-price"] >= selectedOptions.priceFrom &&
        item["property-price"] <= selectedOptions.priceTo
    );
  }

  console.log(filteredData, "Filtered Data with Price Range 🎯");
}
