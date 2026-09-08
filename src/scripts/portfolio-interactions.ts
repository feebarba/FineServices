import { initializeBrandTypewriter } from "./brand-typewriter";
import { initializeDesignAccordions } from "./design-accordions";
import { initializeGallerySystem } from "./gallery-system";

initializeBrandTypewriter();

const portfolioShell = document.querySelector<HTMLElement>(".portfolio-shell");
const homePanel = document.querySelector<HTMLElement>("[data-home-panel]");
const homeToggle = document.querySelector<HTMLAnchorElement>("[data-home-toggle]");
const homeReturnArea = document.querySelector<HTMLElement>("[data-home-return-area]");
const designToggle = document.querySelector<HTMLAnchorElement>("[data-design-toggle]");
const designPanel = document.querySelector<HTMLElement>("[data-design-panel]");
const designContent = document.querySelector<HTMLElement>("[data-design-content]");
const photographyPanel = document.querySelector<HTMLElement>("[data-photography-panel]");
const photographyContent = document.querySelector<HTMLElement>("[data-photography-content]");
const photographyToggle = document.querySelector<HTMLAnchorElement>("[data-photography-toggle]");
const galleries = Array.from(document.querySelectorAll<HTMLElement>("[data-gallery-scroll]"));
const isGalleryTabActive = (gallery: HTMLElement) => {
  const panel = gallery.dataset.tabGallery === "design" ? designPanel : photographyPanel;
  return panel?.classList.contains("active") ?? false;
};
const { resetGalleryStates, cancelPendingGalleryLoads, syncLoadedVideoPlayback } = initializeGallerySystem(
  galleries,
  isGalleryTabActive,
);
const resetDesignAccordions = initializeDesignAccordions();

const syncTabBlur = (content: HTMLElement, panel: HTMLElement) => {
  panel.classList.toggle("has-scroll", content.scrollTop > 0);
};

const homeContent = homePanel?.querySelector<HTMLElement>(".home-content");
if (homeContent && homePanel) {
  const sync = () => syncTabBlur(homeContent, homePanel);
  homeContent.addEventListener("scroll", sync, { passive: true });
  sync();
}

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
const tabFromPath = (path: string): PortfolioTab => {
  const normalizedPath = path.replace(/\/+$/, "") || "/";
  if (normalizedPath === "/design") return "design";
  if (normalizedPath === "/photography") return "photography";
  return "home";
};
let activeTab: PortfolioTab = tabFromPath(window.location.pathname);
let tabTransitionTimer: number | null = null;
const resetTabState = (tab: PortfolioTab) => {
  if (tab === "design" || tab === "photography") {
    const content = tab === "design" ? designContent : photographyContent;
    content?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    resetGalleryStates
      .filter(({ tab: galleryTab }) => galleryTab === tab)
      .forEach(({ reset }) => reset());
    if (tab === "design") {
      resetDesignAccordions();
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

  if (tabTransitionTimer !== null) {
    window.clearTimeout(tabTransitionTimer);
    tabTransitionTimer = null;
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
  requestAnimationFrame(syncLoadedVideoPlayback);

  if (nextTab === "design" || nextTab === "photography") {
    const content = nextTab === "design" ? designContent : photographyContent;
    content?.scrollTo({ top: 0, behavior: "auto" });
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

const returnHome = (event: Event) => {
  event.preventDefault();
  setActiveTab("home");
};

homeToggle?.addEventListener("click", returnHome);
homeReturnArea?.addEventListener("click", returnHome);

designToggle?.addEventListener("click", (event) => {
  event.preventDefault();
  setActiveTab(activeTab === "design" ? "home" : "design");
});

photographyToggle?.addEventListener("click", (event) => {
  event.preventDefault();
  setActiveTab(activeTab === "photography" ? "design" : "photography");
});

window.addEventListener("popstate", () => {
  setActiveTab(tabFromPath(window.location.pathname), "none");
});
