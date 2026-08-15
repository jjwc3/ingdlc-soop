<script lang="ts">
  import { onMount } from 'svelte';

  import { getChoseong } from 'es-hangul';

  import DropDown from '@/components/DropDown.svelte';
  import ElementTitle from '@/components/ElementTitle.svelte';
  import Header from '@/components/Header.svelte';
  import InputAndAdd from '@/components/InputAndAdd.svelte';
  import Modal from '@/components/Modal.svelte';
  import TextInput from '@/components/TextInput.svelte';
  import { configStore, loadConfig, resetConfig } from '@/modules/configStore';
  import { startDownload } from '@/scripts/downloadVideo';

  let showResetModal = $state(false);
  let showErrorModal = $state(false);

  let searchFocused = $state(false);
  let mujisungQuery = $state('');

  let m3u8Url = $state('');
  let downloadStatus = $state('다운로드');
  let showDownloadButton = $state(false);

  function openResetModal(e: Event) {
    e.stopPropagation();
    showResetModal = true;
  }

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

      window.close();
    } catch (e) {
      console.error(e);
    }
  }

  onMount(async () => {
    await loadConfig();
    await mujisungUpdate();
    chrome.runtime.sendMessage({ action: 'INGDLC_SIDE_DL_REQ' }, (response) => {
      if (response?.url) {
        m3u8Url = response.url;
        showDownloadButton = true;
      }
    });
  });
</script>

<div class="h-screen bg-slate-50 px-2 py-4 text-slate-900">
  <Header />

  {#if showDownloadButton}
    <div
      class="m-4 flex justify-center rounded-sm bg-red-300 p-2 text-xl font-bold"
    >
      <button
        type="button"
        onclick={() =>
          startDownload(m3u8Url, (status) => (downloadStatus = status))}
        >{downloadStatus}</button
      >
    </div>
  {/if}

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
        <ElementTitle title="도배 검색" subtitle="선택하여 복사" />

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
          <TextInput
            placeHolder="곡명/도배 텍스트를 입력해 검색 ex) 돌핀 or 다..다.."
            bind:value={mujisungQuery}
            onFocus={() => {
              searchFocused = true;
            }}
            onBlur={() => {
              setTimeout(() => {
                searchFocused = false;
                mujisungQuery = '';
              }, 150);
            }}
            onEnter={() => {
              mujisungCopy(mujisungFiltered[0][2]);
            }}
          />
        </div>

        <div
          class="{searchFocused
            ? 'block'
            : 'hidden'} absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border-4 border-slate-200 bg-white shadow-xl"
        >
          <ul class="max-h-48 divide-y divide-slate-100 overflow-y-auto">
            {#each mujisungFiltered as item, index (index)}
              <DropDown handleCopy={mujisungCopy} {item} {index} />
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
