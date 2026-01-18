<script lang="ts">
  import {onMount} from "svelte";
  import {configStore, loadConfig} from "@/modules/configStore";

  // Images
  const downloadImg = new URL("../../assets/download.png", import.meta.url).href;
  const audioImg = new URL("../../assets/audio.png", import.meta.url).href;
  const captureImg = new URL("../../assets/capture.png", import.meta.url).href;

  // Audio Compressor Variables
  let audioCtx: AudioContext | null = null;
  let source: MediaElementAudioSourceNode | null = null;
  let compressor: DynamicsCompressorNode | null = null;
  let acActive = $state(false);

  // SOOP 자체 Toast 사용하기
  function toast(text: string) {
    const toast:HTMLElement = document.getElementById("toastMessage");
    const div = document.createElement("div");
    div.id = "INGDLC-TOAST";
    const p = document.createElement("p");
    p.innerHTML = text;
    div.appendChild(p);
    toast.appendChild(div);

    setTimeout(() => {
      toast.querySelector("#INGDLC-TOAST").remove();
    }, 2000);
  }

  // 방송 화면 캡쳐하기
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
        action: 'INGDLC_DOWNLOAD_FILE',
        payload: {url, filename}
      });

      console.log("Captured");

    } catch (error) {
      console.error("Capture failed:", error);
    }
  }

  function downloadFunc() {

  }

  // Audio Compressor 켜고 끄기
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

    if (!acActive) {
      source.disconnect(audioCtx.destination);
      source.connect(compressor);
      compressor.connect(audioCtx.destination);
      acActive = true;
      toast("볼륨 평준화가 켜졌습니다.");
    } else {
      source.disconnect(compressor);
      compressor.disconnect(audioCtx.destination);
      source.connect(audioCtx.destination);
      acActive = false;
      toast("볼륨 평준화가 꺼졌습니다.");
    }
  }

  // captureFunc() 첫 호출 시 경고문 띄우기
  function checkLaw() {
    if ($configStore.checkLawAlert.enabled) {
      if (confirm("설정한 화질대로 캡쳐됩니다. 최대화질로 설정 후 캡쳐해주세요.\n\n스트리머·저작권자의 동의 없이 녹화된 영상 및 캡쳐 이미지를 공유하는 경우, 그 책임은 전적으로 사용자에게 있습니다.\n\n이를 이해하고 동의하십니까?\n\n이 창은 최초 동의 후 나타나지 않습니다.")) {
        $configStore.checkLawAlert.enabled = 0;
        return true;
      } else return false;
    } else {
      return true;
    }
  }

  onMount(async () => {
    await loadConfig();
  });
</script>

{#if location.href.includes("catch")}

  {#if $configStore.download.enabled === 2}
    <button onclick={() => downloadFunc()} tip="클립 다운로드">
      클립 다운로드
      <img src="{downloadImg}" style="width: 24px;" alt="클립 다운로드">
    </button>
  {/if}

  {#if $configStore.audioComp.enabled === 2}
    <button onclick={() => audioFunc()} tip="음량 자동 조절">
      음량 자동 조절
      <img src="{audioImg}" style="width: 24px;" class={acActive ? "active-filter" : ""} alt="음량 자동 조절">
    </button>
  {/if}

  {#if $configStore.download.enabled === 2}
    <button onclick={async () => await captureFunc()} tip="화면 캡쳐">
      화면 캡쳐
      <img src="{captureImg}" style="width: 24px;" alt="화면 캡쳐">
    </button>
  {/if}

{:else}

  {#if $configStore.download.enabled === 2}
    <li id="INGDLC-DOWNLOAD-LI" style="display: flex; gap: 6px;">
      <button onclick={() => downloadFunc()} style="justify-content: center" tip="클립 다운로드">
        <img src="{downloadImg}" style="width: 24px;" alt="클립 다운로드">
      </button>
    </li>
  {/if}

  {#if $configStore.audioComp.enabled === 2}
    <li id="INGDLC-AUDIO-LI" style="display: flex; gap: 6px;">
      <button onclick={() => audioFunc()} style="justify-content: center" tip="음량 자동 조절">
        <img src="{audioImg}" style="width: 24px;" class={acActive ? "active-filter" : ""} alt="음량 자동 조절">
      </button>
    </li>
  {/if}

  {#if $configStore.download.enabled === 2}
    <li id="INGDLC-CAPTURE-LI" style="display: flex; gap: 6px;">
      <button onclick={async () => await captureFunc()} style="justify-content: center" tip="화면 캡쳐">
        <img src="{captureImg}" style="width: 24px;" alt="화면 캡쳐">
      </button>
    </li>
  {/if}

{/if}

<style>
  li {
    list-style: none;
    display: inline-block;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  img {
    width: 32px;
  }

  .active-filter {
    filter: opacity(0.5) drop-shadow(0 0 0 #7398ff) saturate(500%);
  }
</style>
