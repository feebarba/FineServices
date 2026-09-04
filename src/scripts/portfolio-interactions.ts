const brandTypewriter = document.querySelector<HTMLElement>("[data-brand-typewriter]");

if (brandTypewriter && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const primaryText = brandTypewriter.dataset.primaryBrand?.trim() || "Felipe Barbosa";
  const secondaryText = brandTypewriter.dataset.secondaryBrand?.trim() || "Fine Services";
  const holdDuration = 10000;
  const eraseDelay = 60;
  const typeDelay = 84;
  let nextText = secondaryText;
  let timer: number | null = null;

  const typeText = (text: string, index = 0) => {
    if (index >= text.length) {
      timer = window.setTimeout(() => animateTo(nextText), holdDuration);
      return;
    }

    brandTypewriter.textContent = text.slice(0, index + 1);
    timer = window.setTimeout(() => typeText(text, index + 1), typeDelay);
  };

  const eraseText = (onComplete: () => void) => {
    const currentText = brandTypewriter.textContent ?? "";

    if (!currentText) {
      onComplete();
      return;
    }

    brandTypewriter.textContent = currentText.slice(0, -1);
    timer = window.setTimeout(() => eraseText(onComplete), eraseDelay);
  };

  const animateTo = (text: string) => {
    eraseText(() => typeText(text));
    nextText = text === primaryText ? secondaryText : primaryText;
  };

  timer = window.setTimeout(() => animateTo(secondaryText), holdDuration);
}

const galleries = Array.from(
  document.querySelectorAll<HTMLElement>("[data-gallery-scroll]"),
);
type GalleryTab = "design" | "photography";
const galleryLoadDelay = 150;
const resetGalleryStates: Array<{ tab: GalleryTab; reset: () => void }> = [];

const loadGalleryMedia = (gallery: HTMLElement) => {
  if (gallery.dataset.loadStarted === "true") return;
  gallery.dataset.loadStarted = "true";

  type GalleryMedia = HTMLImageElement | HTMLVideoElement;
  type GalleryEntry = { frame: HTMLElement; media: GalleryMedia | null };

  const galleryEntries = Array.from(gallery.querySelectorAll<HTMLElement>(".photo-frame")).map((frame) => ({
    frame,
    media: frame.querySelector<GalleryMedia>(".project-image, .project-video"),
  }));

  if (galleryEntries.length === 0) {
    requestAnimationFrame(() => gallery.classList.add("is-images-ready"));
    return;
  }

  const settledEntries = new Set<GalleryEntry>();
  let nextRevealIndex = 0;

  const revealReadyFramesInOrder = () => {
    while (nextRevealIndex < galleryEntries.length) {
      const entry = galleryEntries[nextRevealIndex];

      if (!settledEntries.has(entry)) break;

      entry.frame.classList.add("is-media-ready");
      nextRevealIndex += 1;
    }
  };

  const markEntrySettled = (entry: GalleryEntry) => {
    if (settledEntries.has(entry)) return;

    settledEntries.add(entry);
    revealReadyFramesInOrder();

    if (settledEntries.size === galleryEntries.length) {
      gallery.classList.add("is-images-ready");
    }
  };

  galleryEntries.forEach((entry) => {
    const media = entry.media;

    if (!media) {
      markEntrySettled(entry);
      return;
    }

    if (media instanceof HTMLImageElement) {
      const image = media;
      const source = image.dataset.src;

      if (!source) {
        markEntrySettled(entry);
        return;
      }

      image.addEventListener("load", () => markEntrySettled(entry), { once: true });
      image.addEventListener("error", () => markEntrySettled(entry), { once: true });
      const sourceSet = image.dataset.srcset;
      if (sourceSet) image.srcset = sourceSet;
      const sizes = image.dataset.sizes;
      if (sizes) image.sizes = sizes;
      image.src = source;
      image.removeAttribute("data-src");
      image.removeAttribute("data-srcset");
      image.removeAttribute("data-sizes");

      if (image.complete) {
        markEntrySettled(entry);
      }
      return;
    }

    const video = media;
    const source = video.dataset.src;

    if (!source) {
      markEntrySettled(entry);
      return;
    }

    const startPlayback = () => {
      const playback = video.play();
      playback?.catch(() => undefined);
    };

    const syncIntrinsicDimensions = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const photo = video.closest<HTMLElement>(".photo");

      if (!photo || width <= 0 || height <= 0) return;

      photo.style.setProperty("--media-ratio", String(width / height));
      video.width = width;
      video.height = height;
    };

    video.addEventListener("loadedmetadata", syncIntrinsicDimensions, { once: true });
    video.addEventListener("loadeddata", () => {
      markEntrySettled(entry);
      startPlayback();
    }, { once: true });
    video.addEventListener("error", () => markEntrySettled(entry), { once: true });
    video.src = source;
    video.removeAttribute("data-src");
    const posterSource = video.dataset.posterSrc;
    if (posterSource) {
      video.poster = posterSource;
      video.removeAttribute("data-poster-src");
    }
    video.load();
    startPlayback();

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markEntrySettled(entry);
    }
  });
};

