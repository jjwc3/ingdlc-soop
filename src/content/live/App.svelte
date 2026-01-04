<script lang="ts">
  import {onMount} from "svelte";
  import {configStore, loadConfig} from "@/modules/configStore";

  const mujisungImg = new URL("../../assets/mujisung.png", import.meta.url).href;
  const captureImg = new URL("../../assets/capture.png", import.meta.url).href;
  const audioImg = new URL("../../assets/audio.png", import.meta.url).href;

  let audioCtx: AudioContext | null = null;
  let source: MediaElementAudioSourceNode | null = null;
  let compressor: DynamicsCompressorNode | null = null;
  let acActive = $state(false);

  async function mujisungFunc() {
    await chrome.runtime.sendMessage({action: "INGDLC_SIDE"});
  }

  async function captureFunc() {
    const video = document.querySelector('video');
    if (!video) {
      console.error("No Video");
      return;
    }

    if (!checkLaw()) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const url = canvas.toDataURL('image/png');

      const filename = `[INGDLC] Capture_${new Date().getTime()}.png`;

      await chrome.runtime.sendMessage({
        action: 'DOWNLOAD_FILE',
        payload: { url, filename }
      });

      $configStore.checkLawAlert.enabled = 0;

      console.log("Captured");

    } catch (error) {
      console.error("Capture failed:", error);
    }
  }

  function audioFunc() {
    const video = document.querySelector('video');
    if (!video) return;

    if (!audioCtx) {
      audioCtx = new AudioContext();
      source = audioCtx.createMediaElementSource(video);
      compressor = audioCtx.createDynamicsCompressor();

      compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
      compressor.knee.setValueAtTime(40, audioCtx.currentTime);
      compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
      compressor.attack.setValueAtTime(0, audioCtx.currentTime);
      compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

      source.connect(audioCtx.destination);
    }

    const toast = document.getElementById("toastMessage");

    if (!acActive) {
      source.disconnect(audioCtx.destination);
      source.connect(compressor);
      compressor.connect(audioCtx.destination);
      acActive = true;
      console.log("Compressor ON");
      toast.querySelector(".success").querySelector('p').innerHTML = "볼륨 평준화가 켜졌습니다.";
      toast.style.display = "flex";
      setTimeout(() => {
        toast.style.display = "none";
      }, 2000);
    } else {
      source.disconnect(compressor);
      compressor.disconnect(audioCtx.destination);
      source.connect(audioCtx.destination);
      acActive = false;
      console.log("Compressor OFF");
      toast.querySelector(".success").querySelector('p').innerHTML = "볼륨 평준화가 꺼졌습니다.";
      toast.style.display = "flex";
      setTimeout(() => {
        toast.style.display = "none";
      }, 2000);
    }
  }

  function checkLaw() {
    if ($configStore.checkLawAlert.enabled) {
      return confirm("설정한 화질대로 캡쳐됩니다. 최대화질로 설정 후 캡쳐해주세요.\n\n스트리머·저작권자의 동의 없이 녹화된 영상 및 캡쳐 이미지를 공유하는 경우, 그 책임은 전적으로 사용자에게 있습니다.\n\n이를 이해하고 동의하십니까?\n\n이 창은 최초 동의 후 나타나지 않습니다.");
    } else {
      return true;
    }
  }

  async function handleKeydown(e: KeyboardEvent) {
    if (!e.altKey) return;
    if (['m', 'µ'].includes(e.key) && [1, 2].includes($configStore.mujisung.enabled)) await mujisungFunc();
    if (['c', 'ç'].includes(e.key) && [1, 2].includes($configStore.capture.enabled)) await captureFunc();
    if (['a', 'å'].includes(e.key) && [1, 2].includes($configStore.audioComp.enabled)) audioFunc();
  }

  function likeClick() {
    let streamerId = document.querySelector("#streamerNick").getAttribute("data-bj_id");

    if ($configStore.autoUp.custom.includes(streamerId) && !document.querySelector(".btn-login")) {
      const date = new Date();
      const time = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();

      let interval = setInterval(() => {
        let button = document.querySelector("#like") as HTMLButtonElement;
        if (document.querySelector(".depend_item").style.display !== "none" && !button.classList.contains("on")) {
          clearInterval(interval);
          button.click();
        }
      }, 1000)
      setTimeout(interval(), (86400-time)*1000+2000);
    }
  }

  function timelineCopy() {
    let interval = setInterval(() => {
      let timelineList = document.querySelectorAll("#time");
      if (timelineList.length !== 0) {
        clearInterval(interval);
        timelineList.forEach((e) => {
          e.parentElement.addEventListener("click", () => {
            navigator.clipboard.writeText(e.innerHTML);
            const toast = document.getElementById("toastMessage");
            toast.querySelector(".success").querySelector('p').innerHTML = "복사되었습니다.";
            toast.style.display = "flex";
            setTimeout(() => {
              toast.style.display = "none";
            }, 2000);
          })
          e.parentElement.style.cursor = "pointer";
        })
      }
    }, 1000);
  }

  onMount(async () => {
    await loadConfig();
    const events = ['cut', 'copy', 'paste'];
    const preventStop = (e: Event) => e.stopPropagation();

    events.forEach(evt => document.addEventListener(evt, preventStop, true));
    window.addEventListener('keydown', handleKeydown);

    likeClick();
    timelineCopy();

    return () => {
      events.forEach(evt => document.removeEventListener(evt, preventStop, true));
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

{#if $configStore.mujisung.enabled === 2}
  <li id="INGDLC-MUJISUNG-LI">
    <button onclick={() => mujisungFunc()}>
      <img src={mujisungImg} alt="도배 도우미 열기"/>
    </button>
  </li>
{/if}

{#if $configStore.capture.enabled === 2}
  <li id="INGDLC-CAPTURE-LI">
    <button onclick={() => captureFunc()}>
      <img src={captureImg} alt="화면 캡쳐"/>
    </button>
  </li>
{/if}

{#if $configStore.audioComp.enabled === 2}
  <li id="INGDLC-COMP-LI">
    <button onclick={() => audioFunc()}>
      <img src={audioImg} alt="음량 자동 조절" class={acActive ? "active-filter" : ""}/>
    </button>
  </li>
{/if}

<style>
  li { list-style: none; display: inline-block; }
  button { background: none; border: none; cursor: pointer; padding: 0; }
  img { width: 32px; }
  .active-filter {
    filter: opacity(0.5) drop-shadow(0 0 0 #7398ff) saturate(500%);
  }
</style>