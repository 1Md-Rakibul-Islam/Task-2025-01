// Product data
const products = [
  { image: "/assets/thumb1.svg" },
  { image: "/assets/thumb2.svg" },
  { image: "/assets/thumb3.svg" },
  { image: "/assets/thumb4.svg" },
  { image: "/assets/thumb5.svg" },
];

// Background images for each slide
const backgroundImages = [
  "/assets/bg1.webp",
  "/assets/bg2.webp",
  "/assets/bg3.webp",
  "/assets/bg4.webp",
  "/assets/bg5.webp",
];

// DOM elements
const carouselSection = document.getElementById("carousel-section");
const thumbnailsContainer = document.getElementById("thumbnails-container");
const cardContents = document.querySelectorAll(".card-content");

// State
let activeIndex = 0;
let carouselRadius = window.innerWidth < 768 ? 120 : 180;
let thumbnailButtons = [];
let isDragging = false;
let startX, currentTranslate, prevTranslate;
let animationID = 0;

//  Calculate the position for items in a semi-circular carousel
function getSemiCircularPosition(index, total, activeIdx, carouselRadius) {
  // For semi-circle, we only use 180 degrees (from 180° to 360°)
  // Center item should be at bottom (270 degrees)
  const startAngle = 180;
  const endAngle = 360;
  const angleRange = endAngle - startAngle;

  // Calculate the offset to make the active item centered at the bottom (270 degrees)
  const centerAngle = 270;

  // Calculate the angle between each item
  const angleStep = angleRange / (total - 1);

  // Calculate the angle for this item, with the active item at the bottom center
  let angle;

  if (total === 1) {
    angle = centerAngle;
  } else {
    // Calculate relative position from active index
    const relativeIndex = (index - activeIdx + total) % total;

    // Reorder items so active is in center
    let orderedIndex;
    const halfItems = Math.floor(total / 2);

    if (relativeIndex <= halfItems) {
      // Items to the right of center
      orderedIndex = halfItems - relativeIndex;
    } else {
      // Items to the left of center
      orderedIndex = total - relativeIndex + halfItems;
    }

    // Calculate angle based on ordered index
    angle = startAngle + orderedIndex * angleStep;
  }

  // Convert angle to radians
  const radians = angle * (Math.PI / 180);

  // Calculate x and y positions
  const x = carouselRadius * Math.cos(radians);
  const y = carouselRadius * Math.sin(radians);

  // Calculate the scale factor based on position
  // Items at the bottom center (active) are largest
  const distanceFromCenter = Math.abs(angle - centerAngle);
  const normalizedDistance = distanceFromCenter / (angleRange / 2);
  const scale = 1 - normalizedDistance * 0.3; // Scale between 0.7 and 1.0

  // Calculate opacity based on position (center items more visible)
  const opacity = 0.7 + (1 - normalizedDistance) * 0.3;

  // Calculate z-index to ensure proper layering
  const zIndex = 100 - Math.round(normalizedDistance * 10);

  return { x, y, scale, opacity, angle, zIndex };
}

// Update the background image based on active index
function updateBackgroundImage() {
  carouselSection.style.backgroundImage = `url(${backgroundImages[activeIndex]})`;
}

// Update the content of the active card
function updateCardContent() {
  // First, add the 'fade-out' class to all cards
  cardContents.forEach((card) => {
    card.classList.add("fade-out");
  });

  // After a short delay, hide inactive cards and show active card
  setTimeout(() => {
    cardContents.forEach((card, index) => {
      if (index === activeIndex) {
        card.classList.remove("hidden");

        void card.offsetWidth;

        card.classList.remove("fade-out");
      } else {
        card.classList.add("hidden");
      }
    });
  }, 300);
}

// Create the initial thumbnail buttons
function createThumbnails() {
  thumbnailsContainer.innerHTML = "";
  thumbnailButtons = [];

  products.forEach((product, index) => {
    // Create thumbnail button
    const button = document.createElement("button");
    button.className = "thumbnail-button";

    // Add click event
    button.addEventListener("click", () => {
      setActiveIndex(index);
    });

    // Create thumbnail image
    const img = document.createElement("img");
    img.className = "thumbnail-image";
    img.src = product.image;
    img.draggable = false;

    // Append image to button and button to container
    button.appendChild(img);
    thumbnailsContainer.appendChild(button);
    thumbnailButtons.push(button);
  });

  // Initial positioning
  updateThumbnailPositions();
}

// Update the positions of all thumbnails
function updateThumbnailPositions() {
  products.forEach((product, index) => {
    const { x, y, scale, opacity, angle, zIndex } = getSemiCircularPosition(
      index,
      products.length,
      activeIndex,
      carouselRadius
    );

    // Determine if this is the active item (at the bottom center)
    const isCenter = Math.abs(angle - 270) < 10;
    const button = thumbnailButtons[index];

    // Apply new styles with smooth transitions
    button.style.left = `calc(50% + ${x}px)`;
    button.style.bottom = `${-y}px`; // Negative y because we're positioning from bottom
    button.style.transform = `translate(-50%, 50%) scale(${scale})`;
    button.style.opacity = isCenter ? "1" : "0.5";
    button.style.zIndex = zIndex;
  });
}

// Set the active index and update the UI
function setActiveIndex(index) {
  if (index === activeIndex) return;

  activeIndex = index;
  updateBackgroundImage();
  updateCardContent();
  updateThumbnailPositions();
}

// Handle window resize
function handleResize() {
  // Adjust radius based on viewport size
  carouselRadius = window.innerWidth < 768 ? 120 : 180;
  updateThumbnailPositions();
}

// Initialize the carousel
function initCarousel() {
  // Create thumbnails
  createThumbnails();

  // Set initial background
  updateBackgroundImage();

  // Show initial card content
  cardContents.forEach((card, index) => {
    if (index === activeIndex) {
      card.classList.remove("hidden");
    } else {
      card.classList.add("hidden");
    }
  });

  // Add resize listener
  window.addEventListener("resize", handleResize);
}

// Start the carousel when the page loads
document.addEventListener("DOMContentLoaded", initCarousel);
