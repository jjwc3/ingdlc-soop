<script lang="ts">
  let {show = $bindable(), title = "", message, buttonMessage = "", onConfirm} = $props();

  function close() {
    show = false;
  }

  async function handleConfirm() {
    if (onConfirm) {
      await onConfirm();
    }
    close();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }
</script>

{#if show}
  <div
      class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[1px] cursor-default"
      role="button"
      tabindex="0"
      onclick={close}
      onkeydown={handleKeyDown}
      aria-label="닫기 배경"
  >
    <div
        class="w-full max-w-60 bg-white rounded-xl shadow-2xl p-4 text-left cursor-auto border border-slate-200 outline-none"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
    >
      <div class="mb-3">
        <h3 class="text-sm font-bold text-slate-800">{title}</h3>
        <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">
          {message}
        </p>
      </div>

      <div class="flex flex-row gap-2 mt-4">
        {#if buttonMessage}
          <button
              type="button"
              class="flex-1 py-2 text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:ring-2 focus:ring-slate-300 outline-none"
              onclick={close}
          >
            취소
          </button>
          <button
              type="button"
              class="flex-1 py-2 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm shadow-red-200 focus:ring-2 focus:ring-red-300 outline-none"
              onclick={handleConfirm}
          >
            {buttonMessage}
          </button>
        {:else}
          <button
              type="button"
              class="flex-1 py-2 text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:ring-2 focus:ring-slate-300 outline-none"
              onclick={close}
          >
            확인
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}