let galleryObserver: IntersectionObserver | null = null;
const pendingGalleryLoads = new Map<HTMLElement, number>();
const intersectingGalleries = new Set<HTMLElement>();

const resetGalleryReveal = (gallery: HTMLElement) => {
  gallery.classList.remove("is-images-ready");
  gallery.querySelectorAll<HTMLElement>(".photo-frame").forEach((frame) => {
    frame.classList.remove("is-media-ready", "is-revealed");
  });
};

const replayLoadedGallery = (gallery: HTMLElement) => {
  resetGalleryReveal(gallery);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (gallery.dataset.replayPending !== "true") return;

      gallery.querySelectorAll<HTMLElement>(".photo-frame").forEach((frame) => {
        frame.classList.add("is-media-ready");
      });
      gallery.classList.add("is-images-ready");
      delete gallery.dataset.replayPending;
    });
  });
};

const replayGalleryReveal = (tab: GalleryTab) => {
  const readyGalleries = galleries.filter((gallery) =>
    gallery.dataset.tabGallery === tab &&
    gallery.classList.contains("is-images-ready"),
  );

  if (readyGalleries.length === 0) return;

  readyGalleries.forEach((gallery) => {
    gallery.dataset.replayPending = "true";
    resetGalleryReveal(gallery);
    galleryObserver?.observe(gallery);
  });

  if (!galleryObserver) {
    readyGalleries.forEach(replayLoadedGallery);
  }
};

const cancelPendingGalleryLoad = (gallery: HTMLElement) => {
  const timer = pendingGalleryLoads.get(gallery);
  if (timer === undefined) return;
  window.clearTimeout(timer);
  pendingGalleryLoads.delete(gallery);
};

const cancelPendingGalleryLoads = () => {
  pendingGalleryLoads.forEach((timer) => window.clearTimeout(timer));
  pendingGalleryLoads.clear();
  intersectingGalleries.clear();
};

const scheduleGalleryLoad = (gallery: HTMLElement) => {
  if (pendingGalleryLoads.has(gallery)) return;

  const timer = window.setTimeout(() => {
    pendingGalleryLoads.delete(gallery);
    if (!intersectingGalleries.has(gallery)) return;

    loadGalleryMedia(gallery);
    if (gallery.dataset.replayPending === "true") {
      replayLoadedGallery(gallery);
    }
    galleryObserver?.unobserve(gallery);
  }, galleryLoadDelay);

  pendingGalleryLoads.set(gallery, timer);
};

if ("IntersectionObserver" in window) {
  galleryObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const gallery = entry.target as HTMLElement;
        if (!entry.isIntersecting) {
          intersectingGalleries.delete(gallery);
          cancelPendingGalleryLoad(gallery);
          return;
        }

        intersectingGalleries.add(gallery);
        if (gallery.dataset.replayPending === "true") {
          replayLoadedGallery(gallery);
          galleryObserver?.unobserve(gallery);
          return;
        }

        scheduleGalleryLoad(gallery);
      });
    },
    { threshold: 0.01 },
  );

  galleries.forEach((gallery) => galleryObserver?.observe(gallery));
} else {
  setTimeout(() => galleries.forEach(loadGalleryMedia), galleryLoadDelay);
}

