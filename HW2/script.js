function handleResponsiveNavigation() {
  const menuItems = document.querySelectorAll("nav ul li a");
  const links = document.querySelectorAll("nav ul li a");
  const container = document.querySelector(".container");
  const menu = document.getElementById("menu");
  const burger = document.getElementById("burger");
  let currentSectionIndex = 0;

  // Fungsi untuk memeriksa mode responsif
  const checkResponsiveMode = () => {
    return window.innerWidth < 1200;
  };

  if (!container) {
    console.error("Container not found");
    return;
  }

  // Fungsi reset navigasi
  const resetNavigation = () => {
    // Reset transform dan styling
    container.style.transform = "none";
    container.style.flexDirection = checkResponsiveMode() ? "column" : "row";

    // Reset active state
    links.forEach((link) => link.classList.remove("active"));
    document.querySelector('a[href="#home"]').classList.add("active");

    // Reset mobile menu
    if (menu) menu.classList.remove("active");
    if (burger) burger.innerHTML = '<i class="fas fa-bars"></i>';

    // Hapus semua event listener sebelumnya
    links.forEach((link) => {
      link.removeEventListener("click", desktopHandler);
      link.removeEventListener("click", mobileHandler);
    });

    // Tambahkan event listener baru sesuai mode
    links.forEach((link, index) => {
      link.addEventListener("click", checkResponsiveMode() ? mobileHandler : desktopHandler);
      link.setAttribute("data-index", index);
    });
  };

  // Handler untuk mode mobile
  function mobileHandler(e) {
    e.preventDefault();

    const targetSectionId = this.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetSectionId);

    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });

      links.forEach((link) => link.classList.remove("active"));
      this.classList.add("active");

      // Tutup menu mobile
      if (menu) menu.classList.remove("active");
      if (burger) burger.innerHTML = '<i class="fas fa-bars"></i>';
    }
  }

  // Handler untuk mode desktop
  function desktopHandler(e) {
    e.preventDefault();

    links.forEach((p) => p.classList.remove("active"));
    this.classList.add("active");

    const newSectionIndex = parseInt(this.getAttribute("data-index"));

    if (window.innerWidth >= 1200) {
      if (newSectionIndex !== currentSectionIndex) {
        container.style.transform = `translateX(-${newSectionIndex * 100}vw)`;
        currentSectionIndex = newSectionIndex;
      }
    }
  }

  // Toggle burger menu
  if (burger) {
    burger.onclick = () => {
      if (menu) {
        menu.classList.toggle("active");
        burger.innerHTML = menu.classList.contains("active") ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
      }
    };
  }

  // Resize event listener dengan debounce
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resetNavigation, 250);
  });

  // Inisialisasi awal
  resetNavigation();
}

// Tambahkan setelah fungsi fetchGalleryItems()
function setupGalleryItemClick() {
  const gallerySlider = document.querySelector(".gallery-slider");
  const bigMenuContainer = document.getElementById("big-menu");

  gallerySlider.addEventListener("click", (event) => {
    // Cari elemen slide terdekat yang diklik
    const clickedSlide = event.target.closest(".slide");

    if (clickedSlide) {
      // Dapatkan index slide yang diklik
      const index = Array.from(gallerySlider.children).indexOf(clickedSlide);
      const selectedPlayer = allGalleryItems[currentStartIndex + index];

      // Tampilkan detail pemain di big-menu
      if (selectedPlayer) {
        updateBigMenu(selectedPlayer);
      }
    }
  });
}

function updateBigMenu(player) {
  const bigMenuContainer = document.getElementById("big-menu");

  // Pastikan elemen big-menu ada
  if (!bigMenuContainer) {
    console.error("Big menu container not found");
    return;
  }

  // Perbarui gambar
  const bigImage = bigMenuContainer.querySelector("img");
  bigImage.src = player.player_image || player.imageUrl;
  bigImage.alt = player.player_name;

  // Perbarui detail pemain
  const playerDetails = bigMenuContainer.querySelector("div");
  playerDetails.innerHTML = `  
    <h4>${player.player_name} | ${player.position || "Position Not Specified"} | ${player.country || "Country Not Specified"}</h4>  
    <p>${player.description || "No description available"}</p>  
  `;
}

