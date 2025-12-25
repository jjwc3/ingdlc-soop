<script lang="ts">
  import {onMount} from "svelte";
  let os = $state('loading...');
  onMount(() => {
    chrome.runtime.getPlatformInfo((info) => {
      os = info.os;
      console.log("현재 OS:", os);
    });
  });
</script>

<div style="min-width:400px;" class="text-slate-900 bg-slate-50 px-2 py-4">
  <header>
    <h1 class="text-2xl font-bold text-center">
      asdf
    </h1>

    <div class="text-center text-xs text-slate-500">
      Ver.<span id="version-current">0.0</span>
    </div>

    <div class="absolute left-2 top-2">
      <button class="hover:cursor-pointer">도배 도우미 열기</button>
    </div>

    <div class="absolute right-2 top-2">
      <a href="index.html" target="_blank">새 창에서 열기</a>
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
    <div class="border border-slate-100 shadow-xl hover:shadow-2xl ease-in-out duration-500 rounded-md bg-white px-3 py-4 m-4 bg-opacity-70 hover:bg-opacity-100 transition-all">

      <div class="mb-4 last:mb-0">
        <h3 class="flex items-center mb-1">
          <label class="text-sm font-semibold" for="soop.mujisung.enabled"># 도배버튼</label>
          <div class="text-slate-400 ml-2 text-xs">SOOP 채팅에 도배 버튼 추가</div>
        </h3>
        <select class="config border rounded-sm p-2 w-full text-sm" id="soop.mujisung.enabled">
          <option value="0">OFF</option>
          <option value="1">단축키(Alt+M)만 사용</option>
          <option value="2">ON (단축키 Alt+M)</option>
        </select>
      </div>

      <div class="mb-4 last:mb-0">
        <h3 class="flex items-center mb-1">
          <label class="text-sm font-semibold" for="soop.controller.enabled"># 캡쳐버튼</label>
          <div class="text-slate-400 ml-2 text-xs">SOOP 채팅에 캡쳐 버튼 추가</div>
        </h3>
        <select class="config border rounded-sm p-2 w-full text-sm" id="soop.controller.enabled">
          <option value="0">OFF</option>
          <option value="1">단축키(Alt+C)만 사용</option>
          <option value="2">ON (단축키 Alt+C)</option>
        </select>
      </div>

      <div class="mb-4 last:mb-0">
        <h3 class="flex items-center mb-1">
          <label class="text-sm font-semibold" for="soop.audioComp.enabled"># 자동 음량 조절</label>
          <div class="text-slate-400 ml-2 text-xs">라이브·VOD 음량 자동 조절</div>
        </h3>
        <select class="config border rounded-sm p-2 w-full text-sm" id="soop.audioComp.enabled">
          <option value="0">OFF</option>
          <option value="1">단축키(Alt+A)만 사용</option>
          <option value="2">ON (단축키 Alt+A)</option>
        </select>
      </div>

      <div class="mb-4 last:mb-0">
        <h3 class="flex items-center mb-1">
          <label class="text-sm font-semibold" for="soop.reload.enabled"># 방송 시작 시 새로고침</label>
        </h3>
        <select class="config border rounded-sm p-2 w-full text-sm" id="soop.reload.enabled">
          <option value="0">OFF</option>
          <option value="1">ON</option>
        </select>
      </div>

      <div class="mb-4 last:mb-0">
        <h3 class="flex items-center mb-1">
          <label class="text-sm font-semibold" for="soop.blockGrade.enabled"># LIVE 채팅 필터링</label>
        </h3>
        <select class="config border rounded-sm p-2 w-full text-sm" id="soop.blockGrade.enabled">
          <option value="0">OFF</option>
          <option value="1">팬·구독자 아닌 유저 가리기</option>
          <option value="2">구독자 아닌 유저 가리기</option>
        </select>
      </div>

      <div class="mb-4 last:mb-0">
        <h3 class="flex items-center mb-1">
          <label class="text-sm font-semibold" for="soop.path.path"># 클립 다운로드 경로 설정</label>
        </h3>
        <div class="flex items-center">
          <input class="config border rounded-sm p-2 w-full text-sm" type="text" id="soop.path.path" placeholder="경로 입력">
        </div>
      </div>

    </div>
  </div>
</div>
