function handleResponsiveNavigation() {
  const menuItems = document.querySelectorAll("nav ul li a");
  const links = document.querySelectorAll("nav ul li a");
  const container = document.querySelector(".container");
  let currentSectionIndex = 0;

  const checkResponsiveMode = () => {
    return window.innerWidth < 1200;
  };

  if (!container) {
    console.error("Container not found");
    return;
  }

  // Reset transform dan styling untuk berbagai mode
  container.style.transform = "none";
  container.style.flexDirection = checkResponsiveMode() ? "column" : "row";

  // Inisialisasi aktif untuk History di desktop/mobile
  links.forEach((link) => link.classList.remove("active"));
  document.querySelector('a[href="#history"]').classList.add("active");

  links.forEach((link, index) => {
    // Hapus event listener sebelumnya untuk mencegah duplikasi
    link.removeEventListener("click", desktopHandler);
    link.removeEventListener("click", mobileHandler);

    // Tambahkan event listener sesuai mode
    link.addEventListener("click", checkResponsiveMode() ? mobileHandler : desktopHandler);
    link.setAttribute("data-index", index);
  });

  function mobileHandler(e) {
    e.preventDefault(); // Mencegah navigasi default

    const targetSectionId = this.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetSectionId);

    if (targetSection) {
      // Scroll ke section yang dituju
      targetSection.scrollIntoView({
        behavior: "smooth",
      });

      // Update active state
      links.forEach((link) => link.classList.remove("active"));
      this.classList.add("active");

      // Tutup menu mobile
      const menu = document.getElementById("menu");
      const burger = document.getElementById("burger");
      menu.classList.remove("active");
      burger.innerHTML = '<i class="fas fa-bars"></i>';
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

  const burger = document.getElementById("burger");
  burger.onclick = () => {
    const menu = document.getElementById("menu");
    menu.classList.toggle("active");

    if (menu.classList.contains("active")) {
      burger.innerHTML = '<i class="fas fa-times"></i>';
    } else {
      burger.innerHTML = '<i class="fas fa-bars"></i>';
    }
  };

  // Tambahkan event listener resize untuk update navigasi
  window.addEventListener("resize", () => {
    handleResponsiveNavigation();
  });
}

document.addEventListener("DOMContentLoaded", handleResponsiveNavigation);
