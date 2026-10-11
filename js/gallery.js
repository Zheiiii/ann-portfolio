(() => {
  const filterButtons = document.querySelectorAll(".gallery-filter-btn");
  const filterLinks = document.querySelectorAll("[data-filter-link]");
  const galleryItems = document.querySelectorAll(".gallery-item");
  const galleryGroups = document.querySelectorAll("[data-gallery-group]");
  const imageItems = document.querySelectorAll(".masonry-item, .portrait-feature-item");
  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = document.querySelector(".lightbox-img");
  const lightboxMeta = document.querySelector(".lightbox-meta");
  const lightboxClose = document.querySelector(".lightbox-close");

  function applyFilter(filter) {
    filterButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.filter === filter);
    });

    galleryItems.forEach((item) => {
      const shouldShow = filter === "all" || item.dataset.category === filter;
      item.classList.toggle("is-hidden", !shouldShow);
    });

    galleryGroups.forEach((group) => {
      const shouldShow = filter === "all" || group.dataset.galleryGroup === filter;
      group.classList.toggle("is-hidden", !shouldShow);
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";
      applyFilter(filter);
      if (filter !== "all") {
        history.replaceState(null, "", `#${filter}`);
      } else {
        history.replaceState(null, "", "gallery.html");
      }
    });
  });

  filterLinks.forEach((link) => {
    link.addEventListener("click", () => {
      applyFilter(link.dataset.filterLink || "all");
    });
  });

  function openLightbox(item) {
    if (!lightbox || !lightboxImg || !lightboxMeta) {
      return;
    }

    const src = item.dataset.src || item.querySelector("img")?.src || "";
    const title = item.dataset.title || "archive image";
    const category = item.dataset.category || "photo";
    const categoryLabel = {
      street: "基础摄影类",
      portrait: "人像摄影",
      creative: "创意宣传",
      video: "影像作品",
      photo: "摄影作品",
    }[category] || category;
    lightboxImg.src = src;
    lightboxImg.alt = `${title} 放大预览`;
    lightboxMeta.textContent = `${categoryLabel} / ${title}`;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg) {
      return;
    }

    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      if (!lightbox.classList.contains("is-open")) {
        lightboxImg.src = "";
      }
    }, 260);
  }

  imageItems.forEach((item) => {
    item.addEventListener("click", () => openLightbox(item));
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });

  const hash = window.location.hash.replace("#", "");
  if (hash === "street" || hash === "portrait" || hash === "creative" || hash === "video") {
    applyFilter(hash);
  }
})();
