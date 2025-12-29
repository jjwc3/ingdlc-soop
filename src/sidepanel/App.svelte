<script lang="ts">
  import {configStore, loadConfig, resetConfig} from '@/modules/configStore';
  import {onMount} from 'svelte';
  import InputAndAdd from "@/components/InputAndAdd.svelte";
  import Modal from "@/components/Modal.svelte";

  let searchFocused = $state(false);

  let showResetModal = $state(false);

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


  onMount(async () => {
    await loadConfig();
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
      <h2 class="font-semibold text-xl text-center pb-1 mb-3 border-b border-slate-300 border-dashed">SOOP 도배도우미</h2>

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
                 onfocus={() => {searchFocused = true}}
                 onblur={() => {
                   setTimeout(() => {
                     searchFocused = false;
                   }, 50)
                 }}
          />
        </div>

        <div
            class="{searchFocused ? 'block' : 'hidden'} absolute z-50 w-full mt-1.5 bg-white border-4 border-slate-200 rounded-lg shadow-xl overflow-hidden">
          <ul class="max-h-48 overflow-y-auto divide-y divide-slate-100">
            <li>
              <button type="button"
                      class="w-full px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 text-left transition-colors truncate">
                일반 검색 결과 항목 2
              </button>
            </li>
          </ul>
        </div>
      </div>

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

      <div class="mb-4 last:mb-0 relative">
        <div class="flex flex-row items-center mb-1.5">
          <span class="flex items-center text-sm font-semibold"># 도배 제외 리스트</span>
          <span class="text-[10px] text-slate-400 ml-2 font-bold">엔터나 버튼으로 추가</span>
        </div>

        <div class="flex flex-row gap-1 mb-2">
          <div
              class="relative flex-1 flex items-center bg-slate-200 rounded-lg p-1 overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition-all">
            <input type="text" placeholder="ex) 채팅금지"
                   class="w-full bg-transparent border-none focus:ring-0 text-[11px] font-bold py-1.5 px-2 text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <button type="button"
                  class="flex items-center justify-center bg-slate-200 hover:bg-blue-500 hover:text-white text-slate-500 rounded-lg px-3 transition-colors group"
                  aria-label="추가">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </button>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-inner">
          <ul class="max-h-32 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">

            <li class="group flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 transition-colors">
              <span class="text-[11px] font-bold text-slate-600 truncate mr-2">채팅금지</span>

              <button
                  type="button"
                  class="opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 -mr-1 text-slate-300 hover:text-red-500 transition-all rounded-md"
                  aria-label="삭제"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 block" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l1.293 1.293a1 1 0 01-1.414 1.414L10 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"/>
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div class="mb-4 last:mb-0 relative">
        <div class="flex flex-row items-center mb-1.5">
          <span class="flex items-center text-sm font-semibold"># LIVE 자동 UP 대상</span>
        </div>

        <div
            class="relative flex items-center bg-slate-200 rounded-lg p-1 w-full overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition-all">
          <input type="text" placeholder="줄바꿈으로 구분해 스트리머 ID 입력"
                 class="w-full bg-transparent border-none focus:ring-0 text-[11px] font-bold py-1.5 px-2 text-slate-700"
          />
        </div>
      </div>


      <div class="mb-4 last:mb-0 relative">
        <div class="flex flex-row items-center mb-1.5">
          <span class="flex items-center text-sm font-semibold"># LIVE 채팅 가리기</span>
        </div>

        <div
            class="relative flex items-center bg-slate-200 rounded-lg p-1 w-full overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition-all">
          <input type="text" placeholder="차단할 유저 닉네임 입력"
                 class="w-full bg-transparent border-none focus:ring-0 text-[11px] font-bold py-1.5 px-2 text-slate-700"
          />
        </div>
      </div>
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