galleries.forEach((gallery) => {
  const galleryTab: GalleryTab = gallery.dataset.tabGallery === "design"
    ? "design"
    : "photography";

  let isDragging = false;
  let hasDragged = false;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;
  let dragSamples: Array<{ x: number; time: number }> = [];
  let momentumFrame: number | null = null;
  let expansionSyncFrame: number | null = null;

  const cancelMomentum = () => {
    if (momentumFrame === null) return;
    cancelAnimationFrame(momentumFrame);
    momentumFrame = null;
  };

  const cancelExpansionSync = () => {
    if (expansionSyncFrame === null) return;
    cancelAnimationFrame(expansionSyncFrame);
    expansionSyncFrame = null;
  };

  const resetGalleryState = () => {
    cancelMomentum();
    cancelExpansionSync();
    isDragging = false;
    hasDragged = false;
    dragSamples = [];
    gallery.classList.remove("is-dragging", "is-expanded");
    gallery.setAttribute("aria-expanded", "false");
    gallery.scrollTo({ left: 0, behavior: "auto" });
  };

  resetGalleryStates.push({ tab: galleryTab, reset: resetGalleryState });

  const startMomentum = () => {
    if (dragSamples.length < 2) return;

    const firstSample = dragSamples[0];
    const lastSample = dragSamples[dragSamples.length - 1];
    const sampleDuration = Math.max(lastSample.time - firstSample.time, 1);
    const idleTime = Math.min(performance.now() - lastSample.time, 120);
    let velocity = -((lastSample.x - firstSample.x) / sampleDuration);

    velocity *= Math.pow(0.84, idleTime / 16);
    velocity = Math.max(-3.2, Math.min(3.2, velocity));

    if (Math.abs(velocity) < 0.012) return;

    let previousTime = performance.now();

    const animateMomentum = (time: number) => {
      const elapsed = Math.min(time - previousTime, 32);
      previousTime = time;

      const previousScrollLeft = gallery.scrollLeft;
      const maxScroll = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
      const nextScrollLeft = Math.max(
        0,
        Math.min(maxScroll, previousScrollLeft + velocity * elapsed),
      );
      gallery.scrollLeft = nextScrollLeft;

      if (
        Math.abs(gallery.scrollLeft - previousScrollLeft) < 0.1 ||
        nextScrollLeft === 0 ||
        nextScrollLeft === maxScroll
      ) {
        momentumFrame = null;
        return;
      }

      velocity *= Math.pow(0.97, elapsed / 16);

      if (Math.abs(velocity) < 0.012) {
        momentumFrame = null;
        return;
      }

      momentumFrame = requestAnimationFrame(animateMomentum);
    };

    momentumFrame = requestAnimationFrame(animateMomentum);
  };

  gallery.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    cancelMomentum();
    cancelExpansionSync();
    isDragging = true;
    hasDragged = false;
    dragStartX = event.clientX;
    dragStartScrollLeft = gallery.scrollLeft;
    dragSamples = [{ x: event.clientX, time: performance.now() }];
    gallery.classList.add("is-dragging");
    gallery.setPointerCapture(event.pointerId);
  });

  gallery.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const now = performance.now();
    const distance = event.clientX - dragStartX;

    dragSamples.push({ x: event.clientX, time: now });
    while (dragSamples.length > 1 && now - dragSamples[0].time > 120) {
      dragSamples.shift();
    }

    if (Math.abs(distance) < 4) return;

    hasDragged = true;
    event.preventDefault();
    const maxScroll = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
    gallery.scrollLeft = Math.max(
      0,
      Math.min(maxScroll, dragStartScrollLeft - distance),
    );
  });

  const stopDragging = (event: PointerEvent) => {
    if (!isDragging) return;

    if (event.type === "pointerup") {
      const now = performance.now();
      dragSamples.push({ x: event.clientX, time: now });
      while (dragSamples.length > 1 && now - dragSamples[0].time > 120) {
        dragSamples.shift();
      }
    }

    isDragging = false;
    gallery.classList.remove("is-dragging");
    if (gallery.hasPointerCapture(event.pointerId)) {
      gallery.releasePointerCapture(event.pointerId);
    }

    if (event.type === "pointerup" && hasDragged) {
      startMomentum();
    }
  };

  gallery.addEventListener("pointerup", stopDragging);
  gallery.addEventListener("pointercancel", stopDragging);
  gallery.addEventListener("lostpointercapture", stopDragging);

  gallery.addEventListener("animationend", (event) => {
    const frame = event.target;

    if (frame instanceof HTMLElement && frame.classList.contains("photo-frame")) {
      frame.classList.add("is-revealed");
    }
  });

  const toggleExpanded = () => {
    cancelMomentum();
    cancelExpansionSync();

    gallery.querySelectorAll<HTMLElement>(".photo-frame").forEach((frame) => {
      frame.classList.add("is-revealed");
    });

    const initialMaxScroll = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
    const scrollProgress = initialMaxScroll > 0 ? gallery.scrollLeft / initialMaxScroll : 0;
    const isExpanded = gallery.classList.toggle("is-expanded");
    gallery.setAttribute("aria-expanded", String(isExpanded));

    const transitionStartedAt = performance.now();
    const transitionDuration = 550;

    const preserveScrollProgress = (time: number) => {
      const currentMaxScroll = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
      gallery.scrollLeft = currentMaxScroll * scrollProgress;

      if (time - transitionStartedAt < transitionDuration + 50) {
        expansionSyncFrame = requestAnimationFrame(preserveScrollProgress);
        return;
      }

      expansionSyncFrame = null;
    };

    expansionSyncFrame = requestAnimationFrame(preserveScrollProgress);
  };

  gallery.addEventListener("click", () => {
    if (hasDragged) {
      hasDragged = false;
      return;
    }

    toggleExpanded();
  });

  gallery.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleExpanded();
      return;
    }

    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    gallery.scrollBy({ left: event.key === "ArrowRight" ? 320 : -320, behavior: "smooth" });
  });
});

