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
    const matchedProperties = properties.map((property) => {
      // Match property type
      const propertyTypeDetails = propertyTypes.find(
        (type) => type.id === property.acf.property_type[0]
      );

      // Match tags and get their names
      const tagDetails = propertyTags.find(
        (type) => type.id === property.acf.tags[0]
      );
      console.log(properties, "tagDetails");

      // Return property with mapped details
      return {
        ...property,
        property_type_details: propertyTypeDetails || { name: "Unknown" },
        tag_details: tagDetails.name,
      };
    });

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
                  property.acf.agent_image ||
                  "http://16.171.233.34/wp-content/uploads/2025/01/Photo-2025-02-03-11-39-53-AM.jpg"
                }"
                alt="profile"
              />
              <div>
                <p class="gsk_profile_name">
                  ${property.acf.manager[0]?.post_title || "N/A"}
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
