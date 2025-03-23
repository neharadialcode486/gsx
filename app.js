const propertiesApiUrl =
  "http://16.171.233.34/index.php/wp-json/wp/v2/properties?acf_format=standard&per_page=99";
const propertyTypesApiUrl =
  "http://16.171.233.34/index.php/wp-json/wp/v2/property-type?_fields=id,name";
const propertyTagsApiUrl =
  "http://16.171.233.34/index.php/wp-json/wp/v2/property-tag?_fields=id,name";

async function fetchProperties() {
  try {
    // Fetch data from all APIs
    const [propertiesResponse, propertyTypesResponse, propertyTagsResponse] =
      await Promise.all([
        fetch(propertiesApiUrl),
        fetch(propertyTypesApiUrl),
        fetch(propertyTagsApiUrl),
      ]);

    const propertiesHeaders = propertiesResponse.headers;

    // Example: Get specific header value
    const totalCount = propertiesHeaders.get("x-wp-total");
    console.log("Total Properties:", totalCount);

    // Check if responses are okay
    if (
      !propertiesResponse.ok ||
      !propertyTypesResponse.ok ||
      !propertyTagsResponse.ok
    ) {
      throw new Error(
        `Error: Properties - ${propertiesResponse.status}, Property Types - ${propertyTypesResponse.status}, Property Tags - ${propertyTagsResponse.status}`
      );
    }

    // Parse JSON responses
    const properties = await propertiesResponse.json();
    const propertyTypes = await propertyTypesResponse.json();
    const propertyTags = await propertyTagsResponse.json();

    // Map properties with property types and tags
    const matchedProperties = await Promise.all(
      properties.map(async (property) => {
        // Match property type
        const propertyTypeDetails = propertyTypes.find(
          (type) => type.id === property.acf.property_type[0]
        );

        // Match tags and get their names
        const tagDetails = propertyTags.find(
          (type) => type.id === property.acf.tags[0]
        );

        // Fetch manager details dynamically
        const managerId = property.acf.manager[0].ID;
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
          } catch (error) {
            console.warn(`Failed to load manager data for ID: ${managerId}`);
          }
        }
        document.getElementById("total_properties").innerHTML = totalCount;
        // Return property with mapped details
        return {
          ...property,
          property_type_details: propertyTypeDetails || { name: "Unknown" },
          tag_details: tagDetails?.name || "No Tags",
          manager_details: managerDetails,
        };
      })
    );

    displayProperties(matchedProperties);
  } catch (error) {
    document.getElementById(
      "gsk_property_list"
    ).innerHTML = `<p>Failed to load properties.</p>`;
    console.error("Error:", error);
  }
}

function displayProperties(properties) {
  const cardContainer = document.getElementById("gsk_property_list");

  cardContainer.innerHTML = properties
    .map(
      (property) => `
      <div class="sgk_properties_card">
        <div class="gsk_property_card_image">
          <img
            src="${
              property.acf.about_image || "https://via.placeholder.com/150"
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
                View Details
              </a>
              <a
                class="gsk_profile_btn"
                href="${property.acf.book_an_appointment_link || "#"}"
              >
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
