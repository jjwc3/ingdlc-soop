<script lang="ts">
  import { onMount } from 'svelte';

  import { getChoseong } from 'es-hangul';

  import InputAndAdd from '@/components/InputAndAdd.svelte';
  import Modal from '@/components/Modal.svelte';
  import { configStore, loadConfig, resetConfig } from '@/modules/configStore';

  let searchFocused = $state(false);

  let showResetModal = $state(false);

  let showErrorModal = $state(false);

  let mujisungQuery = $state('');

  let m3u8Url = $state('');

  async function performReset() {
    try {
      await resetConfig();
      await mujisungUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      showResetModal = false;
    }
  }

  function openResetModal(e: Event) {
    e.stopPropagation();
    showResetModal = true;
  }

  async function mujisungUpdate() {
    let fetchList = await (
      await fetch('https://jjwc3.github.io/ingdlc-new-mlist/list.json')
    ).json();
    const typeList = ['댄스', '틱톡 or 노래', '기타'];

    let tempMujisung = [];
    for (let type of typeList) {
      let songObject = fetchList[type];
      Object.keys(songObject).forEach((song) => {
        let textList = songObject[song];
        textList.forEach((text) => {
          let structure = [type, song, text];
          tempMujisung.push(structure);
        });
      });
    }

    configStore.update((current) => ({
      ...current,
      mujisung: {
        ...current.mujisung,
        list: tempMujisung,
      },
    }));
  }

  let mujisungFiltered = $derived.by(() => {
    const fromChat = $configStore.mujisung.fromChat.slice(-3);
    const mappedFromChat = fromChat.map((i) => ['자동', '자동', i]);
    const list = $configStore.mujisung.list;
    const custom = $configStore.mujisung.custom;
    const mappedCustom = custom.map((i) => ['커스텀', '커스텀', i]);
    const final = [...mappedFromChat, ...mappedCustom, ...list];
    let query = mujisungQuery.trim().toLowerCase();
    if (!query) return final;

    return final.filter((item) => {
      const joined = item.join(' ').toLowerCase();
      return joined.includes(query) || getChoseong(joined).includes(query);
    });
  });

  let inputRef: HTMLInputElement | undefined = $state();

  async function mujisungCopy(text: string) {
    try {
      if (text.trim().length > 128) {
        console.error('Text length should be 128 or less.');
        showErrorModal = true;
        return;
      }
      const temp = text.trim().concat(' ');
      const mujisungText = temp.repeat(128 / temp.length);

      await navigator.clipboard.writeText(mujisungText.trim());
      searchFocused = false;
      if (inputRef) {
        inputRef.blur();
      }

      window.close();
    } catch (e) {
      console.error(e);
    }
  }

  async function parseM3U8(
    m3u8Text: string,
    currentUrl: string,
  ): Promise<string[]> {
    const lines = m3u8Text.split('\n').map((l) => l.trim());

    if (m3u8Text.includes('#EXT-X-STREAM-INF')) {
      let subM3u8Url: string | null = null;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i] && !lines[i].startsWith('#')) {
          subM3u8Url = lines[i].startsWith('http')
            ? lines[i]
            : new URL(lines[i], currentUrl).href;
          break;
        }
      }
      if (!subM3u8Url) throw new Error();
      const res = await fetch(subM3u8Url);
      return parseM3U8(await res.text(), subM3u8Url);
    }

    const mediaUrls: string[] = [];
    let initUrl: string | null = null;
    for (let line of lines) {
      if (!line) continue;
      if (line.startsWith('#EXT-X-MAP')) {
        const match = line.match(/URI=["']([^"']+)["']/);
        if (match && match[1])
          initUrl = match[1].startsWith('http')
            ? match[1]
            : new URL(match[1], currentUrl).href;
      }
      if (!line.startsWith('#')) {
        mediaUrls.push(
          line.startsWith('http') ? line : new URL(line, currentUrl).href,
        );
      }
    }
    if (initUrl) mediaUrls.unshift(initUrl);
    return mediaUrls;
  }

  async function startDownload() {
    if (!m3u8Url.trim()) return;
    document.querySelector('#download-btn').innerHTML = '다운로드중...';

    try {
      const response = await fetch(m3u8Url);
      const mediaUrls = await parseM3U8(await response.text(), m3u8Url);
      const chunkBuffers: ArrayBuffer[] = [];

      for (const url of mediaUrls) {
        const chunkResponse = await fetch(url, { credentials: 'include' });
        chunkBuffers.push(await chunkResponse.arrayBuffer());
      }

      const finalBlob = new Blob(chunkBuffers, { type: 'video/mp4' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(finalBlob);
      downloadLink.download = `m3u8_download_${Date.now()}.mp4`;
      downloadLink.click();
    } catch (error) {
      console.error(error);
      document.querySelector('#download-btn').innerHTML = '오류 발생';
    } finally {
      document.querySelector('#download-btn').innerHTML = '다운로드 완료';
    }
  }

  onMount(async () => {
    await loadConfig();
    await mujisungUpdate();
    chrome.runtime.sendMessage({ action: 'INGDLC_SIDE_DL_REQ' }, (response) => {
      if (response && response.url) {
        m3u8Url = response.url;
        document.querySelector('#download-btn').style.display = 'flex';
      }
    });
  });
</script>

<div class="h-screen bg-slate-50 px-2 py-4 text-slate-900">
  <header>
    <h1 class="mt-3 mb-1 text-center text-2xl font-bold">INGDLC for SOOP</h1>

    <div class="text-center text-xs text-slate-500">
      Ver.<span>{chrome.runtime.getManifest().version}</span>
    </div>
    <div class="absolute top-2 right-2">
      <a
        href="index.html"
        target="_blank"
        class="text-xs text-slate-400 transition-all duration-300 ease-in-out hover:cursor-pointer hover:font-bold hover:text-slate-600"
        >새 창에서 열기</a
      >
    </div>
  </header>
  <div
    class="m-4 flex justify-center rounded-sm bg-red-300 p-2 text-xl font-bold"
    id="download-btn"
    style="display: none;"
  >
    <button type="button" onclick={startDownload}>다운로드</button>
  </div>

  <div class="flex flex-col">
    <div
      class="bg-opacity-70 hover:bg-opacity-100 m-4 rounded-md border border-slate-100 bg-white px-3 py-4 shadow-xl transition-all duration-500 ease-in-out hover:shadow-2xl"
    >
      <h2
        class="mb-3 border-b border-dashed border-slate-300 pb-3 text-center text-xl font-semibold"
      >
        SOOP 도배도우미
      </h2>

      <div class="relative mb-4 last:mb-0">
        <div class="mb-1.5 flex flex-row items-center">
          <span class="flex items-center text-sm font-semibold"
            ># 도배 검색</span
          >
          <span class="ml-2 text-xs font-bold text-slate-500"
            >선택하여 복사</span
          >
        </div>

        <div
          class="relative flex w-full items-center overflow-hidden rounded-lg bg-slate-200 p-1 transition-all focus-within:ring-2 focus-within:ring-blue-400"
        >
          <div class="pl-2 text-slate-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="곡명/도배 텍스트를 입력해 검색 ex) 돌핀 or 다..다.."
            class="w-full border-none bg-transparent px-2 py-1.5 text-[11px] font-bold text-slate-700 focus:ring-0"
            bind:this={inputRef}
            bind:value={mujisungQuery}
            onfocus={() => {
              searchFocused = true;
            }}
            onkeydown={(e) => {
              if (e.key === 'Escape') {
                inputRef?.blur();
              } else if (e.key === 'Enter') {
                inputRef?.blur();
                mujisungCopy(mujisungFiltered[0][2]);
              }
            }}
            onblur={() => {
              setTimeout(() => {
                searchFocused = false;
                mujisungQuery = '';
              }, 150);
            }}
          />
        </div>

        <div
          class="{searchFocused
            ? 'block'
            : 'hidden'} absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border-4 border-slate-200 bg-white shadow-xl"
        >
          <ul class="max-h-48 divide-y divide-slate-100 overflow-y-auto">
            {#each mujisungFiltered as item, index}
              <li>
                <button
                  type="button"
                  class="row flex w-full truncate px-3 py-2 text-left text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-50 mujisung-{index}"
                  onmousedown={(e) => {
                    e.preventDefault();
                  }}
                  onmouseup={() => {
                    mujisungCopy(item[2]);
                  }}
                >
                  {#if item[0] === '틱톡 or 노래'}
                    <span class="w-1/5 truncate">{item[0]}</span>
                    <span class="mx-1.5 h-4 w-px bg-slate-300"></span>
                    <span class="w-4/5 truncate">{item[2]}</span>
                  {:else if item[0] === '기타' || item[0] === '커스텀' || item[0] === '자동'}
                    <span class="w-1/10 truncate">{item[0]}</span>
                    <span class="mx-1.5 h-4 w-px bg-slate-300"></span>
                    <span class="w-9/10 truncate">{item[2]}</span>
                  {:else}
                    <span class="w-1/10 truncate">{item[0]}</span>
                    <span class="mx-1 h-4 w-px bg-slate-300"></span>
                    <span class="w-3/10 truncate">{item[1]}</span>
                    <span class="mx-1 h-4 w-px bg-slate-300"></span>
                    <span class="w-3/5 truncate">{item[2]}</span>
                  {/if}
                </button>
              </li>
            {/each}
          </ul>
        </div>
      </div>

      <InputAndAdd
        title="커스텀 도배 리스트"
        subtitle="엔터나 버튼으로 추가"
        placeHolder="ex) 도배💖만들어줘💥"
        bind:configList={$configStore.mujisung.custom}
        bind:showErrorModal
      />

      <InputAndAdd
        title="도배 제외 리스트"
        subtitle="엔터나 버튼으로 추가"
        placeHolder="ex) 채팅금지"
        bind:configList={$configStore.mujisung.exception}
      />

      <InputAndAdd
        title="LIVE 자동 UP 대상"
        subtitle="엔터나 버튼으로 추가"
        placeHolder="줄바꿈으로 구분해 스트리머 ID 입력"
        bind:configList={$configStore.autoUp.custom}
      />

      <InputAndAdd
        title="LIVE 채팅 가리기"
        subtitle="엔터나 버튼으로 추가"
        placeHolder="차단할 유저 닉네임 입력"
        bind:configList={$configStore.blockUser.list}
      />
    </div>
  </div>

  <footer>
    <div class="flex justify-center">
      <button
        class="text-xs text-slate-400 transition-all duration-300 ease-in-out hover:cursor-pointer hover:font-bold hover:text-slate-600"
        onclick={openResetModal}
        >설정 초기화
      </button>
    </div>
  </footer>
</div>

<Modal
  bind:show={showResetModal}
  title="설정 초기화"
  message="도배 리스트를 포함한 모든 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다."
  buttonMessage="확인"
  onConfirm={performReset}
/>

<Modal
  bind:show={showErrorModal}
  title="오류"
  message="텍스트는 128자를 넘길 수 없습니다."
  onConfirm={() => {}}
/>
