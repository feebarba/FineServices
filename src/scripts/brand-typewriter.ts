export const initializeBrandTypewriter = () => {
  const brandTypewriter = document.querySelector<HTMLElement>("[data-brand-typewriter]");

  if (brandTypewriter && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const primaryText = brandTypewriter.dataset.primaryBrand?.trim() || "Felipe Barbosa";
    const secondaryText = brandTypewriter.dataset.secondaryBrand?.trim() || "Fine Services";
    const holdDuration = 10000;
    const eraseDelay = 60;
    const typeDelay = 84;
    let nextText = secondaryText;

    const typeText = (text: string, index = 0) => {
      if (index >= text.length) {
        window.setTimeout(() => animateTo(nextText), holdDuration);
        return;
      }

      brandTypewriter.textContent = text.slice(0, index + 1);
      window.setTimeout(() => typeText(text, index + 1), typeDelay);
    };

    const eraseText = (onComplete: () => void) => {
      const currentText = brandTypewriter.textContent ?? "";

      if (!currentText) {
        onComplete();
        return;
      }

      brandTypewriter.textContent = currentText.slice(0, -1);
      window.setTimeout(() => eraseText(onComplete), eraseDelay);
    };

    const animateTo = (text: string) => {
      eraseText(() => typeText(text));
      nextText = text === primaryText ? secondaryText : primaryText;
    };

    window.setTimeout(() => animateTo(secondaryText), holdDuration);
  }
};
