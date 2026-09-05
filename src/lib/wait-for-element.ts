/**
 * Resolves once a matching element exists, or null after the timeout.
 *
 * Both content entry points mount against a host element the page renders
 * asynchronously, so polling is replaced by one MutationObserver per call.
 */
export function waitForElement(
  selector: string,
  timeoutMs = 10_000,
): Promise<Element | null> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const target = document.querySelector(selector);
      if (target) {
        observer.disconnect();
        resolve(target);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutMs);
  });
}