const designAccordionResetters: Array<() => void> = [];
const designAccordions = Array.from(
  document.querySelectorAll<HTMLElement>("[data-design-accordion]"),
);

designAccordions.forEach((accordion) => {
  const toggle = accordion.querySelector<HTMLButtonElement>("[data-design-accordion-toggle]");
  const panel = accordion.querySelector<HTMLElement>("[data-design-accordion-panel]");
  const arrow = accordion.querySelector<HTMLImageElement>(".design-accordion-arrow");
  const designMeta = accordion.closest<HTMLElement>(".design-project-meta");
  const isMobileInfoAccordion = accordion.classList.contains("design-info-accordion");
  let mobileMetaBaseHeight: number | null = null;
  let mobileMetaCleanupTimer: number | null = null;

  if (!toggle || !panel || !arrow) return;

  const isMobileLayout = () => window.matchMedia("(max-width: 743px)").matches;

  const clearMobileInfoLayout = () => {
    if (!isMobileInfoAccordion || !designMeta) return;

    if (mobileMetaCleanupTimer !== null) {
      window.clearTimeout(mobileMetaCleanupTimer);
      mobileMetaCleanupTimer = null;
    }

    designMeta.style.removeProperty("height");
    accordion.style.removeProperty("--mobile-info-left");
    mobileMetaBaseHeight = null;
  };

  const syncMobileInfoHeight = (accordionHeight: number) => {
    if (
      !isMobileInfoAccordion ||
      !designMeta ||
      !isMobileLayout() ||
      !accordion.classList.contains("is-open")
    ) return;

    const paddingBottom = Number.parseFloat(getComputedStyle(designMeta).paddingBottom) || 0;
    designMeta.style.height = `${accordionHeight + paddingBottom}px`;
  };

  const getNaturalHeight = () => {
    const previousMaxHeight = accordion.style.maxHeight;
    accordion.style.maxHeight = "none";
    const naturalHeight = accordion.getBoundingClientRect().height;
    accordion.style.maxHeight = previousMaxHeight;
    return naturalHeight;
  };

  const setExpanded = (expanded: boolean) => {
    if (isMobileInfoAccordion && designMeta && isMobileLayout()) {
      if (mobileMetaCleanupTimer !== null) {
        window.clearTimeout(mobileMetaCleanupTimer);
        mobileMetaCleanupTimer = null;
      }

      if (expanded) {
        const metaRect = designMeta.getBoundingClientRect();
        const accordionRect = accordion.getBoundingClientRect();
        mobileMetaBaseHeight ??= metaRect.height;
        accordion.style.setProperty(
          "--mobile-info-left",
          `${accordionRect.left - metaRect.left}px`,
        );
        designMeta.style.height = `${metaRect.height}px`;
      }
    }

    const currentHeight = accordion.getBoundingClientRect().height;
    accordion.style.maxHeight = `${currentHeight}px`;
    accordion.classList.toggle("is-open", expanded);
    toggle.setAttribute("aria-expanded", String(expanded));
    panel.setAttribute("aria-hidden", String(!expanded));
    arrow.src = expanded
      ? arrow.dataset.openSrc ?? arrow.src
      : arrow.dataset.closedSrc ?? arrow.src;

    void accordion.offsetHeight;
    const targetHeight = expanded ? getNaturalHeight() : 20;

    if (isMobileInfoAccordion && designMeta && isMobileLayout()) {
      if (expanded) {
        syncMobileInfoHeight(targetHeight);
      } else {
        const targetMetaHeight = mobileMetaBaseHeight ?? designMeta.getBoundingClientRect().height;
        requestAnimationFrame(() => {
          designMeta.style.height = `${targetMetaHeight}px`;
        });
        mobileMetaCleanupTimer = window.setTimeout(() => {
          if (!accordion.classList.contains("is-open")) {
            clearMobileInfoLayout();
          }
        }, 350);
      }
    }

    requestAnimationFrame(() => {
      accordion.style.maxHeight = `${targetHeight}px`;
    });
  };

  const updateExpandedHeight = () => {
    if (!accordion.classList.contains("is-open")) return;
    const naturalHeight = getNaturalHeight();
    accordion.style.maxHeight = `${naturalHeight}px`;
    syncMobileInfoHeight(naturalHeight);
  };

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(updateExpandedHeight);
    resizeObserver.observe(panel);
  }

  toggle.addEventListener("click", () => {
    setExpanded(toggle.getAttribute("aria-expanded") !== "true");
  });

  designAccordionResetters.push(() => setExpanded(false));
});

