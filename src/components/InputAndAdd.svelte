<script lang="ts">
  let {
    title = "",
    subtitle = "",
    placeHolder = "",
    configList = $bindable([] as string[]),
    showErrorModal = $bindable()
  } = $props()

  let input = $state("");

  let addInput = () => {
    if (input.trim()) {
      if (input.trim() <= 128) {
        configList = [...configList, input.trim()];
        input = "";
      } else {
        showErrorModal = true;
      }
    }
  }

  let removeItem = (index: number) => {
    configList = configList.filter((_, i) => i !== index);
  }
</script>

<div class="mb-4 last:mb-0 relative">
  <div class="flex flex-row items-center mb-1.5">
    <span class="flex items-center text-sm font-semibold"># {title}</span>
    {#if subtitle}
      <span class="text-xs text-slate-500 ml-2 font-bold">{subtitle}</span>
    {/if}
  </div>

  <div class="flex flex-row gap-1 mb-2">
    <div
        class="relative flex-1 flex items-center bg-slate-200 rounded-lg p-1 overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition-all">
      <input type="text" placeholder="{placeHolder}"
             class="w-full bg-transparent border-none focus:ring-0 text-xs font-bold py-1.5 px-2 text-slate-700 placeholder:text-slate-400"
             bind:value={input}
             onkeydown={(e) => {
               if (e.key === "Enter") {
                 e.preventDefault();
                 addInput();
               }
             }}
      />
    </div>

    <button type="button"
            class="flex items-center justify-center bg-slate-200 hover:bg-blue-500 hover:text-white text-slate-500 rounded-lg px-3 transition-colors group"
            aria-label="추가"
            onclick={addInput}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
      </svg>
    </button>
  </div>

  <div class="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-inner">
    <ul class="h-32 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
      {#each configList as el, i}
        <li class="group flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 transition-colors">
          <span class="text-xs font-bold text-slate-600 truncate mr-2">{el}</span>

          <button
              type="button"
              class="flex items-center justify-center w-6 h-6 -mr-1 text-slate-300 hover:text-red-500 transition-all rounded-md"
              aria-label="삭제"
              onclick={() => {
                removeItem(i)
              }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 block" viewBox="0 0 20 20" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="15" y1="5" x2="5" y2="15"></line>
              <line x1="5" y1="5" x2="15" y2="15"></line>
            </svg>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>