// Tunggu DOM siap
document.addEventListener("DOMContentLoaded", () => {
  handleResponsiveNavigation();
  const gallerySlider = document.querySelector(".gallery-slider");
  const prevBtn = document.querySelector(".nav-prev");
  const nextBtn = document.querySelector(".nav-next");

  let allGalleryItems = [];
  let visibleItems = [];
  let currentStartIndex = 0;
  let MAX_VISIBLE_ITEMS = 12; // Default value

  // Function to calculate max visible items based on screen width
  function calculateMaxVisibleItems() {
    const screenWidth = window.innerWidth;

    if (screenWidth < 390) {
      return 2;
    } else if (screenWidth < 414) {
      return 3;
    } else if (screenWidth < 768) {
      return 5;
    } else if (screenWidth < 810) {
      return 6;
    } else if (screenWidth < 1024) {
      return 7;
    } else if (screenWidth < 1200) {
      return 9;
    } else {
      return 12;
    }
  }

  // Async function to fetch gallery items from JSON
  async function fetchGalleryItems() {
    try {
      const response = await fetch("data/database_team.json");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Convert to array if needed
      allGalleryItems = Array.isArray(data) ? data : Object.values(data);

      // Initial setup with responsive item count
      MAX_VISIBLE_ITEMS = calculateMaxVisibleItems();
      initializeSlider();
      setupGalleryItemClick(); // Pindahkan setup click di sini
    } catch (error) {
      console.error("Error fetching gallery items:", error);
    }
  }

  // Initialize slider with dynamic item count
  function initializeSlider() {
    if (!gallerySlider) {
      console.error("Gallery slider element not found");
      return;
    }

    // Reset slider
    gallerySlider.innerHTML = "";

    // Take first batch of items based on screen size
    visibleItems = allGalleryItems.slice(0, MAX_VISIBLE_ITEMS);

    // Create slides
    visibleItems.forEach((item) => {
      const slideElement = document.createElement("div");
      slideElement.classList.add("slide");

      const img = document.createElement("img");
      img.src = item.player_image || item.imageUrl;
      img.alt = item.player_name || "Player Image";

      const playerName = document.createElement("div");
      playerName.classList.add("player-name");
      playerName.textContent = item.player_name || "Player Name";

      slideElement.appendChild(img);
      slideElement.appendChild(playerName);

      gallerySlider.appendChild(slideElement);
    });

    currentStartIndex = 0;
  }

  // Load next slide with dynamic item count
  function loadNextSlide() {
    if (currentStartIndex + MAX_VISIBLE_ITEMS < allGalleryItems.length) {
      currentStartIndex++;

      // Remove leftmost slide
      gallerySlider.removeChild(gallerySlider.firstChild);

      // Add new slide on right
      const nextItemIndex = currentStartIndex + MAX_VISIBLE_ITEMS - 1;
      if (nextItemIndex < allGalleryItems.length) {
        const slideElement = document.createElement("div");
        slideElement.classList.add("slide");

        const img = document.createElement("img");
        img.src = allGalleryItems[nextItemIndex].player_image;
        img.alt = allGalleryItems[nextItemIndex].player_name;

        const playerName = document.createElement("div");
        playerName.classList.add("player-name");
        playerName.textContent = allGalleryItems[nextItemIndex].player_name;

        slideElement.appendChild(img);
        slideElement.appendChild(playerName);

        gallerySlider.appendChild(slideElement);
      }
    }
  }

  // Load previous slide with dynamic item count
  function loadPrevSlide() {
    if (currentStartIndex > 0) {
      currentStartIndex--;

      // Remove rightmost slide
      gallerySlider.removeChild(gallerySlider.lastChild);

      // Add new slide on left
      const prevItemIndex = currentStartIndex;
      const slideElement = document.createElement("div");
      slideElement.classList.add("slide");

      const img = document.createElement("img");
      img.src = allGalleryItems[prevItemIndex].player_image;
      img.alt = allGalleryItems[prevItemIndex].player_name;

      const playerName = document.createElement("div");
      playerName.classList.add("player-name");
      playerName.textContent = allGalleryItems[prevItemIndex].player_name;

      slideElement.appendChild(img);
      slideElement.appendChild(playerName);

      gallerySlider.insertBefore(slideElement, gallerySlider.firstChild);
    }
  }

  // Setup gallery item click
  function setupGalleryItemClick() {
    gallerySlider.addEventListener("click", (event) => {
      const clickedSlide = event.target.closest(".slide");

      if (clickedSlide) {
        const index = Array.from(gallerySlider.children).indexOf(clickedSlide);
        const selectedPlayer = allGalleryItems[currentStartIndex + index];

        if (selectedPlayer) {
          updateBigMenu(selectedPlayer);
        }
      }
    });
  }

  // Update big menu with player details
  function updateBigMenu(player) {
    const bigMenuContainer = document.getElementById("big-menu");

    if (!bigMenuContainer) {
      console.error("Big menu container not found");
      return;
    }

    const bigImage = bigMenuContainer.querySelector("img");
    bigImage.src = player.player_image || player.imageUrl;
    bigImage.alt = player.player_name;

    const playerDetails = bigMenuContainer.querySelector("div");
    playerDetails.innerHTML = `  
      <h4>${player.player_name} | ${player.position || "Position Not Specified"} | ${player.country || "Country Not Specified"}</h4>  
      <p>${player.description || "No description available"}</p>  
    `;
  }

  // Add resize event listener to recalculate visible items
  window.addEventListener("resize", () => {
    const newMaxVisibleItems = calculateMaxVisibleItems();

    // Reinitialize if max visible items changed
    if (newMaxVisibleItems !== MAX_VISIBLE_ITEMS) {
      MAX_VISIBLE_ITEMS = newMaxVisibleItems;
      currentStartIndex = 0;
      initializeSlider();
    }
  });

  // Add event listeners to navigation buttons
  nextBtn.addEventListener("click", loadNextSlide);
  prevBtn.addEventListener("click", loadPrevSlide);

  // Fetch and populate gallery
  fetchGalleryItems();
});