const portfolioShell = document.querySelector<HTMLElement>(".portfolio-shell");
const homePanel = document.querySelector<HTMLElement>("[data-home-panel]");
const homeToggle = document.querySelector<HTMLAnchorElement>("[data-home-toggle]");
const designToggle = document.querySelector<HTMLAnchorElement>("[data-design-toggle]");
const designPanel = document.querySelector<HTMLElement>("[data-design-panel]");
const designContent = document.querySelector<HTMLElement>("[data-design-content]");
const photographyPanel = document.querySelector<HTMLElement>("[data-photography-panel]");
const photographyContent = document.querySelector<HTMLElement>("[data-photography-content]");
const photographyToggle = document.querySelector<HTMLAnchorElement>("[data-photography-toggle]");

const syncTabBlur = (content: HTMLElement, panel: HTMLElement) => {
  panel.classList.toggle("has-scroll", content.scrollTop > 0);
};

[[designContent, designPanel], [photographyContent, photographyPanel]].forEach(([content, panel]) => {
  if (!content || !panel) return;
  const sync = () => syncTabBlur(content, panel);
  content.addEventListener("scroll", sync, { passive: true });
  sync();
});

[[designPanel, designToggle], [photographyPanel, photographyToggle]].forEach(([panel, toggle]) => {
  if (!panel || !toggle) return;

  const clearPressedState = () => panel.classList.remove("is-pressed");

  toggle.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") panel.classList.add("is-pressed");
  });
  toggle.addEventListener("pointerup", clearPressedState);
  toggle.addEventListener("pointercancel", clearPressedState);
  toggle.addEventListener("pointerleave", clearPressedState);
});

const tabTransitionDuration = 600;
type PortfolioTab = "home" | "design" | "photography";
type HistoryMode = "push" | "replace" | "none";
const tabPaths: Record<PortfolioTab, string> = {
  home: "/",
  design: "/design",
  photography: "/photography",
};
const tabTitles: Record<PortfolioTab, string> = {
  home: "Felipe Barbosa",
  design: "Design — Felipe Barbosa",
  photography: "Photography — Felipe Barbosa",
};
const tabFromPath = (path: string): PortfolioTab => {
  const normalizedPath = path.replace(/\/+$/, "") || "/";
  if (normalizedPath === "/design") return "design";
  if (normalizedPath === "/photography") return "photography";
  return "home";
};
let activeTab: PortfolioTab = tabFromPath(window.location.pathname);
let tabTransitionTimer: number | null = null;
let galleryRevealTimer: number | null = null;

