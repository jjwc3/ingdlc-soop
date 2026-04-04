<script lang="ts">
  import MultiSwitch from '@/components/MultiSwitch.svelte';
  import Modal from "@/components/Modal.svelte";
  import {configStore, loadConfig, resetConfig} from '@/modules/configStore';
  import {onMount} from 'svelte';
  import Papa from 'papaparse';

  function findAll(arr: Array, value: any) {
    const indices = [];
    arr.forEach((element, index) => {
      if (element === value) {
        indices.push(index);
      }
    });
    return indices;
  }

  let schedule = $state(["로딩중", "로딩중"]);

  const fetchSchedule = async () => {
    schedule = ["로딩중", "로딩중"];
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = d.getMonth() + 1;
    const dd = d.getDate();
    const date = [yyyy, mm, dd];

    const n = new Date(d);
    n.setDate(d.getDate() + 1);
    const nextDate = n.getDate();


    const url = "https://docs.google.com/spreadsheets/d/1n-ERReiHweDiCJcXTMkWRBUellktnBYQDbFmouExnas/export?format=csv";

    let csv = [];

    const text = await (await fetch(url)).text();
    csv = Papa.parse(text, {skipEmptyLines: true}).data;

    if (date[0] !== Number(csv[0][3]) || date[1] !== Number(csv[0][13])) {
      schedule = ["오류", "오류"]; // noMatch
      return;
    }

    const rowDateIndex = [2, 5, 8, 11, 14, 17];
    const columnDayIndex = [3, 8, 13, 18, 23, 28, 33];

    let dateArr = [];
    let textArr = [];

    rowDateIndex.forEach((dateIndex) => {
      columnDayIndex.forEach((dayIndex) => {
        dateArr.push(csv[dateIndex][dayIndex].trim());
        textArr.push(csv[dateIndex + 1][dayIndex].trim());
      })
    })

    const oneIndex = findAll(dateArr, "1");
    dateArr = dateArr.slice(oneIndex[0], oneIndex[1]);
    textArr = textArr.slice(oneIndex[0], oneIndex[1]);

    if (Number(dateArr[date[2] - 1]) !== date[2]) {
      schedule = ["오류", "오류"]; // err
      return;
    } else {
      let temp = [textArr[date[2] - 1], textArr[date[2]]];
      temp.forEach((value, index) => {
        if (value === "") temp[index] = "정규방송";
      })
      if (date[2]+1 === nextDate) {
        schedule = temp;
      } else {
        schedule = [temp[0], "직접 확인"];
      }
    }
  }

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

  const openSide = async () => {
    try {
      const windowInfo = await chrome.windows.getCurrent();

      if (windowInfo.id) {
        await chrome.sidePanel.open({ windowId: windowInfo.id });
        window.close();
      }
    } catch (error) {
      console.error(error);
    }
  }

  onMount(async () => {
    await loadConfig();
    await fetchSchedule();
  })
</script>


