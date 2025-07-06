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

  // 定义主题序列
  const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];
  let mode: LIGHT_DARK_MODE = $state(AUTO_MODE);
  let showPanel = $state(false); // 使用响应式状态控制面板显示
  let isAnimating = $state(false); // 防止动画叠加

  // 组件挂载时初始化主题
  onMount(() => {
    mode = getStoredTheme();
    
    // 监听系统主题变化
    const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
    const changeThemeWhenSchemeChanged = () => {
      applyThemeToDocument(mode);
    };
    
    darkModePreference.addEventListener("change", changeThemeWhenSchemeChanged);
    
    // 清理函数
    return () => {
      darkModePreference.removeEventListener("change", changeThemeWhenSchemeChanged);
    };
  });

  // 切换主题模式
  function switchScheme(newMode: LIGHT_DARK_MODE) {
    if (isAnimating) return;
    
    isAnimating = true;
    mode = newMode;
    setTheme(newMode);
    
    // 300ms后重置动画状态
    setTimeout(() => {
      isAnimating = false;
    }, 300);
  }

  // 循环切换主题
  function toggleScheme() {
    if (isAnimating) return;
    
    const currentIndex = seq.indexOf(mode);
    const nextIndex = (currentIndex + 1) % seq.length;
    switchScheme(seq[nextIndex]);
  }

  // 显示面板（带延迟防误触）
  function handleMouseEnter() {
    if (showPanel) return;
    
    // 添加微小延迟防止鼠标快速划过时触发
    setTimeout(() => {
      showPanel = true;
    }, 50);
  }

  // 隐藏面板
  function handleMouseLeave() {
    showPanel = false;
  }

  // 获取当前模式图标
  const getCurrentIcon = () => {
    if (mode === LIGHT_MODE) return "material-symbols:wb-sunny-outline-rounded";
    if (mode === DARK_MODE) return "material-symbols:dark-mode-outline-rounded";
    return "material-symbols:radio-button-partial-outline";
  };

  // 面板选项配置
  const panelOptions = [
    { mode: LIGHT_MODE, icon: "material-symbols:wb-sunny-outline-rounded", label: I18nKey.lightMode },
    { mode: DARK_MODE, icon: "material-symbols:dark-mode-outline-rounded", label: I18nKey.darkMode },
    { mode: AUTO_MODE, icon: "material-symbols:radio-button-partial-outline", label: I18nKey.systemMode }
  ];
</script>

<style lang="scss">
  /* 添加平滑过渡动画 */
  .icon-transition {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .panel-transition {
    transition: 
      opacity 0.3s ease,
      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .scale-animation {
    transition: transform 0.2s ease;
    
    &:active {
      transform: scale(0.9);
    }
  }
  
  /* 面板动画效果 */
  .float-panel {
    opacity: 0;
    transform: translateY(-10px);
    
    &.open {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* 当前主题按钮样式 */
  .current-theme-btn {
    background: var(--btn-plain-bg-hover);
    color: var(--primary);
  }
  
  /* 悬停效果 */
  .option-btn {
    transition: 
      background-color 0.2s ease,
      color 0.2s ease;
    
    &:hover {
      background: var(--btn-plain-bg-hover);
    }
  }
</style>

<!-- 使用CSS变量控制主题 -->
<div class="relative z-50" role="menu" tabindex="-1" 
     onmouseenter={handleMouseEnter} 
     onmouseleave={handleMouseLeave}>
  
  <!-- 主切换按钮 -->
  <button
    aria-label="Light/Dark Mode"
    role="menuitem"
    class="relative btn-plain scale-animation rounded-lg h-11 w-11"
    id="scheme-switch"
    onclick={toggleScheme}
  >
    <!-- 使用单个图标并添加过渡动画 -->
    <div class="icon-transition">
      <Icon icon={getCurrentIcon()} class="text-[1.25rem] absolute inset-0 m-auto" />
    </div>
    
    <!-- 添加微妙的脉冲动画 -->
    <div 
      class="absolute inset-0 rounded-full bg-current opacity-0 scale-125"
      class:animate-pulse={isAnimating}
      style="animation-duration: 0.6s;"
    ></div>
  </button>

  <!-- 主题选项面板 -->
  <div 
    id="light-dark-panel" 
    class="hidden lg:block absolute panel-transition top-11 -right-2 pt-5"
    class:open={showPanel}
    class:float-panel
    role="menu"
  >
    <div class="card-base p-2 min-w-[160px]">
      {#each panelOptions as option}
        <button
          class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium mb-0.5 option-btn"
          class:current-theme-btn={mode === option.mode}
          on:click={() => switchScheme(option.mode)}
          aria-pressed={mode === option.mode}
          role="menuitemradio"
        >
          <Icon icon={option.icon} class="text-[1.25rem] mr-3" />
          {i18n(option.label)}
        </button>
      {/each}
    </div>
  </div>
</div>
