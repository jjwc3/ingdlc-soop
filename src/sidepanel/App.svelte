<script lang="ts">
  import {getChoseong} from 'es-hangul';
  import {configStore, loadConfig, resetConfig} from '@/modules/configStore';
  import {onMount} from 'svelte';
  import InputAndAdd from "@/components/InputAndAdd.svelte";
  import Modal from "@/components/Modal.svelte";

  let searchFocused = $state(false);

  let showResetModal = $state(false);

  let mujisungQuery = $state("");

  async function performReset() {
    try {
      await resetConfig();
    } catch (error) {
      console.error(error);
    } finally {
      showResetModal = false;
    }
  }

  function openModal(e: Event) {
    e.stopPropagation();
    showResetModal = true;
  }

  async function mujisungUpdate() {
    let fetchList = await (await fetch("https://jjwc3.github.io/ingdlc-new-mlist/list.json")).json();
    const typeList = ["댄스", "틱톡 or 노래", "기타"];

    let tempMujisung = [];
    for (let type of typeList) {
      let songObject = fetchList[type];
      Object.keys(songObject).forEach((song) => {
        let textList = songObject[song];
        textList.forEach((text) => {
          let structure = [type, song, text];
          tempMujisung.push(structure);
        })
      })
    }
    configStore.update(current => ({
      ...current,
      mujisung: {
        ...current.mujisung,
        list: tempMujisung
      }
    }))
  }

  let mujisungFiltered = $derived.by(() => {
    const list = $configStore.mujisung.list;
    let query = mujisungQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter(item => {
      const joined = item.join(' ').toLowerCase();
      return joined.includes(query) || getChoseong(joined).includes(query);
    })
  })

  let inputRef: HTMLInputElement | undefined = $state();

  async function handleSelect(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      console.log("Copied");
      searchFocused = false;
      if (inputRef) {
        inputRef.blur();
      }
    } catch (e) {
      console.error(e)
    }
  }

  onMount(async () => {
    await loadConfig();
    await mujisungUpdate();
  })
</script>


<div style="min-width:400px;" class="text-slate-900 h-screen bg-slate-50 px-2 py-4">
  <header>
    <h1 class="text-2xl font-bold text-center mt-3 mb-1">
      INGDLC for SOOP
    </h1>

    <div class="text-center text-xs text-slate-500">
      Ver.<span>{chrome.runtime.getManifest().version}</span>
    </div>
    <div class="absolute right-2 top-2">
      <a href="index.html" target="_blank" class="hover:cursor-pointer text-slate-400 text-xs">새 창에서 열기</a>
    </div>
  </header>
  <div class="flex flex-col">
    <div
        class="border border-slate-100 shadow-xl hover:shadow-2xl ease-in-out duration-500 rounded-md bg-white px-3 py-4 m-4 bg-opacity-70 hover:bg-opacity-100 transition-all">
      <h2 class="font-semibold text-xl text-center mb-3 pb-3 border-b border-slate-300 border-dashed">SOOP 도배도우미</h2>

      <div class="mb-4 last:mb-0 relative">
        <div class="flex flex-row items-center mb-1.5">
          <span class="flex items-center text-sm font-semibold"># 도배 검색</span>
          <span class="text-xs font-bold text-slate-500 ml-2">선택하여 복사</span>
        </div>

        <div
            class="relative flex items-center bg-slate-200 rounded-lg p-1 w-full overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition-all">
          <div class="pl-2 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input type="text" placeholder="곡명/도배 텍스트를 입력해 검색 ex) 돌핀 or 다..다.."
                 class="w-full bg-transparent border-none focus:ring-0 text-[11px] font-bold py-1.5 px-2 text-slate-700"
                 bind:this={inputRef}
                 bind:value={mujisungQuery}
                 onfocus={() => {searchFocused = true}}
                 onkeydown={(e) => e.key === 'Escape' && inputRef?.blur()}
                 onblur={() => {
                   setTimeout(() => { searchFocused = false; }, 150);
                 }}
          />
        </div>

        <div
            class="{searchFocused ? 'block' : 'hidden'} absolute z-50 w-full mt-1.5 bg-white border-4 border-slate-200 rounded-lg shadow-xl overflow-hidden">
          <ul class="max-h-48 overflow-y-auto divide-y divide-slate-100">
            {#each mujisungFiltered as item}
              <li>
                <button type="button"
                        class="flex row w-full px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 text-left transition-colors truncate"
                        onmousedown={(e) => {
                          e.preventDefault();
                        }}
                        onmouseup={() => {
                          handleSelect(item[2]);
                        }}
                >
                  {#if item[0] === "틱톡 or 노래"}
                    <span class="w-1/5 truncate">{item[0]}</span>
                    <span class="w-px h-4 mx-1.5 bg-slate-300"></span>
                    <span class="w-4/5 truncate">{item[2]}</span>
                  {:else if item[0] === "기타"}
                    <span class="w-1/10 truncate">{item[0]}</span>
                    <span class="w-px h-4 mx-1.5 bg-slate-300"></span>
                    <span class="w-9/10 truncate">{item[2]}</span>
                  {:else}
                    <span class="w-1/10 truncate">{item[0]}</span>
                    <span class="w-px h-4 mx-1 bg-slate-300"></span>
                    <span class="w-3/10 truncate">{item[1]}</span>
                    <span class="w-px h-4 mx-1 bg-slate-300"></span>
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
          placeHolder="ex) 도배💖만들어줘💥"
          bind:configList={$configStore.mujisung.custom}
      />

      <div class="mb-4 last:mb-0 relative">
        <div class="flex flex-row items-center mb-1.5">
          <span class="flex items-center text-sm font-semibold"># 커스텀 도배 리스트</span>
        </div>

        <div
            class="relative flex items-center bg-slate-200 rounded-lg p-1 w-full overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition-all">
          <input type="text" placeholder="ex) 도배💖만들어줘💥"
                 class="w-full bg-transparent border-none focus:ring-0 text-[11px] font-bold py-1.5 px-2 text-slate-700"
          />
        </div>

      </div>

      <InputAndAdd
          title="도배 제외 리스트"
          subtitle="엔터나 버튼으로 추가"
          placeHolder="ex) 채팅금지"
          bind:configList={$configStore.mujisung.exception}
      />

      <InputAndAdd
          title="LIVE 자동 UP 대상"
          placeHolder="줄바꿈으로 구분해 스트리머 ID 입력"
          bind:configList={$configStore.autoUp.custom}
      />

      <InputAndAdd
          title="LIVE 채팅 가리기"
          placeHolder="차단할 유저 닉네임 입력"
          bind:configList={$configStore.blockUser.list}
      />

    </div>
  </div>

  <footer>
    <div class="flex justify-center">
      <button class="hover:cursor-pointer text-slate-400 text-xs" onclick={openModal}>설정 초기화</button>
    </div>
  </footer>
</div>

<Modal
    bind:show={showResetModal}
    title="설정 초기화"
    message="도배 리스트를 포함한 모든 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    onConfirm={performReset}
/>