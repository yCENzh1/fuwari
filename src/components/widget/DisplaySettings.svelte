<script lang="ts">
  import I18nKey from "@i18n/i18nKey";
  import { i18n } from "@i18n/translation";
  import Icon from "@iconify/svelte";
  import { getDefaultHue, getHue, setHue } from "@utils/setting-utils";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  
  // 使用缓动动画管理色调值变化
  let hueValue = tweened(getHue(), {
    duration: 300,
    easing: cubicOut
  });
  
  const defaultHue = getDefaultHue();
  
  // 重置色调到默认值
  function resetHue() {
    hueValue.set(defaultHue);
  }
  
  // 监听色调值变化并应用
  $: {
    const currentHue = $hueValue;
    setHue(currentHue);
  }
</script>

<div 
  id="display-setting" 
  class="float-panel float-panel-closed absolute transition-all w-80 right-4 px-4 py-4"
  in:fly={{ y: 20, duration: 300, easing: cubicOut }}
  out:fly={{ y: 20, duration: 200, easing: cubicOut }}
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
               opacity-{$hueValue === defaultHue ? 0 : 100} 
               pointer-events-{$hueValue === defaultHue ? 'none' : 'auto'}"
        on:click={resetHue}
      >
        <div class="text-[var(--btn-content)] transition-transform hover:scale-110">
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
        {$hueValue}
      </div>
    </div>
  </div>
  
  <!-- 色调滑块 -->
  <div class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none">
    <input 
      aria-label={i18n(I18nKey.themeColor)} 
      type="range" 
      min="0" 
      max="360" 
      bind:value={$hueValue}
      class="slider" 
      id="colorSlider" 
      step="5" 
      style="width: 100%"
    />
  </div>
</div>

<style lang="stylus">
  #display-setting
    z-index: 100
    box-shadow: 0 10px 25px rgba(0,0,0,0.1)
    border-radius: 12px
    background: var(--card-bg)
    transform-origin: top right
    
    input[type="range"]
      -webkit-appearance: none
      height: 1.5rem
      background-image: var(--color-selection-bar)
      transition: background-image 0.3s ease-in-out
      cursor: pointer
      
      /* 滑块轨道 */
      &::-webkit-slider-runnable-track
        height: 0.25rem
        border-radius: 0.125rem
        background: rgba(0,0,0,0.1)
        transition: all 0.3s ease
        
      &::-moz-range-track
        height: 0.25rem
        border-radius: 0.125rem
        background: rgba(0,0,0,0.1)
        transition: all 0.3s ease

      /* 滑块按钮 */
      &::-webkit-slider-thumb
        -webkit-appearance: none
        height: 1rem
        width: 0.5rem
        border-radius: 0.25rem
        background: rgba(255, 255, 255, 0.9)
        box-shadow: 0 2px 5px rgba(0,0,0,0.2)
        transform: scale(1)
        transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)
        cursor: grab
        
        &:hover
          background: rgba(255, 255, 255, 0.95)
          transform: scale(1.1)
          
        &:active
          background: rgba(255, 255, 255, 0.85)
          transform: scale(0.95)
          cursor: grabbing
          box-shadow: 0 1px 3px rgba(0,0,0,0.2)

      &::-moz-range-thumb
        -webkit-appearance: none
        height: 1rem
        width: 0.5rem
        border-radius: 0.25rem
        border-width: 0
        background: rgba(255, 255, 255, 0.9)
        box-shadow: 0 2px 5px rgba(0,0,0,0.2)
        transform: scale(1)
        transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)
        cursor: grab
        
        &:hover
          background: rgba(255, 255, 255, 0.95)
          transform: scale(1.1)
          
        &:active
          background: rgba(255, 255, 255, 0.85)
          transform: scale(0.95)
          cursor: grabbing
          box-shadow: 0 1px 3px rgba(0,0,0,0.2)
</style>
