<script lang="ts">
  let {
    title = '',
    subtitle = '',
    placeHolder = '',
    configList = $bindable([] as string[]),
    showErrorModal = $bindable(),
  } = $props();

  let input = $state('');

  let addInput = () => {
    if (input.trim()) {
      if (input.trim().length <= 128) {
        configList = [...configList, input.trim()];
        input = '';
      } else {
        showErrorModal = true;
      }
    }
  };

  let removeItem = (index: number) => {
    configList = configList.filter((_, i) => i !== index);
  };
</script>

<div class="relative mb-4 last:mb-0">
  <div class="mb-1.5 flex flex-row items-center">
    <span class="flex items-center text-sm font-semibold"># {title}</span>
    {#if subtitle}
      <span class="ml-2 text-xs font-bold text-slate-500">{subtitle}</span>
    {/if}
  </div>

  <div class="mb-2 flex flex-row gap-1">
    <div
      class="relative flex flex-1 items-center overflow-hidden rounded-lg bg-slate-200 p-1 transition-all focus-within:ring-2 focus-within:ring-blue-400"
    >
      <input
        type="text"
        placeholder={placeHolder}
        class="w-full border-none bg-transparent px-2 py-1.5 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:ring-0"
        bind:value={input}
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addInput();
          }
        }}
      />
    </div>

    <button
      type="button"
      class="group flex items-center justify-center rounded-lg bg-slate-200 px-3 text-slate-500 transition-colors hover:bg-blue-500 hover:text-white"
      aria-label="추가"
      onclick={addInput}
    >
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
          stroke-width="3"
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </button>
  </div>

  <div
    class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-inner"
  >
    <ul class="custom-scrollbar h-32 divide-y divide-slate-50 overflow-y-auto">
      {#each configList as el, i}
        <li
          class="group flex items-center justify-between px-3 py-1.5 transition-colors hover:bg-slate-50"
        >
          <span class="mr-2 truncate text-xs font-bold text-slate-600"
            >{el}</span
          >

          <button
            type="button"
            class="-mr-1 flex h-6 w-6 items-center justify-center rounded-md text-slate-300 transition-all hover:text-red-500"
            aria-label="삭제"
            onclick={() => {
              removeItem(i);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="block w-3.5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="15" y1="5" x2="5" y2="15"></line>
              <line x1="5" y1="5" x2="15" y2="15"></line>
            </svg>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>
