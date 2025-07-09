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

  // 模式序列，用于循环切换
  const MODE_SEQUENCE: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];
  
  // 响应式状态
  let mode: LIGHT_DARK_MODE = $state(AUTO_MODE);
  let panelVisible = $state(false); // 控制面板显示状态
  
  // 模式对应的图标和文本
  const modeConfig = {
    [LIGHT_MODE]: {
      icon: "material-symbols:wb-sunny-outline-rounded",
      label: i18n(I18nKey.lightMode)
    },
    [DARK_MODE]: {
      icon: "material-symbols:dark-mode-outline-rounded",
      label: i18n(I18nKey.darkMode)
    },
    [AUTO_MODE]: {
      icon: "material-symbols:radio-button-partial-outline",
      label: i18n(I18nKey.systemMode)
    }
  };

  // 组件挂载时初始化
  onMount(() => {
    // 从本地存储获取主题设置
    mode = getStoredTheme();
    
    // 监听系统主题变化
    const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // 只有在自动模式下才响应系统主题变化
      if (mode === AUTO_MODE) {
        applyThemeToDocument(AUTO_MODE);
      }
    };
    
    darkModePreference.addEventListener("change", handleSystemThemeChange);
    
    // 清理函数
    return () => {
      darkModePreference.removeEventListener("change", handleSystemThemeChange);
    };
  });

  // 切换模式
  function switchScheme(newMode: LIGHT_DARK_MODE) {
    mode = newMode;
    setTheme(newMode);
    panelVisible = false; // 切换后关闭面板
  }

  // 循环切换模式
  function toggleScheme() {
    const currentIndex = MODE_SEQUENCE.indexOf(mode);
    const nextIndex = (currentIndex + 1) % MODE_SEQUENCE.length;
    switchScheme(MODE_SEQUENCE[nextIndex]);
  }

  // 切换面板可见性
  function togglePanel() {
    panelVisible = !panelVisible;
  }
</script>

<!-- 主容器，z-50确保面板在其他浮动面板之上 -->
<div
  class="relative z-50"
  role="menu"
  tabindex="-1"
  on:mouseleave={() => panelVisible = false}
>
  <!-- 模式切换按钮 -->
  <button
    aria-label={i18n(I18nKey.toggleTheme)}
    role="menuitem"
    class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90"
    id="scheme-switch"
    on:click={toggleScheme}
    on:mouseenter={() => panelVisible = true}
    aria-expanded={panelVisible}
    aria-controls="light-dark-panel"
  >
    <!-- 使用条件渲染代替多个绝对定位元素 -->
    {#if mode === LIGHT_MODE}
      <Icon
        icon="material-symbols:wb-sunny-outline-rounded"
        class="text-[1.25rem]"
      />
    {:else if mode === DARK_MODE}
      <Icon
        icon="material-symbols:dark-mode-outline-rounded"
        class="text-[1.25rem]"
      />
    {:else}
      <Icon
        icon="material-symbols:radio-button-partial-outline"
        class="text-[1.25rem]"
      />
    {/if}
  </button>

  <!-- 模式选择面板（桌面端显示） -->
  <div
    id="light-dark-panel"
    class="hidden lg:block absolute transition top-11 -right-2 pt-5"
    class:float-panel-closed={!panelVisible}
    role="menu"
    aria-labelledby="scheme-switch"
  >
    <div class="card-base float-panel p-2">
      <!-- 模式选项按钮 - 使用循环减少重复代码 -->
      {#each MODE_SEQUENCE as scheme}
        <button
          class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
          class:current-theme-btn={mode === scheme}
          on:click={() => switchScheme(scheme)}
          aria-current={mode === scheme ? 'true' : 'false'}
        >
          <Icon
            icon={modeConfig[scheme].icon}
            class="text-[1.25rem] mr-3"
          />
          {modeConfig[scheme].label}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  /* 浮动面板动画 */
  .float-panel-closed {
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    pointer-events: none;
  }

  /* 当前主题按钮样式 */
  .current-theme-btn {
    background-color: var(--btn-plain-bg);
    color: var(--primary);
  }

  /* 缩放动画 */
  .scale-animation {
    transition: transform 0.2s ease;
  }

  .scale-animation:active {
    transform: scale(0.95);
  }

  /* 浮动面板样式 */
  .float-panel {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 0.75rem;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    z-index: 100;
  }

  /* 过渡效果 */
  .transition {
    transition: all 0.3s ease;
  }
</style>
