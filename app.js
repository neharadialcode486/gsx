const propertiesApiUrl =
  "http://16.171.233.34/index.php/wp-json/wp/v2/properties?acf_format=standard&per_page=99";
const propertyTypesApiUrl =
  "http://16.171.233.34/index.php/wp-json/wp/v2/property-type?_fields=id,name";
const propertyTagsApiUrl =
  "http://16.171.233.34/index.php/wp-json/wp/v2/property-tag?_fields=id,name";

async function fetchProperties() {
  document.getElementById(
    "gsk_property_list"
  ).innerHTML = `<div class="gsk_loader_container"><div class="gsk_loader"></div></div>`;

  try {
    const [propertiesResponse, propertyTypesResponse, propertyTagsResponse] =
      await Promise.all([
        fetch(propertiesApiUrl),
        fetch(propertyTypesApiUrl),
        fetch(propertyTagsApiUrl),
      ]);

    const propertiesHeaders = propertiesResponse.headers;
    const totalCount = propertiesHeaders.get("x-wp-total");

    if (
      !propertiesResponse.ok ||
      !propertyTypesResponse.ok ||
      !propertyTagsResponse.ok
    ) {
      throw new Error(
        `Error: Properties - ${propertiesResponse.status}, Property Types - ${propertyTypesResponse.status}, Property Tags - ${propertyTagsResponse.status}`
      );
    }

    const properties = await propertiesResponse.json();
    const propertyTypes = await propertyTypesResponse.json();
    const propertyTags = await propertyTagsResponse.json();

    const matchedProperties = await Promise.all(
      properties.map(async (property) => {
        const propertyTypeDetails = propertyTypes.find(
          (type) => type.id === property.acf.property_type[0]
        );

        const tagDetails = propertyTags.find(
          (type) => type.id === property.acf.tags[0]
        );

        const managerId = property.acf.manager[0]?.ID;
        let managerDetails = {
          name: "N/A",
          verified: false,
          logo: { url: "" },
        };

        if (managerId) {
          const managerApiUrl = `http://16.171.233.34/index.php/wp-json/wp/v2/manager/${managerId}?acf_format=standard&_fields=id,acf.name,acf.verified,acf.logo.url`;
          try {
            const managerResponse = await fetch(managerApiUrl);
            const managerData = await managerResponse.json();
            managerDetails = managerData.acf;
          } catch (error) {}
        }

        const aboutImageId = property.featured_media || null;
        let mediaDetails = {
          id: null,
          source_url: "",
        };

        if (aboutImageId) {
          const mediaApiUrl = `http://16.171.233.34/index.php/wp-json/wp/v2/media/${aboutImageId}?_fields=id,source_url`;
          try {
            const mediaResponse = await fetch(mediaApiUrl);
            const mediaData = await mediaResponse.json();
            mediaDetails.source_url =
              mediaData.source_url || mediaDetails.source_url;
          } catch (error) {}
        }

        document.getElementById("total_properties").innerHTML = totalCount;

        return {
          ...property,
          property_type_details: propertyTypeDetails || { name: "Unknown" },
          tag_details: tagDetails?.name || "No Tags",
          manager_details: managerDetails,
          media_details: mediaDetails,
        };
      })
    );

    displayProperties(matchedProperties);
  } catch (error) {
    document.getElementById(
      "gsk_property_list"
    ).innerHTML = `<p>Failed to load properties.</p>`;
  }
}

const loaderStyles = `

`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
document.head.appendChild(styleSheet);

function displayProperties(properties) {
  const cardContainer = document.getElementById("gsk_property_list");

  cardContainer.innerHTML = properties
    .map(
      (property) => `
      <div class="sgk_properties_card">
        <div class="gsk_property_card_image">
          <img
            src="${
              property.media_details.source_url ||
              "https://via.placeholder.com/150"
            }"
            alt="property image"
          />
          <div class="gsk_absolute_text">
            <p>${property.property_type_details.name || "Townhome"}</p>
            <p>${property.tag_details || "No Tags"}</p>
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
            <span>${property.acf.address || "N/A"}</span>
          </div>
          <p class="gsk_property_desc">${property.acf.about_property}</p>

          <div class="gsk_profile_and_buttons">
            <div class="gsk_profile_container">
              <img
                src="${
                  property.manager_details.logo?.url ||
                  "http://16.171.233.34/wp-content/uploads/2025/01/Photo-2025-02-03-11-39-53-AM.jpg"
                }"
                alt="profile"
              />
              <div>
                <p class="gsk_profile_name">
                  ${property.manager_details.name || "N/A"} ${
        property.manager_details.verified &&
        ` <svg
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
            </svg>`
      }
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
    `
    )
    .join("");
}

// Load properties on page load
fetchProperties();

// CUSTOM SECLECT ===============================================================
function initCustomSelect(selectId) {
  const selectBox = document.getElementById(`${selectId}Box`);
  const optionsContainer = document.getElementById(`${selectId}Options`);
  const selectedOption = document.getElementById(`${selectId}Selected`);
  const arrow = document.getElementById(`${selectId}Arrow`);

  // Toggle dropdown
  selectBox.addEventListener("click", () => {
    optionsContainer.classList.toggle("gsk-show");
    arrow.classList.toggle("gsk-rotate");
  });

  // Handle option click
  document
    .querySelectorAll(`#${selectId}Options .gsk-option`)
    .forEach((option) => {
      option.addEventListener("click", (e) => {
        selectedOption.innerText = e.target.innerText;
        optionsContainer.classList.remove("gsk-show");
        arrow.classList.remove("gsk-rotate");
      });
    });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!selectBox.contains(e.target)) {
      optionsContainer.classList.remove("gsk-show");
      arrow.classList.remove("gsk-rotate");
    }
  });
}

// Initialize all 4 selects
initCustomSelect("gskLocation");
initCustomSelect("gskPropertyType");
initCustomSelect("gskSize");
initCustomSelect("gskPrice");

// RANGE ==============================
const minInput = document.getElementById("gskMinInput");
const maxInput = document.getElementById("gskMaxInput");
const range = document.getElementById("gskRange");

// Initialize noUiSlider
noUiSlider.create(range, {
  start: [0, 2500],
  connect: true,
  step: 0,
  range: {
    min: 0,
    max: 2500,
  },
});

// Update input values on slider change
range.noUiSlider.on("update", (values) => {
  minInput.value = Math.round(values[0]);
  maxInput.value = Math.round(values[1]);
});

// Update slider when min input changes
minInput.addEventListener("change", () => {
  let minValue = parseInt(minInput.value);
  let maxValue = parseInt(maxInput.value);

  if (minValue >= maxValue) {
    minValue = maxValue - 1000;
    minInput.value = minValue;
  }

  range.noUiSlider.set([minValue, null]);
});

// Update slider when max input changes
maxInput.addEventListener("change", () => {
  let minValue = parseInt(minInput.value);
  let maxValue = parseInt(maxInput.value);

  if (maxValue <= minValue) {
    maxValue = minValue + 1000;
    maxInput.value = maxValue;
  }

  range.noUiSlider.set([null, maxValue]);
});

// SIDEBAR =============================================

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