const resetTabState = (tab: PortfolioTab) => {
  if (tab === "design" || tab === "photography") {
    const content = tab === "design" ? designContent : photographyContent;
    content?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    resetGalleryStates
      .filter(({ tab: galleryTab }) => galleryTab === tab)
      .forEach(({ reset }) => reset());
    if (tab === "design") {
      designAccordionResetters.forEach((reset) => reset());
    }
    return;
  }

  const content = homePanel?.querySelector<HTMLElement>(".tab-content");
  content?.scrollTo({ top: 0, left: 0, behavior: "auto" });
};

const setActiveTab = (nextTab: PortfolioTab, historyMode: HistoryMode = "push") => {
  if (!portfolioShell || !homePanel || !designPanel || !photographyPanel) return;
  if (activeTab === nextTab) return;

  const previousTab = activeTab;
  const homeContent = homePanel.querySelector<HTMLElement>(".home-content");
  const homeWasScrolled = previousTab === "home" && (homeContent?.scrollTop ?? 0) > 0;

  activeTab = nextTab;
  document.title = tabTitles[nextTab];

  if (tabTransitionTimer !== null) {
    window.clearTimeout(tabTransitionTimer);
    tabTransitionTimer = null;
  }
  if (galleryRevealTimer !== null) {
    window.clearTimeout(galleryRevealTimer);
    galleryRevealTimer = null;
  }
  cancelPendingGalleryLoads();

  if (historyMode !== "none") {
    const historyMethod = historyMode === "replace" ? "replaceState" : "pushState";
    window.history[historyMethod]({ portfolioTab: nextTab }, "", tabPaths[nextTab]);
  }

  const previousPanel = previousTab === "home"
    ? homePanel
    : previousTab === "design"
      ? designPanel
      : photographyPanel;

  portfolioShell.classList.add("is-tab-transitioning");
  homePanel.classList.toggle("is-scrolled", homeWasScrolled);
  [homePanel, designPanel, photographyPanel].forEach((panel) => {
    panel.classList.remove("is-closing");
  });
  previousPanel.classList.add("is-closing");
  homePanel.classList.toggle("active", nextTab === "home");
  designPanel.classList.toggle("active", nextTab === "design");
  designPanel.classList.toggle("inactive", nextTab === "photography");
  photographyPanel.classList.toggle("active", nextTab === "photography");

  designToggle?.setAttribute("aria-expanded", String(nextTab === "design"));
  photographyToggle?.setAttribute("aria-expanded", String(nextTab === "photography"));
  designPanel.querySelector(".tab-content")?.setAttribute("aria-hidden", String(nextTab !== "design"));
  photographyContent?.setAttribute("aria-hidden", String(nextTab !== "photography"));

  if (nextTab === "design" || nextTab === "photography") {
    const content = nextTab === "design" ? designContent : photographyContent;
    content?.scrollTo({ top: 0, behavior: "auto" });
    galleryRevealTimer = window.setTimeout(() => {
      galleryRevealTimer = null;
      if (activeTab === nextTab) replayGalleryReveal(nextTab);
    }, galleryLoadDelay);
  }

  tabTransitionTimer = window.setTimeout(() => {
    portfolioShell.classList.remove("is-tab-transitioning");
    previousPanel.classList.remove("is-closing");
    resetTabState(previousTab);
    if (nextTab === "home") {
      resetTabState("home");
    }
    homePanel.classList.remove("is-scrolled");
    tabTransitionTimer = null;
  }, tabTransitionDuration);
};

homeToggle?.addEventListener("click", (event) => {
  event.preventDefault();
  setActiveTab("home");
});

designToggle?.addEventListener("click", (event) => {
  event.preventDefault();
  setActiveTab(activeTab === "design" ? "home" : "design");
});

photographyToggle?.addEventListener("click", (event) => {
  event.preventDefault();
  setActiveTab(activeTab === "photography" ? "home" : "photography");
});

window.addEventListener("popstate", () => {
  setActiveTab(tabFromPath(window.location.pathname), "none");
});
