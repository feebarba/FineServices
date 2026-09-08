export const initializeDesignAccordions = () => {
  const designAccordionResetters: Array<() => void> = [];
  const designAccordionLayoutSyncers: Array<(isMobile: boolean) => void> = [];
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
      designMeta.style.removeProperty("--mobile-info-top");
      designMeta.style.removeProperty("--mobile-info-content-left");
      accordion.style.removeProperty("--mobile-info-height");
      accordion.style.removeProperty("max-height");
      panel.style.removeProperty("max-height");
      mobileMetaBaseHeight = null;
    };

    const syncMobileInfoHeight = (panelHeight: number) => {
      if (
        !isMobileInfoAccordion ||
        !designMeta ||
        !isMobileLayout() ||
        !accordion.classList.contains("is-open")
      ) return;

      const baseHeight = mobileMetaBaseHeight ?? designMeta.getBoundingClientRect().height;
      designMeta.style.setProperty("--mobile-info-top", `${baseHeight}px`);
      accordion.style.setProperty("--mobile-info-height", `${panelHeight}px`);
      designMeta.style.height = `${panelHeight}px`;
    };

    const syncMobileInfoContentInset = () => {
      if (!isMobileInfoAccordion || !designMeta || !isMobileLayout()) return;

      const projectTitle = designMeta.querySelector<HTMLElement>(".project-title");
      if (!projectTitle) return;

      const metaRect = designMeta.getBoundingClientRect();
      const titleRect = projectTitle.getBoundingClientRect();
      const contentInset = Math.max(0, titleRect.left - metaRect.left);
      designMeta.style.setProperty("--mobile-info-content-left", `${contentInset}px`);
    };

    const getMobilePanelHeight = () => {
      const previousMaxHeight = panel.style.maxHeight;
      panel.style.maxHeight = "none";
      const naturalHeight = panel.scrollHeight;
      panel.style.maxHeight = previousMaxHeight;
      return naturalHeight;
    };

    const getNaturalHeight = () => {
      const previousMaxHeight = accordion.style.maxHeight;
      accordion.style.maxHeight = "none";
      const naturalHeight = accordion.getBoundingClientRect().height;
      accordion.style.maxHeight = previousMaxHeight;
      return naturalHeight;
    };

    const setExpanded = (expanded: boolean) => {
      const isMobileInfo = isMobileInfoAccordion && designMeta && isMobileLayout();

      if (isMobileInfo) {
        if (mobileMetaCleanupTimer !== null) {
          window.clearTimeout(mobileMetaCleanupTimer);
          mobileMetaCleanupTimer = null;
        }

        if (expanded) {
          const metaRect = designMeta.getBoundingClientRect();
          mobileMetaBaseHeight ??= metaRect.height;
          syncMobileInfoContentInset();
          designMeta.style.setProperty("--mobile-info-top", `${mobileMetaBaseHeight}px`);
          designMeta.style.height = `${mobileMetaBaseHeight}px`;
        }
      }

      if (isMobileInfo) {
        accordion.classList.toggle("is-open", expanded);
        toggle.setAttribute("aria-expanded", String(expanded));
        panel.setAttribute("aria-hidden", String(!expanded));
        arrow.src = expanded
          ? arrow.dataset.openSrc ?? arrow.src
          : arrow.dataset.closedSrc ?? arrow.src;

        if (expanded) {
          panel.style.maxHeight = "0px";
          void panel.offsetHeight;
          const targetPanelHeight = getMobilePanelHeight();
          accordion.style.setProperty("--mobile-info-height", `${targetPanelHeight}px`);
          panel.style.maxHeight = `${targetPanelHeight}px`;
          syncMobileInfoHeight(targetPanelHeight);
        } else {
          panel.style.maxHeight = "0px";
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

        return;
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

      if (isMobileInfoAccordion && designMeta && isMobileLayout()) {
        syncMobileInfoContentInset();
        const naturalPanelHeight = getMobilePanelHeight();
        panel.style.maxHeight = `${naturalPanelHeight}px`;
        syncMobileInfoHeight(naturalPanelHeight);
        return;
      }

      const naturalHeight = getNaturalHeight();
      accordion.style.maxHeight = `${naturalHeight}px`;
      syncMobileInfoHeight(naturalHeight);
    };

    if (isMobileInfoAccordion && designMeta) {
      designAccordionLayoutSyncers.push((isMobile) => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";

        if (isMobile) {
          clearMobileInfoLayout();
          if (isOpen) setExpanded(true);
          return;
        }

        clearMobileInfoLayout();
        if (!isOpen) return;

        accordion.style.removeProperty("max-height");
        const naturalHeight = getNaturalHeight();
        accordion.style.maxHeight = `${naturalHeight}px`;
      });
    }

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(updateExpandedHeight);
      resizeObserver.observe(panel);
    }

    toggle.addEventListener("click", () => {
      setExpanded(toggle.getAttribute("aria-expanded") !== "true");
    });

    designAccordionResetters.push(() => setExpanded(false));
  });

  let isMobileDesignLayout = window.matchMedia("(max-width: 743px)").matches;
  window.addEventListener("resize", () => {
    const nextIsMobileDesignLayout = window.matchMedia("(max-width: 743px)").matches;
    if (nextIsMobileDesignLayout === isMobileDesignLayout) return;

    isMobileDesignLayout = nextIsMobileDesignLayout;
    designAccordionLayoutSyncers.forEach((syncLayout) => syncLayout(isMobileDesignLayout));
  });

    return () => designAccordionResetters.forEach((reset) => reset());
};
