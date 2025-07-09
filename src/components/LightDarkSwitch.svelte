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

// 主题模式序列（循环切换顺序）
const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];
// 当前主题模式（响应式状态）
let mode: LIGHT_DARK_MODE = $state(AUTO_MODE);
// 控制主题面板的显示状态（响应式）
let panelVisible = $state(false);

// 主题选项配置（用于渲染按钮）
const themeOptions = [
    {
        mode: LIGHT_MODE,
        icon: "material-symbols:wb-sunny-outline-rounded",
        textKey: I18nKey.lightMode,
    },
    {
        mode: DARK_MODE,
        icon: "material-symbols:dark-mode-outline-rounded",
        textKey: I18nKey.darkMode,
    },
    {
        mode: AUTO_MODE,
        icon: "material-symbols:radio-button-partial-outline",
        textKey: I18nKey.systemMode,
    },
];

// 组件挂载时初始化
onMount(() => {
    // 1. 从存储中获取主题设置
    mode = getStoredTheme();
    
    // 2. 监听系统主题变化（用于自动模式）
    const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
    
    // 系统主题变化时的处理函数
    const handleSystemThemeChange = () => {
        if (mode === AUTO_MODE) {
            applyThemeToDocument(mode);
        }
    };
    
    // 添加监听
    darkModePreference.addEventListener("change", handleSystemThemeChange);
    
    // 组件卸载时清理监听器
    return () => {
        darkModePreference.removeEventListener("change", handleSystemThemeChange);
    };
});

/**
 * 切换主题模式
 * @param newMode - 要切换的新模式
 */
function switchScheme(newMode: LIGHT_DARK_MODE) {
    mode = newMode;
    setTheme(newMode);
    // 切换后自动关闭面板（提升用户体验）
    panelVisible = false;
}

/**
 * 循环切换主题模式
 */
function toggleScheme() {
    const currentIndex = seq.indexOf(mode);
    const nextIndex = (currentIndex + 1) % seq.length;
    switchScheme(seq[nextIndex]);
}

/**
 * 显示主题面板
 */
function showPanel() {
    panelVisible = true;
}

/**
 * 隐藏主题面板
 */
function hidePanel() {
    panelVisible = false;
}
</script>

<!-- 主题切换容器 -->
<div 
    class="relative z-50" 
    role="menu" 
    tabindex="-1" 
    on:mouseleave={hidePanel}
    aria-label="主题切换"
>
    <!-- 主切换按钮 -->
    <button
        aria-label="切换主题模式"
        role="menuitem"
        class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90"
        id="scheme-switch"
        on:click={toggleScheme}
        on:mouseenter={showPanel}
        aria-expanded={panelVisible}
        aria-controls="light-dark-panel"
    >
        <!-- 根据当前模式显示对应图标 -->
        {#each themeOptions as option}
            <div 
                class="absolute transition-opacity duration-200"
                class:opacity-0={mode !== option.mode}
                class:opacity-100={mode === option.mode}
                aria-hidden={mode !== option.mode}
            >
                <Icon 
                    icon={option.icon} 
                    class="text-[1.25rem]" 
                    aria-hidden="true"
                />
            </div>
        {/each}
    </button>

    <!-- 主题选择面板 -->
    <div
        id="light-dark-panel"
        class="hidden lg:block absolute transition-all duration-300 ease-in-out top-11 -right-2 pt-5"
        class:invisible={!panelVisible}
        class:opacity-0={!panelVisible}
        class:opacity-100={panelVisible}
        class:translate-y-2={!panelVisible}
        class:translate-y-0={panelVisible}
        role="menu"
        aria-labelledby="scheme-switch"
    >
        <div class="card-base float-panel p-2 shadow-lg rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {#each themeOptions as option}
                <button
                    class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                    class:current-theme-btn={mode === option.mode}
                    on:click={() => switchScheme(option.mode)}
                    role="menuitemradio"
                    aria-checked={mode === option.mode}
                >
                    <Icon 
                        icon={option.icon} 
                        class="text-[1.25rem] mr-3" 
                        aria-hidden="true"
                    />
                    {i18n(option.textKey)}
                </button>
            {/each}
        </div>
    </div>
</div>

<style>
    /* 添加平滑过渡效果 */
    .float-panel {
        transition: transform 0.3s ease, opacity 0.3s ease;
        transform-origin: top right;
    }
    
    /* 当前选中的主题按钮样式 */
    .current-theme-btn {
        background-color: var(--theme-bg-active);
        color: var(--theme-text-active);
    }
    
    /* 暗色模式适配 */
    .dark .float-panel {
        background-color: #1f2937;
        border-color: #374151;
    }
</style>
