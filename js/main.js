(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const draftPaths = document.querySelectorAll(".draft-field path");
  const loopLine = document.querySelector(".loop-line path");
  const reveals = document.querySelectorAll(".reveal");
  const parallaxItems = document.querySelectorAll("[data-parallax]");
  const archiveBlocks = document.querySelectorAll("[data-archive]");

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const formatNumber = (value) => Number(value.toFixed(2)).toString();

  draftPaths.forEach((line) => {
    line.setAttribute("pathLength", "1");
    line.dataset.originalD = line.getAttribute("d") || "";
  });

  if (loopLine) {
    loopLine.dataset.originalD = loopLine.getAttribute("d") || "";
  }

  function settleReveal(item) {
    window.setTimeout(() => {
      if (item.classList.contains("is-visible")) {
        item.classList.add("has-settled");
        item.style.opacity = "1";
        item.style.transform = "translate3d(0, 0, 0) scale(1)";
        item.style.filter = "blur(0) saturate(1)";
        item.style.setProperty("--reveal-glass-opacity", "0");
        item.style.setProperty("--reveal-glass-blur", "0px");
        item.style.setProperty("--reveal-glass-saturation", "1");
        item.style.setProperty("--reveal-glass-scale", "0.985");
      }
    }, 1120);
  }

  function showReveal(item) {
    if (item.classList.contains("is-visible") && !item.classList.contains("is-exiting")) {
      settleReveal(item);
      return;
    }

    item.style.opacity = "0";
    item.style.transform = "translate3d(0, 28px, 0) scale(0.99)";
    item.style.filter = "blur(10px) saturate(0.92)";
    item.style.setProperty("--reveal-glass-opacity", "1");
    item.style.setProperty("--reveal-glass-blur", "18px");
    item.style.setProperty("--reveal-glass-saturation", "0.86");
    item.style.setProperty("--reveal-glass-scale", "1.03");
    void item.offsetWidth;
    item.classList.add("is-visible");
    item.classList.remove("is-exiting");
    item.style.opacity = "1";
    item.style.transform = "translate3d(0, 0, 0) scale(1)";
    item.style.filter = "blur(0) saturate(1)";
    item.style.setProperty("--reveal-glass-opacity", "0");
    item.style.setProperty("--reveal-glass-blur", "0px");
    item.style.setProperty("--reveal-glass-saturation", "1");
    item.style.setProperty("--reveal-glass-scale", "0.985");
    settleReveal(item);
  }

  function hideReveal(item) {
    item.classList.add("is-exiting");
    item.classList.remove("is-visible", "has-settled");
    item.style.opacity = "0.42";
    item.style.transform = "translate3d(0, -14px, 0) scale(0.995)";
    item.style.filter = "blur(7px) saturate(0.94)";
    item.style.setProperty("--reveal-glass-opacity", "0.72");
    item.style.setProperty("--reveal-glass-blur", "12px");
    item.style.setProperty("--reveal-glass-saturation", "0.9");
    item.style.setProperty("--reveal-glass-scale", "1.02");
    window.setTimeout(() => {
      item.classList.remove("is-exiting");
      item.style.opacity = "";
      item.style.transform = "";
      item.style.filter = "";
      item.style.removeProperty("--reveal-glass-opacity");
      item.style.removeProperty("--reveal-glass-blur");
      item.style.removeProperty("--reveal-glass-saturation");
      item.style.removeProperty("--reveal-glass-scale");
    }, 720);
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          showReveal(entry.target);
        } else if (entry.target.classList.contains("is-visible")) {
          hideReveal(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  reveals.forEach((item) => revealObserver.observe(item));

  function revealVisibleItems() {
    reveals.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
        showReveal(item);
      }
    });
  }

  window.setTimeout(revealVisibleItems, 80);
  window.setTimeout(revealVisibleItems, 420);

  function wobblePath(source, time, seed, xAmplitude, yAmplitude, speed) {
    let index = 0;

    return source.replace(/-?\d*\.?\d+/g, (token) => {
      const value = Number(token);
      const axis = index % 2;
      const wave =
        Math.sin(time * speed + index * 0.72 + seed * 1.9) +
        Math.sin(time * speed * 0.47 + index * 0.33 + seed) * 0.38;
      const amplitude = axis === 0 ? xAmplitude : yAmplitude;
      index += 1;
      return formatNumber(value + wave * amplitude);
    });
  }

  let lastLineFrame = 0;

  function animateLivingLines(time, shouldContinue = true) {
    if (time - lastLineFrame > 28) {
      const seconds = time * 0.001;

      draftPaths.forEach((line, index) => {
        const source = line.dataset.originalD;
        if (source) {
          const isConstruction = line.classList.contains("construction-line");
          const isContour = line.classList.contains("contour-line");
          const xAmplitude = isConstruction ? 5.4 : isContour ? 12.5 : 6.2;
          const yAmplitude = isConstruction ? 6.8 : isContour ? 17.5 : 9.4;
          const speed = isConstruction ? 0.72 + index * 0.05 : 0.86 + index * 0.065;
          line.setAttribute("d", wobblePath(source, seconds, index, xAmplitude, yAmplitude, speed));
        }
      });

      if (loopLine?.dataset.originalD) {
        loopLine.setAttribute("d", wobblePath(loopLine.dataset.originalD, seconds, 6, 2.2, 4.4, 0.74));
      }

      root.style.setProperty("--draft-drift-x", `${formatNumber(Math.sin(seconds * 0.42) * 14)}px`);
      root.style.setProperty("--draft-drift-y", `${formatNumber(Math.cos(seconds * 0.36) * 10)}px`);
      root.style.setProperty("--contour-x", `${formatNumber(Math.sin(seconds * 0.5) * 28)}px`);
      root.style.setProperty("--contour-y", `${formatNumber(Math.cos(seconds * 0.39) * 22)}px`);
      root.style.setProperty("--contour-scale", formatNumber(1 + Math.sin(seconds * 0.33) * 0.035));
      lastLineFrame = time;
    }

    if (shouldContinue) {
      window.requestAnimationFrame(animateLivingLines);
    }
  }

  function updateScrollState() {
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    const globalProgress = clamp(scrollY / maxScroll, 0, 1);

    root.style.setProperty("--scroll-ratio", globalProgress.toFixed(4));

    if (!reduceMotion) {
      parallaxItems.forEach((item) => {
        const speed = Number.parseFloat(item.dataset.parallax || "0");
        const rect = item.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        const shift = clamp(center / window.innerHeight, -1.4, 1.4) * speed * 90;
        item.style.setProperty("--section-shift", shift.toFixed(2));
      });
    }
  }

  let ticking = false;

  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScrollState();
        ticking = false;
      });
      ticking = true;
    }
  }

  updateScrollState();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  if (!reduceMotion) {
    const now = window.performance ? window.performance.now() : Date.now();
    animateLivingLines(now, false);
    window.requestAnimationFrame(animateLivingLines);
    window.setInterval(() => {
      const current = window.performance ? window.performance.now() : Date.now();
      animateLivingLines(current, false);
    }, 180);
  }

  document.querySelectorAll("video").forEach((video) => {
    video.addEventListener("play", () => {
      document.querySelectorAll("video").forEach((other) => {
        if (other !== video && !other.paused) {
          other.pause();
        }
      });
    });
  });

  archiveBlocks.forEach((archive) => {
    const preview = archive.querySelector(".archive-preview");
    const previewImg = archive.querySelector(".archive-preview-img");
    const previewTitle = archive.querySelector(".archive-preview-title");
    const cards = archive.querySelectorAll(".archive-card");

    if (!preview || !previewImg || !cards.length) {
      return;
    }

    function activateCard(card) {
      const nextSrc = card.dataset.full;
      const nextTitle = card.dataset.title || "selected frame";

      if (!nextSrc || previewImg.getAttribute("src") === nextSrc) {
        cards.forEach((item) => item.classList.toggle("is-active", item === card));
        return;
      }

      preview.classList.remove("is-switching");
      void preview.offsetWidth;
      preview.classList.add("is-switching");
      previewImg.setAttribute("src", nextSrc);
      previewImg.setAttribute("alt", `${nextTitle} 预览`);
      window.setTimeout(() => preview.classList.remove("is-switching"), 760);

      if (previewTitle) {
        previewTitle.textContent = nextTitle;
      }

      cards.forEach((item) => item.classList.toggle("is-active", item === card));
    }

    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => activateCard(card));
      card.addEventListener("focus", () => activateCard(card));
      card.addEventListener("click", () => activateCard(card));
    });
  });

  const proximityTextSelector = [
    ".proximity-text",
    ".brand span:last-child",
    ".nav a",
    ".eyebrow",
    ".hero-copy",
    ".hero-index > span",
    ".jp-label",
    ".text-link",
    ".section-kicker > span",
    ".film-copy > p",
    ".meta-list dt",
    ".meta-list dd",
    ".video-caption > span",
    ".works-intro > p",
    ".project-text > p",
    ".project-role",
    ".archive-link",
    ".archive-count",
    ".archive-card > span",
    ".about-copy > p",
    ".skill-index div > span",
    ".skill-index strong",
    ".skill-index p",
    ".contact-panel p",
    ".site-footer > span:first-child",
    ".site-footer a",
    ".gallery-hero-copy > p",
    ".gallery-filter-btn",
    ".archive-group-heading > span",
    ".archive-group-heading > p",
    ".masonry-item > span",
    ".portrait-feature-item > span",
    ".video-card div > span",
    ".video-card strong",
    ".video-card p",
    ".lightbox-close",
  ].join(", ");

  document.querySelectorAll(proximityTextSelector).forEach((heading) => {
    if (heading.dataset.proximityReady === "true") {
      return;
    }

    const original = heading.textContent || "";
    if (!original.trim()) {
      return;
    }

    const isLargeText = heading.classList.contains("proximity-text");
    heading.dataset.proximityReady = "true";
    heading.classList.toggle("proximity-small", !isLargeText);
    if (!heading.hasAttribute("aria-label")) {
      heading.setAttribute("aria-label", original);
    }
    heading.textContent = "";

    Array.from(original).forEach((char) => {
      const span = document.createElement("span");
      span.className = "prox-letter";
      span.setAttribute("aria-hidden", "true");
      span.textContent = char === " " ? " " : char;
      heading.appendChild(span);
    });

    const letters = Array.from(heading.querySelectorAll(".prox-letter"));
    const radius = isLargeText ? 190 : 105;
    const scaleAmount = isLargeText ? 0.16 : 0.1;
    const liftAmount = isLargeText ? -0.025 : -0.018;
    const weightAmount = isLargeText ? 70 : 36;
    const canUsePointerEffect = !reduceMotion && window.matchMedia("(pointer: fine)").matches;
    let proximityFrame = 0;

    function resetLetters() {
      letters.forEach((letter) => {
        letter.style.fontWeight = "";
        letter.style.transform = "";
      });
    }

    if (!canUsePointerEffect) {
      return;
    }

    heading.addEventListener("mousemove", (event) => {
      window.cancelAnimationFrame(proximityFrame);
      proximityFrame = window.requestAnimationFrame(() => {
        letters.forEach((letter) => {
          const rect = letter.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const distance = Math.hypot(event.clientX - cx, event.clientY - cy);
          const influence = clamp(1 - distance / radius, 0, 1);
          const eased = influence * influence * (3 - 2 * influence);
          const scale = 1 + eased * scaleAmount;
          const lift = eased * liftAmount;
          const weight = Math.round(650 + eased * weightAmount);

          letter.style.fontWeight = weight;
          letter.style.transform = `translateY(${lift}em) scale(${scale})`;
        });
      });
    });

    heading.addEventListener("mouseleave", () => {
      window.cancelAnimationFrame(proximityFrame);
      resetLetters();
    });
  });
})();
