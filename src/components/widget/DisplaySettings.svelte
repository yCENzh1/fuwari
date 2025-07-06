<script lang="ts">
  import I18nKey from "@i18n/i18nKey";
  import { i18n } from "@i18n/translation";
  import Icon from "@iconify/svelte";
  import { getDefaultHue, getHue, setHue } from "@utils/setting-utils";
  import { onMount } from "svelte";
  
  // 使用整数避免小数计算导致的性能问题
  let immediateHue = Math.round(getHue());
  let appliedHue = immediateHue;
  const defaultHue = getDefaultHue();
  
  // 自定义节流函数
  let throttleTimeout: ReturnType<typeof setTimeout> | null = null;
  function applyHueThrottled(hue: number) {
    if (throttleTimeout) {
      clearTimeout(throttleTimeout);
    }
    
    throttleTimeout = setTimeout(() => {
      appliedHue = hue;
      setHue(hue);
      throttleTimeout = null;
    }, 300);
  }
  
  // 重置色调到默认值
  function resetHue() {
    immediateHue = defaultHue;
    applyHueThrottled(defaultHue);
  }
  
  // 处理滑块输入事件
  function handleInput(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value);
    immediateHue = value;
    applyHueThrottled(value);
  }
  
  // 初始化色调
  onMount(() => {
    applyHueThrottled(immediateHue);
  });
</script>

<div 
  id="display-setting" 
  class="float-panel float-panel-closed absolute transition-all w-80 right-4 px-4 py-4"
  style="z-index: 100; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 12px; background: var(--card-bg); transform-origin: top right;"
>
  <!-- 标题区域 -->
  <div class="flex flex-row gap-2 mb-3 items-center justify-between">
    <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
        before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
        before:absolute before:-left-3 before:top-[0.33rem]">
      {i18n(I18nKey.themeColor)}
      <button 
        aria-label={i18n(I18nKey.resetToDefault)}
        class="btn-regular w-7 h-7 rounded-md transition-all duration-300
               opacity-{immediateHue === defaultHue ? 0 : 100} 
               pointer-events-{immediateHue === defaultHue ? 'none' : 'auto'}"
        on:click={resetHue}
      >
        <div class="text-[var(--btn-content)]">
          <Icon icon="fa6-solid:arrow-rotate-left" class="text-[0.875rem]" />
        </div>
      </button>
    </div>
    
    <!-- 色调值显示 -->
    <div class="flex gap-1">
      <div 
        id="hueValue" 
        class="transition-all duration-300 bg-[var(--btn-regular-bg)] w-10 h-7 rounded-md 
               flex justify-center font-bold text-sm items-center text-[var(--btn-content)]"
      >
        {immediateHue}
      </div>
    </div>
  </div>
  
  <!-- 色调滑块 - 优化性能 -->
  <div class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none">
    <input 
      aria-label={i18n(I18nKey.themeColor)} 
      type="range" 
      min="0" 
      max="360" 
      value={immediateHue}
      on:input={handleInput}
      class="slider" 
      id="colorSlider" 
      step="5" 
      style="width: 100%"
    />
  </div>
</div>

<style>
  /* 优化后的滑块样式 - 更轻量 */
  #display-setting input[type="range"] {
    -webkit-appearance: none;
    height: 1.5rem;
    background-image: var(--color-selection-bar);
    background-color: transparent;
    cursor: pointer;
    margin: 0;
    padding: 0;
  }

  /* 滑块按钮样式 - 简化版本 */
  #display-setting input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 1rem;
    width: 0.5rem;
    border-radius: 0.125rem;
    background: rgba(255, 255, 255, 0.7);
    box-shadow: none;
  }
  
  #display-setting input[type="range"]::-webkit-slider-thumb:hover {
    background: rgba(255, 255, 255, 0.8);
  }
  
  #display-setting input[type="range"]::-webkit-slider-thumb:active {
    background: rgba(255, 255, 255, 0.6);
    transform: scale(1.1);
  }
  
  #display-setting input[type="range"]::-moz-range-thumb {
    -webkit-appearance: none;
    height: 1rem;
    width: 0.5rem;
    border-radius: 0.125rem;
    border-width: 0;
    background: rgba(255, 255, 255, 0.7);
    box-shadow: none;
  }
  
  #display-setting input[type="range"]::-moz-range-thumb:hover {
    background: rgba(255, 255, 255, 0.8);
  }
  
  #display-setting input[type="range"]::-moz-range-thumb:active {
    background: rgba(255, 255, 255, 0.6);
    transform: scale(1.1);
  }
  
  /* 添加悬停状态反馈 */
  #display-setting input[type="range"]:hover::-webkit-slider-thumb {
    background: rgba(255, 255, 255, 0.8);
  }
  
  #display-setting input[type="range"]:active::-webkit-slider-thumb {
    background: rgba(255, 255, 255, 0.6);
    transform: scale(1.1);
  }
</style>
