<script lang="ts">
  let {
    title = "",
    subtitle = "",
    options = [],
    value = $bindable()
  } = $props();

  let currentIndex = $derived(options.findIndex(opt => opt.value === value));

  let safeIndex = $derived(currentIndex === -1 ? 0 : currentIndex);

  let sliderWidth = $derived(options.length > 0 ? 100 / options.length : 0);
</script>

<div class="mb-4 last:mb-0">
  <div class="flex flex-row items-center mb-1.5">
    <span class="flex items-center text-sm font-semibold"># {title}</span>
    {#if subtitle}
      <span class="text-xs font-bold text-slate-500 ml-2">{subtitle}</span>
    {/if}

  </div>

  <div class="relative flex items-center bg-slate-200 rounded-lg p-1 w-full overflow-hidden">
    <div
        class="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300 ease-in-out"
        style="width: calc({sliderWidth}% - 8px); left: calc({safeIndex * sliderWidth}% + 4px);"
    ></div>

    {#each options as opt}
      <button
          type="button"
          class="relative z-10 flex-1 py-1.5 text-[11px] font-bold transition-colors duration-200
               {value === opt.value ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}"
          onclick={() => (value = opt.value)}
      >
        {opt.label}
      </button>
    {/each}
  </div>
</div>
