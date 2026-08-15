<script lang="ts">
  interface DropDownProps {
    handleCopy: (text: string) => void;
    item: string[];
    index: number;
  }
  let { handleCopy, item, index }: DropDownProps = $props();
</script>

<li>
  <button
    type="button"
    class="row flex w-full truncate px-3 py-2 text-left text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 mujisung-{index}"
    onmousedown={(e) => {
      e.preventDefault();
    }}
    onmouseup={() => {
      handleCopy(item[2]);
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
