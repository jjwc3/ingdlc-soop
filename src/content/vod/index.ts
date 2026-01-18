import { mount } from "svelte";
import App from "./App.svelte";

async function init() {
  let targetElement: Element | null;

  // 1. 현재 주소에 따라 기준이 될 요소(targetElement)를 찾음
  if (location.href.includes("catch")) {
    targetElement = await waitForElement(".share");
  } else {
    targetElement = await waitForElement(".subscribe");
  }

  // 2. 타겟 요소가 있고, 부모가 있으며, 아직 마운트되지 않았을 때만 실행
  // 중복 실행 방지를 위해 App 컴포넌트 내부에서 생성될 특정 속성(예: [data-ingdlc])을 체크합니다.
  if (targetElement && targetElement.parentElement && !document.querySelector("[data-ingdlc]")) {

    mount(App, {
      target: targetElement.parentElement, // 부모 요소를 컨테이너로 사용
      anchor: targetElement,               // 기준 요소(.share 등) 바로 앞에 삽입
    });
  }
}

function waitForElement(selector: string): Promise<Element | null> {
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
      subtree: true
    });

    // 10초 후 타임아웃
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, 10000);
  });
}

await init();