<div style="min-width:400px; max-width:400px" class=" text-slate-900 bg-slate-50 px-2 py-4">
  <header>
    <h1 class="text-2xl font-bold text-center mt-3 mb-1">
      INGDLC for SOOP
    </h1>

    <div class="text-center text-xs text-slate-500">
      Ver.<span>{chrome.runtime.getManifest().version}</span>
    </div>

    <div class="absolute left-2 top-2">
      <button class="hover:cursor-pointer text-slate-400 hover:text-slate-600 hover:font-bold transition-all duration-300 ease-in-out text-xs" onclick={openSide}>도배 도우미 열기</button>
    </div>

    <div class="absolute right-2 top-2">
      <a href="index.html" target="_blank" class="hover:cursor-pointer text-slate-400 hover:text-slate-600 hover:font-bold transition-all duration-300 ease-in-out text-xs">새 창에서 열기</a>
    </div>

  </header>
  <hr class="mx-7 my-3 border-slate-300">
  <footer class="flex items-center justify-between w-full px-7 gap-4 font-bold text-sm">
    <div class="flex flex-1 min-w-0" title={schedule[0]}>
      <p class="text-nowrap">오늘: &nbsp;</p>
      <p class="{schedule[0].includes('오류') || schedule[0].includes('휴방') ? 'text-red-500' : 'text-black'} truncate">{schedule[0]}</p>
    </div>
    <div class="flex flex-1 min-w-0" title={schedule[1]}>
      <p class="text-nowrap">내일: &nbsp;</p>
      <p class="{schedule[1].includes('오류') || schedule[1].includes('휴방') || schedule[1].includes('직접 확인') ? 'text-red-500' : 'text-black'} truncate">{schedule[1]}</p>
    </div>
    <button id="schedule-reload" class="shrink-0 font-medium text-sm hover:cursor-pointer text-nowrap hover:font-bold" onclick={fetchSchedule}>새로고침</button>
  </footer>
  <hr class="mx-7 my-3 border-slate-300">

  <footer class="flex justify-between mx-7">
    <a class="opacity-70 hover:opacity-100 hover:font-bold" href="https://www.sooplive.com/station/nanajam" target="_blank">💜SOOP</a>
    <a class="opacity-70 hover:opacity-100 hover:font-bold" href="https://cafe.naver.com/ingsfriends" target="_blank">💕잉친쓰</a>
    <a class="opacity-70 hover:opacity-100 hover:font-bold" href="https://docs.google.com/spreadsheets/d/1n-ERReiHweDiCJcXTMkWRBUellktnBYQDbFmouExnas" target="_blank">💚방송일정</a>
    <a class="opacity-70 hover:opacity-100 hover:font-bold" href="https://www.youtube.com/channel/UCW945UjEs6Jm3rVNvPEALdg" target="_blank">❤️유튜브</a>
    <a class="opacity-70 hover:opacity-100 hover:font-bold" href="https://www.instagram.com/friendshiping94/" target="_blank">💗인스타그램</a>
  </footer>
  <div class="flex flex-col">
    <div
        class="border border-slate-100 shadow-xl hover:shadow-2xl ease-in-out duration-500 rounded-md bg-white px-3 py-4 m-4 bg-opacity-70 hover:bg-opacity-100 transition-all">

      <MultiSwitch
          title="도배버튼(LIVE)"
          subtitle="단축키: Alt+M"
          options={[
            {label: 'OFF', value: 0},
            {label: '단축키', value: 1},
            {label: '단축키 + 버튼', value: 2}
          ]}
          bind:value={$configStore.mujisung.enabled}
      />
      <MultiSwitch
          title="캡쳐버튼(LIVE, VOD)"
          subtitle="단축키: Alt+C"
          options={[
          {label: 'OFF', value: 0},
          {label: '단축키', value: 1},
          {label: '단축키 + 버튼', value: 2}
        ]}
          bind:value={$configStore.capture.enabled}
      />
      <MultiSwitch
          title="자동 음량 조절 버튼(LIVE, VOD)"
          subtitle="단축키: Alt+A"
          options={[
          {label: 'OFF', value: 0},
          {label: '단축키', value: 1},
          {label: '단축키 + 버튼', value: 2}
        ]}
          bind:value={$configStore.audioComp.enabled}
      />
      <MultiSwitch
          title="다운로드 버튼(VOD)"
          subtitle="단축키: Alt+D"
          options={[
          {label: 'OFF', value: 0},
          {label: '단축키', value: 1},
          {label: '단축키 + 버튼', value: 2}
        ]}
          bind:value={$configStore.download.enabled}
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
              bind:value={$configStore.download.path}
              placeholder="경로 입력"
          >
        </div>
      </div>
    </div>
  </div>

  <footer>
    <div class="flex justify-center">
      <button class="hover:cursor-pointer text-slate-400 hover:text-slate-600 hover:font-bold transition-all duration-300 ease-in-out text-xs" onclick={openModal}>설정 초기화</button>
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