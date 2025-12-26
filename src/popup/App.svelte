<script lang="ts">
  import MultiSwitch from '@/components/MultiSwitch.svelte';
  import {configStore, loadConfig} from '@/modules/configStore';
  import {onMount} from 'svelte';

  onMount(loadConfig);
</script>


<div style="min-width:400px;" class="text-slate-900 bg-slate-50 px-2 py-4">
  <header>
    <h1 class="text-2xl font-bold text-center">
      INGDLC for SOOP
    </h1>

    <div class="text-center text-xs text-slate-500">
      Ver.<span id="version-current">0.0</span>
    </div>

    <div class="absolute left-2 top-2">
      <button class="hover:cursor-pointer text-slate-400 text-xs">도배 도우미 열기</button>
    </div>

    <div class="absolute right-2 top-2">
      <a href="index.html" target="_blank" class="hover:cursor-pointer text-slate-400 text-xs">새 창에서 열기</a>
    </div>

  </header>

  <footer class="flex justify-around my-4 font-bold text-lg">
    <div class="flex">
      <p>오늘: &nbsp;</p>
      <p id="schedule-today"></p>
    </div>
    <div class="flex">
      <p>내일: &nbsp;</p>
      <p id="schedule-tomorrow"></p>
    </div>
    <button id="schedule-reload" class="font-medium text-sm">새로고침</button>
  </footer>

  <div id="wrap" class="flex flex-col">
    <div
        class="border border-slate-100 shadow-xl hover:shadow-2xl ease-in-out duration-500 rounded-md bg-white px-3 py-4 m-4 bg-opacity-70 hover:bg-opacity-100 transition-all">

      <MultiSwitch
          title="도배버튼"
          subtitle="단축키: Alt+M"
          options={[
            {label: 'OFF', value: 0},
            {label: '단축키', value: 1},
            {label: '단축키 + 버튼', value: 2}
          ]}
          bind:value={$configStore.mujisung.enabled}
      />
      <MultiSwitch
          title="캡쳐버튼"
          subtitle="단축키: Alt+C"
          options={[
          {label: 'OFF', value: 0},
          {label: '단축키', value: 1},
          {label: '단축키 + 버튼', value: 2}
        ]}
          bind:value={$configStore.capture.enabled}
      />
      <MultiSwitch
          title="자동 음량 조절"
          subtitle="단축키: Alt+A"
          options={[
          {label: 'OFF', value: 0},
          {label: '단축키', value: 1},
          {label: '단축키 + 버튼', value: 2}
        ]}
          bind:value={$configStore.audioComp.enabled}
      />
      <MultiSwitch
          title="방송 시작 시 새로고침"
          options={[
          {label: 'OFF', value: 0},
          {label: 'ON', value: 1},
        ]}
          bind:value={$configStore.reload.enabled}
      />
      <MultiSwitch
          title="라이브 채팅 필터링"
          options={[
          {label: 'OFF', value: 0},
          {label:'팬·구독자만', value: 1},
          {label: '구독자만', value: 2}
        ]}
          bind:value={$configStore.blockGrade.enabled}
      />
      <div class="mb-4 last:mb-0">
        <div class="flex flex-row items-center mb-1.5">
          <span class="flex items-center text-sm font-semibold"># 클립 다운로드 경로 설정</span>
        </div>
        <div class="relative flex items-center bg-slate-200 rounded-lg p-1 w-full overflow-hidden">
          <input
              class="relative z-10 flex-1 p-2 text-sm font-bold transition-colors duration-200 text-slate-700"
              bind:value={$configStore.path.path}
              placeholder="경로 입력"
          >
        </div>
      </div>
    </div>
  </div>
</div>