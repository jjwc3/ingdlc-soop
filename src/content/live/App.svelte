// 자동UP(+자정), 타임라인 복사

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

  let mujisungFunc = async () => {
    await chrome.runtime.sendMessage({action: "INGDLC_SIDE"});
  }

  async function captureFunc() {
    const video = document.querySelector('video');
    if (!video) {
      console.error("비디오 요소를 찾을 수 없습니다.");
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

  let audioFunc = async () => {
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
      console.log("Compressor ON");
    } else {
      source.disconnect(compressor);
      compressor.disconnect(audioCtx.destination);
      source.connect(audioCtx.destination);
      acActive = false;
      console.log("Compressor OFF");
    }
  };

  const checkLaw = () => {
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
    if (['a', 'å'].includes(e.key) && [1, 2].includes($configStore.audioComp.enabled)) await audioFunc();
  }

  onMount(async () => {
    await loadConfig();
    const events = ['cut', 'copy', 'paste'];
    const preventStop = (e: Event) => e.stopPropagation();

    events.forEach(evt => document.addEventListener(evt, preventStop, true));
    window.addEventListener('keydown', handleKeydown);

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