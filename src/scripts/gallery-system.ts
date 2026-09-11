type GalleryTab = "design" | "photography";

type GalleryReset = {
  tab: GalleryTab;
  reset: () => void;
};

export const initializeGallerySystem = (
  galleries: HTMLElement[],
  isGalleryTabActive: (gallery: HTMLElement) => boolean,
) => {
  const galleryLoadDelay = 150;
  const galleryRevealStep = 150;
  const galleryExpansionDuration = 550;
  const slowLoadFallbackDelay = 1000;
  const resetGalleryStates: GalleryReset[] = [];
  type GalleryMedia = HTMLImageElement | HTMLVideoElement;
  type GalleryEntry = {
    frame: HTMLElement;
    media: GalleryMedia | null;
    placeholder: HTMLImageElement | null;
    index: number;
    isVisible: boolean;
    hasStarted: boolean;
    hasStartedMedia: boolean;
    hasPlaceholder: boolean;
    placeholderReady: boolean;
    slowLoadElapsed: boolean;
    slowLoadTimer: number | null;
    hasReleased: boolean;
  };
  type GalleryLoaderState = {
    entries: GalleryEntry[];
    entriesByFrame: Map<HTMLElement, GalleryEntry>;
    intersectingEntries: Set<GalleryEntry>;
    galleryIsVisible: boolean;
    mediaObserver: IntersectionObserver | null;
    revealQueue: GalleryEntry[];
    queuedEntries: Set<GalleryEntry>;
    nextPlaceholderIndex: number;
    nextMediaIndex: number;
    placeholderRevealTimer: number | null;
    mediaRevealTimer: number | null;
    lastPlaceholderRevealAt: number;
    lastMediaRevealAt: number;
  };
  const galleryLoaders = new Map<HTMLElement, GalleryLoaderState>();
  const loadedVideos = new Set<HTMLVideoElement>();

  const canReleaseWithPlaceholder = (entry: GalleryEntry) => (
    entry.slowLoadElapsed &&
    entry.hasPlaceholder &&
    entry.placeholderReady &&
    !entry.frame.classList.contains("is-media-settled") &&
    entry.frame.classList.contains("is-placeholder-ready")
  );

  const scheduleSlowLoadingFallback = (state: GalleryLoaderState, entry: GalleryEntry) => {
    if (!entry.placeholder || entry.slowLoadTimer !== null || entry.slowLoadElapsed) return;

    entry.slowLoadTimer = window.setTimeout(() => {
      entry.slowLoadTimer = null;
      entry.slowLoadElapsed = true;
      scheduleMediaReveal(state);
    }, slowLoadFallbackDelay);
  };

  const isElementInViewport = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
  };

  const isVideoTabActive = (video: HTMLVideoElement) => {
    const gallery = video.closest<HTMLElement>("[data-gallery-scroll]");
    return gallery ? isGalleryTabActive(gallery) : false;
  };

  const suppressNativeVideoControls = (video: HTMLVideoElement) => {
    video.autoplay = false;
    video.controls = false;
    video.removeAttribute("autoplay");
    video.removeAttribute("controls");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
  };

  const setAutoplayBlockedState = (video: HTMLVideoElement, isBlocked: boolean) => {
    const frame = video.closest<HTMLElement>(".photo-frame");
    if (!frame) return;

    const canShowPoster = Boolean(frame.querySelector(".media-placeholder"));
    frame.classList.toggle("is-autoplay-blocked", isBlocked && canShowPoster);
  };

  const playVideoIfVisible = (video: HTMLVideoElement) => {
    suppressNativeVideoControls(video);

    if (!isVideoTabActive(video) || !isElementInViewport(video)) {
      video.pause();
      return;
    }

    try {
      const playback = video.play();
      playback?.then(() => setAutoplayBlockedState(video, false)).catch(() => {
        if (isVideoTabActive(video) && isElementInViewport(video) && video.paused) {
          setAutoplayBlockedState(video, true);
        }
      });
    } catch {
      setAutoplayBlockedState(video, true);
    }
  };

  let videoVisibilityObserver: IntersectionObserver | null = null;
  if ("IntersectionObserver" in window) {
    videoVisibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (!entry.isIntersecting || !isVideoTabActive(video)) {
            video.pause();
            return;
          }

          playVideoIfVisible(video);
        });
      },
      { threshold: 0.01 },
    );
  }

  const observeVideoPlayback = (video: HTMLVideoElement) => {
    loadedVideos.add(video);
    videoVisibilityObserver?.observe(video);
    playVideoIfVisible(video);
  };

  const syncLoadedVideoPlayback = () => {
    loadedVideos.forEach(playVideoIfVisible);
  };

  const pauseGalleryVideos = (gallery: HTMLElement) => {
    gallery.querySelectorAll<HTMLVideoElement>(".project-video").forEach((video) => video.pause());
  };

  const schedulePlaceholderReveal = (state: GalleryLoaderState) => {
    while (state.nextPlaceholderIndex < state.revealQueue.length) {
      const nextEntry = state.revealQueue[state.nextPlaceholderIndex];
      if (!nextEntry.placeholderReady) return;
      if (nextEntry.hasPlaceholder) break;
      state.nextPlaceholderIndex += 1;
    }

    const nextEntry = state.revealQueue[state.nextPlaceholderIndex];
    if (!nextEntry || !nextEntry.placeholderReady || state.placeholderRevealTimer !== null) return;

    const now = performance.now();
    const delay = Math.max(0, state.lastPlaceholderRevealAt + galleryRevealStep - now);
    state.placeholderRevealTimer = window.setTimeout(() => {
      state.placeholderRevealTimer = null;
      if (!nextEntry.placeholderReady) return;

      nextEntry.frame.style.setProperty("--reveal-delay", "0ms");
      nextEntry.frame.classList.add("is-placeholder-ready");
      state.nextPlaceholderIndex += 1;
      state.lastPlaceholderRevealAt = performance.now();
      schedulePlaceholderReveal(state);
      scheduleMediaReveal(state);
    }, delay);
  };

  const scheduleMediaReveal = (state: GalleryLoaderState) => {
    const nextEntry = state.revealQueue[state.nextMediaIndex];
    const mediaIsSettled = nextEntry?.frame.classList.contains("is-media-settled") ?? false;
    if (
      !nextEntry ||
      (!mediaIsSettled && !canReleaseWithPlaceholder(nextEntry)) ||
      state.mediaRevealTimer !== null
    ) return;

    const now = performance.now();
    const delay = Math.max(0, state.lastMediaRevealAt + galleryRevealStep - now);
    state.mediaRevealTimer = window.setTimeout(() => {
      state.mediaRevealTimer = null;
      const entryIsSettled = nextEntry.frame.classList.contains("is-media-settled");
      if (!entryIsSettled && !canReleaseWithPlaceholder(nextEntry)) return;

      nextEntry.frame.style.setProperty("--reveal-delay", "0ms");
      if (entryIsSettled) {
        nextEntry.frame.classList.remove("is-slow-loading");
        nextEntry.frame.classList.add("is-media-ready");
        if (!nextEntry.frame.classList.contains("is-placeholder-ready")) {
          nextEntry.placeholderReady = true;
        }
      } else {
        nextEntry.frame.classList.add("is-slow-loading");
      }
      nextEntry.hasReleased = true;
      state.nextMediaIndex += 1;
      state.lastMediaRevealAt = performance.now();
      schedulePlaceholderReveal(state);
      scheduleMediaReveal(state);
    }, delay);
  };

  const markEntrySettled = (state: GalleryLoaderState, entry: GalleryEntry) => {
    if (entry.frame.classList.contains("is-media-settled")) return;

    if (entry.slowLoadTimer !== null) {
      window.clearTimeout(entry.slowLoadTimer);
      entry.slowLoadTimer = null;
    }
    entry.frame.classList.add("is-media-settled");

    if (entry.hasReleased) {
      entry.frame.classList.remove("is-slow-loading");
      if (!entry.frame.classList.contains("has-media-error")) {
        entry.frame.classList.add("is-revealed", "is-media-ready");
      }
      return;
    }

    schedulePlaceholderReveal(state);
    scheduleMediaReveal(state);
  };

  const startGalleryEntryMedia = (state: GalleryLoaderState, entry: GalleryEntry) => {
    if (entry.hasStartedMedia) return;
    if (entry.media instanceof HTMLVideoElement && !entry.isVisible) return;

    entry.hasStartedMedia = true;
    const media = entry.media;

    if (!media) {
      markEntrySettled(state, entry);
      return;
    }

    if (media instanceof HTMLImageElement) {
      const image = media;
      const source = image.dataset.src;

      if (!source) {
        markEntrySettled(state, entry);
        return;
      }

      image.addEventListener("load", () => markEntrySettled(state, entry), { once: true });
      image.addEventListener("error", () => {
        entry.frame.classList.add("has-media-error");
        markEntrySettled(state, entry);
      }, { once: true });
      const sourceSet = image.dataset.srcset;
      if (sourceSet) image.srcset = sourceSet;
      const sizes = image.dataset.sizes;
      if (sizes) image.sizes = sizes;
      image.src = source;
      image.removeAttribute("data-src");
      image.removeAttribute("data-srcset");
      image.removeAttribute("data-sizes");

      if (image.complete) {
        if (image.naturalWidth > 0) {
          markEntrySettled(state, entry);
        } else {
          entry.frame.classList.add("has-media-error");
          markEntrySettled(state, entry);
        }
      }
      return;
    }

    const video = media;
    const source = video.dataset.src;

    if (!source) {
      markEntrySettled(state, entry);
      return;
    }

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
    video.addEventListener("playing", () => setAutoplayBlockedState(video, false));
    video.addEventListener("loadeddata", () => {
      markEntrySettled(state, entry);
      observeVideoPlayback(video);
    }, { once: true });
    video.addEventListener("error", () => {
      entry.frame.classList.add("has-media-error");
      markEntrySettled(state, entry);
    }, { once: true });
    suppressNativeVideoControls(video);
    video.preload = "auto";
    video.src = source;
    video.removeAttribute("data-src");
    video.load();
  };

  const loadGalleryEntry = (state: GalleryLoaderState, entry: GalleryEntry) => {
    if (entry.media instanceof HTMLVideoElement) {
      const posterSource = entry.media.dataset.posterSrc;
      if (posterSource && !entry.media.poster) {
        entry.media.poster = posterSource;
        entry.media.removeAttribute("data-poster-src");
      }
    }

    if (entry.hasStarted) {
      startGalleryEntryMedia(state, entry);
      return;
    }
    entry.hasStarted = true;
    scheduleSlowLoadingFallback(state, entry);

    const startMediaAfterPlaceholder = () => {
      if (entry.media instanceof HTMLVideoElement && !entry.isVisible) return;
      startGalleryEntryMedia(state, entry);
    };
    const placeholder = entry.placeholder;

    if (placeholder) {
      const placeholderSource = placeholder.dataset.placeholderSrc;

      if (placeholderSource) {
        entry.hasPlaceholder = true;
        const markPlaceholderReady = () => {
          entry.placeholderReady = true;
          schedulePlaceholderReveal(state);
        };
        placeholder.addEventListener("load", () => {
          markPlaceholderReady();
          startMediaAfterPlaceholder();
        }, { once: true });
        placeholder.addEventListener("error", () => {
          placeholder.remove();
          entry.hasPlaceholder = false;
          startMediaAfterPlaceholder();
        }, { once: true });
        placeholder.src = placeholderSource;
        placeholder.removeAttribute("data-placeholder-src");

        if (placeholder.complete) {
          if (placeholder.naturalWidth > 0) {
            markPlaceholderReady();
            startMediaAfterPlaceholder();
          } else {
            placeholder.remove();
            entry.hasPlaceholder = false;
            startMediaAfterPlaceholder();
          }
        } else {
          window.setTimeout(startMediaAfterPlaceholder, 180);
        }
        return;
      }
    }

    startMediaAfterPlaceholder();
  };

  const getHorizontallyVisibleEntries = (gallery: HTMLElement, state: GalleryLoaderState) => {
    if (state.intersectingEntries.size > 0) {
      return Array.from(state.intersectingEntries).sort((a, b) => a.index - b.index);
    }

    const galleryRect = gallery.getBoundingClientRect();
    return state.entries.filter(({ frame }) => {
      const frameRect = frame.getBoundingClientRect();
      return frameRect.right > galleryRect.left && frameRect.left < galleryRect.right;
    });
  };

  const loadVisibleGalleryWindow = (gallery: HTMLElement, state: GalleryLoaderState) => {
    if (!state.galleryIsVisible || !isGalleryTabActive(gallery)) return;

    const visibleEntries = getHorizontallyVisibleEntries(gallery, state);
    if (visibleEntries.length === 0) return;

    const lastVisibleIndex = visibleEntries[visibleEntries.length - 1].index;
    state.entries.forEach((entry) => {
      entry.isVisible = state.intersectingEntries.has(entry);
    });
    const firstVisibleIndex = visibleEntries[0].index;
    const firstUnqueuedIndex = state.entries.findIndex(
      (entry) => !state.queuedEntries.has(entry),
    );
    const loadStartIndex = gallery.dataset.tabGallery === "photography" &&
      firstUnqueuedIndex >= 0 &&
      firstUnqueuedIndex < firstVisibleIndex
      ? firstUnqueuedIndex
      : firstVisibleIndex;
    const entriesToLoad = state.entries.slice(loadStartIndex, lastVisibleIndex + 3);
    entriesToLoad
      .filter((entry) => !state.queuedEntries.has(entry))
      .sort((a, b) => a.index - b.index)
      .forEach((entry) => {
        state.queuedEntries.add(entry);
        state.revealQueue.push(entry);
      });
    entriesToLoad.forEach((entry) => loadGalleryEntry(state, entry));
  };

  const initializeGalleryLoader = (gallery: HTMLElement) => {
    const existingState = galleryLoaders.get(gallery);
    if (existingState) return existingState;

    const entries = Array.from(gallery.querySelectorAll<HTMLElement>(".photo-frame")).map((frame, index) => ({
      frame,
      media: frame.querySelector<GalleryMedia>(".project-image, .project-video"),
      placeholder: frame.querySelector<HTMLImageElement>(".media-placeholder"),
      index,
      isVisible: false,
      hasStarted: false,
      hasStartedMedia: false,
      hasPlaceholder: false,
      placeholderReady: false,
      slowLoadElapsed: false,
      slowLoadTimer: null,
      hasReleased: false,
    }));

    const state: GalleryLoaderState = {
      entries,
      entriesByFrame: new Map(entries.map((entry) => [entry.frame, entry])),
      intersectingEntries: new Set(),
      galleryIsVisible: false,
      mediaObserver: null,
      revealQueue: [],
      queuedEntries: new Set(),
      nextPlaceholderIndex: 0,
      nextMediaIndex: 0,
      placeholderRevealTimer: null,
      mediaRevealTimer: null,
      lastPlaceholderRevealAt: 0,
      lastMediaRevealAt: 0,
    };
    galleryLoaders.set(gallery, state);

    if ("IntersectionObserver" in window) {
      state.mediaObserver = new IntersectionObserver(
        (observerEntries) => {
          observerEntries.forEach((observerEntry) => {
            const entry = state.entriesByFrame.get(observerEntry.target as HTMLElement);
            if (!entry) return;

            entry.isVisible = observerEntry.isIntersecting;
            if (observerEntry.isIntersecting) {
              state.intersectingEntries.add(entry);
            } else {
              state.intersectingEntries.delete(entry);
            }
          });

          loadVisibleGalleryWindow(gallery, state);
        },
        { root: gallery, threshold: 0.01 },
      );
      state.entries.forEach((entry) => state.mediaObserver?.observe(entry.frame));
    }

    return state;
  };

  let galleryObserver: IntersectionObserver | null = null;
  const pendingGalleryLoads = new Map<HTMLElement, number>();
  const intersectingGalleries = new Set<HTMLElement>();

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
    galleryLoaders.forEach((state) => {
      state.galleryIsVisible = false;
      state.entries.forEach((entry) => {
        entry.isVisible = false;
        entry.media instanceof HTMLVideoElement && entry.media.pause();
      });
    });
  };

  const scheduleGalleryLoad = (gallery: HTMLElement) => {
    if (pendingGalleryLoads.has(gallery)) return;

    const timer = window.setTimeout(() => {
      pendingGalleryLoads.delete(gallery);
      if (!intersectingGalleries.has(gallery)) return;

      const state = initializeGalleryLoader(gallery);
      state.galleryIsVisible = true;
      loadVisibleGalleryWindow(gallery, state);
    }, galleryLoadDelay);

    pendingGalleryLoads.set(gallery, timer);
  };

  if ("IntersectionObserver" in window) {
    galleryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const gallery = entry.target as HTMLElement;
          const loaderState = galleryLoaders.get(gallery);
          if (!isGalleryTabActive(gallery)) {
            intersectingGalleries.delete(gallery);
            cancelPendingGalleryLoad(gallery);
            if (loaderState) loaderState.galleryIsVisible = false;
            pauseGalleryVideos(gallery);
            return;
          }

          if (!entry.isIntersecting) {
            intersectingGalleries.delete(gallery);
            cancelPendingGalleryLoad(gallery);
            if (loaderState) loaderState.galleryIsVisible = false;
            pauseGalleryVideos(gallery);
            return;
          }

          intersectingGalleries.add(gallery);
          if (loaderState) {
            loaderState.galleryIsVisible = true;
            loadVisibleGalleryWindow(gallery, loaderState);
          }
          scheduleGalleryLoad(gallery);
        });
      },
      { threshold: 0.01 },
    );

    galleries.forEach((gallery) => galleryObserver?.observe(gallery));
  } else {
    setTimeout(() => {
      galleries
        .filter((gallery) => isGalleryTabActive(gallery))
        .forEach((gallery) => {
          intersectingGalleries.add(gallery);
          const state = initializeGalleryLoader(gallery);
          state.galleryIsVisible = true;
          loadVisibleGalleryWindow(gallery, state);
        });
    }, galleryLoadDelay);
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
    let expansionSyncTimer: number | null = null;
    let expansionScrollRatio: number | null = null;
    const galleryTrack = gallery.querySelector<HTMLElement>(".gallery-track");
    const getMaxScroll = () => Math.max(0, gallery.scrollWidth - gallery.clientWidth);

    const cancelMomentum = () => {
      if (momentumFrame === null) return;
      cancelAnimationFrame(momentumFrame);
      momentumFrame = null;
    };

    const syncExpandedScroll = () => {
      if (expansionScrollRatio === null) return;

      const maxScroll = getMaxScroll();
      const nextScrollLeft = maxScroll * expansionScrollRatio;

      if (Math.abs(gallery.scrollLeft - nextScrollLeft) > 0.5) {
        gallery.scrollLeft = nextScrollLeft;
      }
    };

    const cancelExpansionSync = () => {
      if (expansionSyncTimer !== null) {
        window.clearTimeout(expansionSyncTimer);
        expansionSyncTimer = null;
      }
      expansionScrollRatio = null;
    };

    if (galleryTrack && "ResizeObserver" in window) {
      // ResizeObserver runs after the gallery layout changes, avoiding a forced
      // read/write pair on every frame of the height transition.
      new ResizeObserver(syncExpandedScroll).observe(galleryTrack);
    }

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
        const maxScroll = getMaxScroll();
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
      const maxScroll = getMaxScroll();
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

      const initialMaxScroll = getMaxScroll();
      const scrollProgress = initialMaxScroll > 0 ? gallery.scrollLeft / initialMaxScroll : 0;
      const isExpanded = gallery.classList.toggle("is-expanded");
      gallery.setAttribute("aria-expanded", String(isExpanded));

      expansionScrollRatio = scrollProgress;
      requestAnimationFrame(syncExpandedScroll);
      expansionSyncTimer = window.setTimeout(() => {
        syncExpandedScroll();
        expansionScrollRatio = null;
        expansionSyncTimer = null;
      }, galleryExpansionDuration + 50);
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

    return {
      resetGalleryStates,
      cancelPendingGalleryLoads,
      syncLoadedVideoPlayback,
    };
};
