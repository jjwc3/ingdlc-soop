<script lang="ts">
  import { onMount } from 'svelte';

  import { configStore, loadConfig } from '@/modules/configStore';

  // Images
  const mujisungImg = new URL('../../assets/mujisung.png', import.meta.url)
    .href;
  const captureImg = new URL('../../assets/capture.png', import.meta.url).href;
  const audioImg = new URL('../../assets/audio.png', import.meta.url).href;

  // Audio Compressor Variables
  let audioCtx: AudioContext | null = null;
  let source: MediaElementAudioSourceNode | null = null;
  let compressor: DynamicsCompressorNode | null = null;
  let acActive = $state(false);
  let onInterval = false;

  // SOOP 자체 Toast 사용하기
  function toast(text: string) {
    const toast = document.getElementById('toastMessage');
    toast.querySelector('.success').querySelector('p').innerHTML = text;
    toast.style.display = 'flex';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2000);
  }

  // 도배 버튼 눌렀을 때 Side Panel 열기
  async function mujisungFunc() {
    await chrome.runtime.sendMessage({ action: 'INGDLC_SIDE' });
  }

  // 방송 화면 캡쳐하기
  async function captureFunc() {
    const video = document.querySelector('video');
    if (!video) {
      console.error('No Video');
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
        payload: { url, filename },
      });

      console.log('Captured');
    } catch (error) {
      console.error('Capture failed:', error);
    }
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
      toast('볼륨 평준화가 켜졌습니다.');
    } else {
      source.disconnect(compressor);
      compressor.disconnect(audioCtx.destination);
      source.connect(audioCtx.destination);
      acActive = false;
      toast('볼륨 평준화가 꺼졌습니다.');
    }
  }

  // captureFunc() 첫 호출 시 경고문 띄우기
  function checkLaw() {
    if ($configStore.checkLawAlert.enabled) {
      if (
        confirm(
          '설정한 화질대로 캡쳐됩니다. 최대화질로 설정 후 캡쳐해주세요.\n\n스트리머·저작권자의 동의 없이 녹화된 영상 및 캡쳐 이미지를 공유하는 경우, 그 책임은 전적으로 사용자에게 있습니다.\n\n이를 이해하고 동의하십니까?\n\n이 창은 최초 동의 후 나타나지 않습니다.',
        )
      ) {
        $configStore.checkLawAlert.enabled = 0;
        return true;
      } else return false;
    } else {
      return true;
    }
  }

  // 단축키 정의
  async function handleKeydown(e: KeyboardEvent) {
    if (!e.altKey) return;
    if (
      ['m', 'µ'].includes(e.key) &&
      [1, 2].includes($configStore.mujisung.enabled)
    )
      await mujisungFunc();
    if (
      ['c', 'ç'].includes(e.key) &&
      [1, 2].includes($configStore.capture.enabled)
    )
      await captureFunc();
    if (
      ['a', 'å'].includes(e.key) &&
      [1, 2].includes($configStore.audioComp.enabled)
    )
      audioFunc();
  }

  // 자동 UP, 자정 지나면 자동 UP
  function likeClick() {
    let streamerId = document
      .querySelector('#streamerNick')
      .getAttribute('data-bj_id');

    if (
      $configStore.autoUp.custom.includes(streamerId) &&
      !document.querySelector('.btn-login')
    ) {
      const date = new Date();
      const time =
        date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();

      let interval = setInterval(() => {
        let button = document.querySelector('#like') as HTMLButtonElement;
        if (
          document.querySelector('.depend_item').style.display !== 'none' &&
          !button.classList.contains('on')
        ) {
          clearInterval(interval);
          button.click();
        }
      }, 1000);
      setTimeout(interval, (86400 - time) * 1000 + 2000);
    }
  }

  // 타임라인 클릭 시 복사
  function timelineCopy() {
    let interval = setInterval(() => {
      let timelineList = document.querySelectorAll('#time');
      if (timelineList.length !== 0) {
        clearInterval(interval);
        timelineList.forEach((e) => {
          e.parentElement.addEventListener('click', () => {
            navigator.clipboard.writeText(e.innerHTML);
            toast('복사되었습니다.');
          });
          e.parentElement.style.cursor = 'pointer';
        });
      }
    }, 1000);
  }

  // 차단 관면 Variables
  let blockSet = new Set<string>();
  let currentBlockGrade = 0;

  // blockUser<String[]> --> Set<string>
  configStore.subscribe(($config) => {
    if (Array.isArray($config.blockUser?.list)) {
      blockSet = new Set(
        $config.blockUser.list.map((name) => name.trim()).filter(Boolean),
      );
    }
    currentBlockGrade = Number($config.blockGrade?.enabled || 0);
  });

  // 채팅에서 도배 가져오기
  function mujisungFromChat(message: string) {
    const mujisungRegex = /^(.+?)(?:\s?\1)+$/;
    const emojiRegex = /\p{Emoji_Presentation}/gu;

    const mujisungMatch = message.match(mujisungRegex);
    if (mujisungMatch) {
      const mujisungUnit = mujisungMatch[1].trim();
      if (
        emojiRegex.test(mujisungUnit) &&
        !$configStore.mujisung.exception.includes(mujisungUnit) &&
        !$configStore.mujisung.fromChat.includes(mujisungUnit)
      ) {
        configStore.update((current) => ({
          ...current,
          mujisung: {
            ...current.mujisung,
            fromChat: [...current.mujisung.fromChat, mujisungUnit],
          },
        }));
      }
    }
  }

  // 채팅 숨기기 관리 함수
  function processNode(node: Node) {
    if (!(node instanceof HTMLElement)) return;
    if (node.dataset.ingdlcProcessed) return;
    const chatItem = node.className === 'chatting-list-item' ? node : none;
    if (!chatItem) return;
    node.dataset.ingdlcProcessed = 'true';

    if (chatItem instanceof HTMLElement) {
      // const userElement = chatItem.querySelector(".username").firstElementChild;
      const userElement = chatItem.querySelector('button');
      if (userElement instanceof HTMLElement) {
        const userNick = userElement.getAttribute('user_nick') || '';
        const userGrade = userElement.getAttribute('grade') || '';

        const isUserBlocked = blockSet.has(userNick);
        const isGradeBlocked =
          (currentBlockGrade >= 1 && userGrade === 'user') ||
          (currentBlockGrade >= 2 && userGrade === 'fan');

        if (isUserBlocked || isGradeBlocked) {
          chatItem.style.display = 'none';
        } else if (node.querySelector('.msg')) {
          mujisungFromChat(node.querySelector('.msg').innerHTML);
        }
      }
    }
  }

  // 버튼으로 유저 차단하기
  function addBlock(node) {
    const nick = node.getAttribute('user_nick');

    const blockUl = document.createElement('ul');
    blockUl.className = 'menu-list';
    const blockLi = document.createElement('li');
    blockLi.className = '';
    const blockButton = document.createElement('button');
    blockButton.type = 'button';
    blockButton.id = 'ingdlc-blockUser';
    blockButton.innerHTML = '유저 차단하기';
    blockButton.addEventListener('click', () => {
      configStore.update((current) => {
        if (current.blockUser.list.includes(nick)) {
          toast('이미 차단된 유저입니다.');
          return current;
        }
        toast(`"${nick}"을 차단하였습니다.`);
        return {
          ...current,
          blockUser: {
            ...current.blockUser,
            list: [...current.blockUser.list, nick],
          },
        };
      });
      node.remove();
    });
    blockLi.appendChild(blockButton);
    blockUl.appendChild(blockLi);

    node.querySelector('.btn-close').before(blockUl);
  }

  // 현재 방송 중인지 확인하고, 방송 중이 아니라면 방송 시작 시 새로고침하기
  async function reloadWhenLive() {
    if ($configStore.reload.enabled === 1 && !onInterval) {
      const userId = document.getElementById('streamerNick').dataset.bj_id;
      const url = `https://chapi.sooplive.com/api/${userId}/station`;
      const res = await (await fetch(url)).json();
      if (res.broad === null) {
        onInterval = true;
        toast('방송이 시작되면 새로고침합니다.');
        setInterval(async () => {
          const response = await (await fetch(url)).json();
          if (response.broad) {
            window.location.reload();
          }
        }, 3000);
      }
    }
  }

  // 방송이 끝나면 reloadWhenLive 실행하기
  async function onBroadEnd() {
    setTimeout(() => {
      const video = document.querySelector('video');

      video.addEventListener('timeupdate', async () => {
        if (video.currentTime === 0) await reloadWhenLive();
      });
    }, 1000);
  }

  // 영상 광고 자동 SKIP
  function skipAd() {
    let intervalCount = 0;
    setTimeout(() => {
      const interval = setInterval(() => {
        try {
          const adVideo: HTMLVideoElement = document.querySelector('#da_video');
          const button: HTMLButtonElement =
            document.querySelector('#da_btn_skip');
          if (
            adVideo &&
            button.style.display !== 'none' &&
            intervalCount <= 30
          ) {
            button.click();
            intervalCount += 1;
          } else {
            clearInterval(interval);
          }
        } catch (e) {
          console.log(e);
        }
      }, 500);
    }, 5000);
  }

  // async function recordVideo(seconds = 5) {
  //   const video = document.querySelector('video');
  //   if (!video) {
  //     console.error("비디오 요소를 찾을 수 없습니다.");
  //     return;
  //   }
  //
  //   // 1. 비디오 요소로부터 스트림 추출
  //   // captureStream()은 해당 요소의 현재 재생 내용을 캡처합니다.
  //   const stream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
  //
  //   // 2. MediaRecorder 설정 (코덱은 브라우저 지원에 따라 설정)
  //   const recorder = new MediaRecorder(stream, {
  //     mimeType: 'video/webm; codecs=vp9'
  //   });
  //
  //   const chunks = [];
  //   recorder.ondataavailable = (e) => {
  //     if (e.data.size > 0) chunks.push(e.data);
  //   };
  //
  //   // 3. 녹화 종료 시 다운로드 로직
  //   recorder.onstop = () => {
  //     const blob = new Blob(chunks, { type: 'video/webm' });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = `recorded_video_${new Date().getTime()}.webm`;
  //     a.click();
  //     URL.revokeObjectURL(url);
  //     console.log("녹화 완료 및 다운로드 시작");
  //   };
  //
  //   // 4. 녹화 시작
  //   recorder.start();
  //   console.log(`${seconds}초간 녹화를 시작합니다...`);
  //
  //   // 5. 지정된 시간(5초) 후 중지
  //   setTimeout(() => {
  //     recorder.stop();
  //   }, seconds * 1000);
  // }

  onMount(async () => {
    // 복붙 금지 해제
    await loadConfig();
    const events = ['cut', 'copy', 'paste'];
    const preventStop = (e: Event) => e.stopPropagation();
    events.forEach((evt) => document.addEventListener(evt, preventStop, true));
    window.addEventListener('keydown', handleKeydown);

    likeClick();
    timelineCopy();
    await reloadWhenLive();
    await onBroadEnd();
    skipAd();

    // setTimeout(recordVideo, 5000)

    // 채팅 차단 MutationObserver
    const chatListObserver = new MutationObserver((mutations) => {
      mutations.forEach((m) => m.addedNodes.forEach(processNode));
    });
    chatListObserver.observe(document.getElementById('chat_area'), {
      childList: true,
      subtree: true,
    });

    // 채팅 차단 버튼 생성 MutationObserver
    const contextMenuObserver = new MutationObserver((mutations) => {
      mutations.forEach((m) =>
        m.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.id === 'contextChatMenu') {
            addBlock(node);
          }
        }),
      );
    });
    contextMenuObserver.observe(document.getElementById('chatbox'), {
      childList: true,
      subtree: false,
    });

    return () => {
      events.forEach((evt) =>
        document.removeEventListener(evt, preventStop, true),
      );
      window.removeEventListener('keydown', handleKeydown);
      chatListObserver.disconnect();
      contextMenuObserver.disconnect();
      configStore.update((current) => ({
        ...current,
        mujisung: {
          ...current.mujisung,
          fromChat: [],
        },
      }));
    };
  });
</script>

{#if $configStore.mujisung.enabled === 2}
  <li id="INGDLC-MUJISUNG-LI">
    <button onclick={() => mujisungFunc()}>
      <img src={mujisungImg} alt="도배 도우미 열기" />
    </button>
  </li>
{/if}

{#if $configStore.capture.enabled === 2}
  <li id="INGDLC-CAPTURE-LI">
    <button onclick={() => captureFunc()}>
      <img src={captureImg} alt="화면 캡쳐" />
    </button>
  </li>
{/if}

{#if $configStore.audioComp.enabled === 2}
  <li id="INGDLC-COMP-LI">
    <button onclick={() => audioFunc()}>
      <img
        src={audioImg}
        alt="음량 자동 조절"
        class={acActive ? 'active-filter' : ''}
      />
    </button>
  </li>
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
