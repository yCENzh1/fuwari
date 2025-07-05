<script lang="ts">
import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants.ts";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import {
  applyThemeToDocument,
  getStoredTheme,
  setTheme,
} from "@utils/setting-utils.ts";
import { onMount } from "svelte";
import type { LIGHT_DARK_MODE } from "@/types/config.ts";

// 模式配置
const modeConfig = [
  { 
    id: LIGHT_MODE, 
    icon: "material-symbols:wb-sunny-outline-rounded",
    label: I18nKey.lightMode 
  },
  { 
    id: DARK_MODE, 
    icon: "material-symbols:dark-mode-outline-rounded",
    label: I18nKey.darkMode 
  },
  { 
    id: AUTO_MODE, 
    icon: "material-symbols:radio-button-partial-outline",
    label: I18nKey.systemMode 
  }
];

// 模式序列
const seq = modeConfig.map(config => config.id);
let mode: LIGHT_DARK_MODE = $state(AUTO_MODE);

// 面板元素引用
let panelElement: HTMLElement | null = null;

onMount(() => {
  // 从存储中获取主题模式
  mode = getStoredTheme();
  
  // 监听系统主题变化
  const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
  
  // 系统主题变化时的处理函数
  const handleSystemThemeChange = () => {
    applyThemeToDocument(mode);
  };
  
  // 添加事件监听器
  darkModePreference.addEventListener("change", handleSystemThemeChange);
  
  // 清理函数：移除事件监听器
  return () => {
    darkModePreference.removeEventListener("change", handleSystemThemeChange);
  };
});

// 切换主题模式
function switchScheme(newMode: LIGHT_DARK_MODE) {
  mode = newMode;
  setTheme(newMode);
}

// 循环切换主题模式
function toggleScheme() {
  const currentIndex = seq.indexOf(mode);
  switchScheme(seq[(currentIndex + 1) % seq.length]);
}

// 显示模式选择面板
function showPanel() {
  if (panelElement) {
    panelElement.classList.remove("float-panel-closed");
  }
}

// 隐藏模式选择面板
function hidePanel() {
  if (panelElement) {
    panelElement.classList.add("float-panel-closed");
  }
}

// 键盘事件处理
function handleKeyDown(e: KeyboardEvent, action: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    action();
    e.preventDefault();
  }
}
</script>

<!-- 主容器 -->
<div class="relative z-50" role="menu" tabindex="-1" on:mouseleave={hidePanel}>
  <!-- 模式切换按钮 -->
  <button 
    aria-label="Light/Dark Mode" 
    role="menuitem" 
    class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90" 
    id="scheme-switch" 
    on:click={toggleScheme} 
    on:keydown={(e) => handleKeyDown(e, toggleScheme)}
    on:mouseenter={showPanel}
    aria-expanded={panelElement && !panelElement.classList.contains("float-panel-closed")}
  >
    <!-- 动态渲染图标 -->
    {#each modeConfig as config}
      <div class="absolute" class:opacity-0={mode !== config.id}>
        <Icon icon={config.icon} class="text-[1.25rem]"></Icon>
      </div>
    {/each}
  </button>

  <!-- 模式选择面板 -->
  <div 
    id="light-dark-panel" 
    bind:this={panelElement}
    class="hidden lg:block absolute transition float-panel-closed top-11 -right-2 pt-5"
  >
    <div class="card-base float-panel p-2">
      <!-- 动态渲染模式选项 -->
      {#each modeConfig as config}
        <button 
          class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
          class:current-theme-btn={mode === config.id}
          on:click={() => switchScheme(config.id)}
          on:keydown={(e) => handleKeyDown(e, () => switchScheme(config.id))}
          role="menuitemradio"
          aria-checked={mode === config.id}
        >
          <Icon icon={config.icon} class="text-[1.25rem] mr-3"></Icon>
          {i18n(config.label)}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  /* 添加过渡效果 */
  .float-panel-closed {
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
  }
  
  /* 添加悬停效果 */
  .btn-plain:hover {
    background-color: var(--btn-plain-bg-hover);
  }
  
  /* 当前主题按钮样式 */
  .current-theme-btn {
    background-color: var(--btn-plain-bg-active);
  }
</style>
