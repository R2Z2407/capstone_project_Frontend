document.addEventListener("DOMContentLoaded", () => {
  function handleResponsiveNavigation() {
    const menuItems = document.querySelectorAll("nav ul li a");
    const links = document.querySelectorAll("nav ul li a");
    const container = document.querySelector(".container");
    const menu = document.getElementById("menu");
    const burger = document.getElementById("burger");
    let currentSectionIndex = 0;

    const checkResponsiveMode = () => window.innerWidth < 1200;

    if (!container) {
      console.error("Container not found");
      return;
    }

    const resetNavigation = () => {
      container.style.transform = "none";
      container.style.flexDirection = checkResponsiveMode() ? "column" : "row";

      links.forEach((link) => link.classList.remove("active"));
      document.querySelector('a[href="#home"]').classList.add("active");

      if (menu) menu.classList.remove("active");
      if (burger) burger.innerHTML = '<i class="fas fa-bars"></i>';

      links.forEach((link) => {
        link.removeEventListener("click", desktopHandler);
        link.removeEventListener("click", mobileHandler);
        link.addEventListener("click", checkResponsiveMode() ? mobileHandler : desktopHandler);
        link.setAttribute("data-index", Array.from(links).indexOf(link));
      });
    };

    function mobileHandler(e) {
      e.preventDefault();
      const targetSectionId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetSectionId);

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
        links.forEach((link) => link.classList.remove("active"));
        this.classList.add("active");

        if (menu) menu.classList.remove("active");
        if (burger) burger.innerHTML = '<i class="fas fa-bars"></i>';
      }
    }

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

    if (burger) {
      burger.onclick = () => {
        if (menu) {
          menu.classList.toggle("active");
          burger.innerHTML = menu.classList.contains("active") ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        }
      };
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resetNavigation, 250);
    });

    resetNavigation();
  }

  function initializeGallery() {
    const gallerySlider = document.querySelector(".gallery-slider");
    const bigGallery = document.querySelector("#big-gallery");
    const galleryScroll = document.querySelector(".gallery-scroll");
    const prevBtn = document.querySelector(".nav-prev");
    const nextBtn = document.querySelector(".nav-next");

    let allGalleryItems = [];
    let galleryItems = [];
    let currentStartIndex = 0;
    let MAX_VISIBLE_ITEMS = 10;
    let currentBigImageIndex = 0;

    function calculateMaxVisibleItems() {
      const screenWidth = window.innerWidth;
      if (screenWidth < 390) return 2;
      if (screenWidth < 414) return 3;
      if (screenWidth < 768) return 6;
      if (screenWidth < 962) return 8;
      if (screenWidth < 1024) return 9;
      return 12;
    }

    async function fetchGalleryItems() {
      try {
        const [teamResponse, galleryResponse] = await Promise.all([fetch("data/database_team.json"), fetch("data/database_gallery.json")]);

        const teamData = await teamResponse.json();
        const galleryData = await galleryResponse.json();

        allGalleryItems = Array.isArray(teamData) ? teamData : Object.values(teamData);
        galleryItems = Array.isArray(galleryData) ? galleryData : Object.values(galleryData);

        MAX_VISIBLE_ITEMS = calculateMaxVisibleItems();
        initializeSlider();
        initializeBigGallery();
        initializeScrollGallery();
        setupEventListeners();

        // Sembunyikan tombol prev jika sudah di awal
        prevBtn.style.display = currentStartIndex === 0 ? "none" : "block";

        // Sembunyikan tombol next jika sudah di akhir
        nextBtn.style.display = currentStartIndex + MAX_VISIBLE_ITEMS >= allGalleryItems.length ? "none" : "block";
      } catch (error) {
        console.error("Error fetching gallery items:", error);
      }
    }

    function formatPlayerName(name) {
      // Pisahkan nama menjadi array kata
      const words = name.split(" ");

      // Jika nama terlalu panjang
      if (name.length > 10) {
        // Jika lebih dari 2 kata
        if (words.length > 2) {
          // Cek panjang kata pertama dan kedua
          const firstTwoWords = `${words[0]} ${words[1]}`;

          // Jika gabungan 2 kata pertama sudah panjang, buat line break
          if (firstTwoWords.length > 14) {
            return `${words[0]}<br>${words[1]} ${words.slice(2).join(" ")}`;
          } else {
            // Jika masih muat, gabung 2 kata pertama
            return `${firstTwoWords}<br>${words.slice(2).join(" ")}`;
          }
        } else if (words.length === 2) {
          // Jika 2 kata, cek panjang masing-masing
          if (words[0].length > 7 || words[1].length > 7) {
            return `${words[0]}<br>${words[1]}`;
          }
        }
      }

      return name;
    }

    function initializeSlider() {
      gallerySlider.innerHTML = "";
      const visibleItems = allGalleryItems.slice(0, MAX_VISIBLE_ITEMS);

      visibleItems.forEach((item) => {
        const slideElement = document.createElement("div");
        slideElement.classList.add("slide");

        const img = document.createElement("img");
        img.src = item.player_image;
        img.alt = item.player_name;

        const playerName = document.createElement("div");
        playerName.classList.add("player-name");
        playerName.innerHTML = formatPlayerName(item.player_name); // Gunakan innerHTML

        slideElement.appendChild(img);
        slideElement.appendChild(playerName);
        slideElement.addEventListener("click", () => updateBigMenu(item));

        gallerySlider.appendChild(slideElement);
      });
    }

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
          playerName.innerHTML = formatPlayerName(allGalleryItems[nextItemIndex].player_name); // Gunakan innerHTML

          slideElement.appendChild(img);
          slideElement.appendChild(playerName);
          slideElement.addEventListener("click", () => updateBigMenu(allGalleryItems[nextItemIndex]));

          gallerySlider.appendChild(slideElement);
        }

        // Update button visibility
        prevBtn.style.display = "block";
        nextBtn.style.display = currentStartIndex + MAX_VISIBLE_ITEMS >= allGalleryItems.length ? "none" : "block";
      }
    }

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
        playerName.innerHTML = formatPlayerName(allGalleryItems[prevItemIndex].player_name); // Gunakan innerHTML

        slideElement.appendChild(img);
        slideElement.appendChild(playerName);
        slideElement.addEventListener("click", () => updateBigMenu(allGalleryItems[prevItemIndex]));

        gallerySlider.insertBefore(slideElement, gallerySlider.firstChild);

        // Update button visibility
        nextBtn.style.display = "block";
        prevBtn.style.display = currentStartIndex === 0 ? "none" : "block";
      }
    }

    function updateBigMenu(player) {
      const bigMenuContainer = document.getElementById("big-menu");
      const bigImage = bigMenuContainer.querySelector("img");
      const playerDetails = bigMenuContainer.querySelector("div");

      bigImage.src = player.player_image;
      playerDetails.innerHTML = `  
  <h4 class="player-info">  
    ${player.player_name || "Player Name"} |   
    ${player.position || "Position"} |   
    ${player.country || "Country"}  
  </h4>  
  <style>  
    .player-info {  
      color: #333;  
    }  
    .player-info:nth-child(1) { color: #23439B; }  
    .player-info:nth-child(2) { color: #18A950; }  
    .player-info:nth-child(3) { color: #111A30; }  
  </style>  
  <p>${player.description || "No available description"}</p>  
`;  
    }

    function initializeBigGallery() {
      if (galleryItems.length === 0) return;

      bigGallery.innerHTML = "";
      const bigImage = document.createElement("img");
      bigImage.src = galleryItems[0].imageUrl;
      bigGallery.appendChild(bigImage);
    }

    function initializeScrollGallery() {
      galleryScroll.innerHTML = "";
      galleryItems.forEach((item, index) => {
        const thumbnail = document.createElement("div");
        thumbnail.classList.add("gallery-thumbnail");

        const img = document.createElement("img");
        img.src = item.imageUrl;

        thumbnail.appendChild(img);
        thumbnail.addEventListener("click", () => updateBigGallery(index));

        galleryScroll.appendChild(thumbnail);
      });
    }

    function updateBigGallery(index) {
      const bigImage = bigGallery.querySelector("img");
      bigImage.src = galleryItems[index].imageUrl;

      const thumbnails = document.querySelectorAll(".gallery-thumbnail");
      thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle("active", i === index);
      });
    }

    function setupEventListeners() {
      window.addEventListener("resize", () => {
        MAX_VISIBLE_ITEMS = calculateMaxVisibleItems();
        initializeSlider();
      });

      // Tambahkan event listeners untuk tombol prev dan next
      prevBtn.addEventListener("click", loadPrevSlide);
      nextBtn.addEventListener("click", loadNextSlide);
    }

    fetchGalleryItems();
  }

  handleResponsiveNavigation();
  initializeGallery();
});
