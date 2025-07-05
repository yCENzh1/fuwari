<script lang="ts">
  import I18nKey from "@i18n/i18nKey";
  import { i18n } from "@i18n/translation";
  import Icon from "@iconify/svelte";
  import { url } from "@utils/url-utils.ts";
  import { onMount, onDestroy } from "svelte";
  import type { SearchResult } from "@/global";

  // 搜索关键字状态（桌面端和移动端独立）
  let keywordDesktop = "";
  let keywordMobile = "";
  
  // 搜索结果和状态
  let result: SearchResult[] = [];
  let isSearching = false;
  let pagefindLoaded = false;
  let initialized = false;
  let searchError: string | null = null;

  // 模拟搜索结果（用于开发环境）
  const fakeResult: SearchResult[] = [
    {
      url: url("/"),
      meta: { title: "This Is a Fake Search Result" },
      excerpt: "Because the search cannot work in the <mark>dev</mark> environment.",
    },
    {
      url: url("/"),
      meta: { title: "If You Want to Test the Search" },
      excerpt: "Try running <mark>npm build && npm preview</mark> instead.",
    },
  ];

  // 切换搜索面板可见性
  const togglePanel = () => {
    const panel = document.getElementById("search-panel");
    panel?.classList.toggle("float-panel-closed");
    
    // 打开面板时聚焦移动端输入框
    if (!panel?.classList.contains("float-panel-closed")) {
      setTimeout(() => {
        const mobileInput = document.querySelector("#search-bar-inside input");
        (mobileInput as HTMLInputElement)?.focus();
      }, 100);
    }
  };

  // 设置面板可见性（仅限桌面端）
  const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
    if (!isDesktop) return;
    
    const panel = document.getElementById("search-panel");
    if (!panel) return;

    panel.classList.toggle("float-panel-closed", !show);
    
    // 显示面板时聚焦桌面端输入框
    if (show) {
      setTimeout(() => {
        const desktopInput = document.querySelector("#search-bar input");
        (desktopInput as HTMLInputElement)?.focus();
      }, 100);
    }
  };

  // 执行搜索操作
  const search = async (keyword: string, isDesktop: boolean): Promise<void> => {
    if (!keyword) {
      setPanelVisibility(false, isDesktop);
      result = [];
      searchError = null;
      return;
    }

    if (!initialized) return;
    
    isSearching = true;
    searchError = null;

    try {
      let searchResults: SearchResult[] = [];

      // 生产环境使用Pagefind，开发环境使用模拟数据
      if (import.meta.env.PROD && pagefindLoaded && window.pagefind) {
        const response = await window.pagefind.search(keyword);
        searchResults = await Promise.all(
          response.results.map(item => item.data())
        );
      } else if (import.meta.env.DEV) {
        searchResults = fakeResult;
      } else {
        searchResults = [];
        searchError = i18n(I18nKey.searchNotAvailable);
      }

      result = searchResults;
      setPanelVisibility(result.length > 0 || !!searchError, isDesktop);
    } catch (error) {
      console.error("Search error:", error);
      searchError = i18n(I18nKey.searchError);
      result = [];
      setPanelVisibility(true, isDesktop);
    } finally {
      isSearching = false;
    }
  };

  // 初始化搜索功能
  const initializeSearch = () => {
    initialized = true;
    
    // 检查Pagefind是否可用
    pagefindLoaded = typeof window !== "undefined" && 
                     !!window.pagefind && 
                     typeof window.pagefind.search === "function";
    
    console.log("Pagefind status:", pagefindLoaded);
    
    // 执行当前关键词的搜索
    if (keywordDesktop) search(keywordDesktop, true);
    if (keywordMobile) search(keywordMobile, false);
  };

  // 组件挂载时设置搜索功能
  onMount(() => {
    // 开发环境下直接初始化
    if (import.meta.env.DEV) {
      console.log("Development mode: Using mock search data");
      initializeSearch();
      return;
    }

    // 生产环境下等待Pagefind加载事件
    const handlePagefindReady = () => {
      console.log("Pagefind ready");
      initializeSearch();
    };

    const handlePagefindError = () => {
      console.warn("Pagefind load error");
      initializeSearch();
    };

    // 添加事件监听
    document.addEventListener("pagefindready", handlePagefindReady);
    document.addEventListener("pagefindloaderror", handlePagefindError);

    // 设置超时回退
    const fallbackTimer = setTimeout(() => {
      if (!initialized) {
        console.log("Fallback: Initializing search after timeout");
        initializeSearch();
      }
    }, 2000);

    // 组件销毁时清理资源
    return () => {
      document.removeEventListener("pagefindready", handlePagefindReady);
      document.removeEventListener("pagefindloaderror", handlePagefindError);
      clearTimeout(fallbackTimer);
    };
  });

  // 响应式搜索 - 桌面端关键词变化
  $: if (initialized && keywordDesktop) {
    // 添加轻微延迟减少频繁搜索
    const timer = setTimeout(() => search(keywordDesktop, true), 300);
    return () => clearTimeout(timer);
  }

  // 响应式搜索 - 移动端关键词变化
  $: if (initialized && keywordMobile) {
    // 添加轻微延迟减少频繁搜索
    const timer = setTimeout(() => search(keywordMobile, false), 300);
    return () => clearTimeout(timer);
  }
</script>

<!-- 桌面端搜索栏 -->
<div id="search-bar" class="hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
">
  <Icon 
    icon="material-symbols:search" 
    class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"
  />
  <input 
    placeholder="{i18n(I18nKey.search)}" 
    bind:value={keywordDesktop}
    on:focus={() => search(keywordDesktop, true)}
    class="transition-all pl-10 text-sm bg-transparent outline-0
         h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50"
  />
</div>

<!-- 移动端搜索开关 -->
<button 
  on:click={togglePanel} 
  aria-label="Search Panel" 
  id="search-switch"
  class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90"
>
  <Icon icon="material-symbols:search" class="text-[1.25rem]" />
</button>

<!-- 搜索面板 -->
<div 
  id="search-panel" 
  class="float-panel float-panel-closed search-panel absolute md:w-[30rem]
         top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2"
>
  <!-- 移动端搜索栏 -->
  <div id="search-bar-inside" class="flex relative lg:hidden transition-all items-center h-11 rounded-xl
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
  ">
    <Icon 
      icon="material-symbols:search" 
      class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"
    />
    <input 
      placeholder="Search" 
      bind:value={keywordMobile}
      class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
             focus:w-60 text-black/50 dark:text-white/50"
    />
  </div>

  <!-- 搜索结果区域 -->
  <div class="search-results">
    <!-- 加载状态 -->
    {#if isSearching}
      <div class="flex justify-center items-center py-4">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]" />
        <span class="ml-2 text-50">{i18n(I18nKey.searching)}</span>
      </div>
    
    <!-- 错误状态 -->
    {:else if searchError}
      <div class="text-center py-6 text-50">
        <Icon icon="material-symbols:error-outline" class="text-2xl mb-2 text-[var(--error)]" />
        <p>{searchError}</p>
      </div>
    
    <!-- 空状态 -->
    {:else if result.length === 0 && keywordMobile}
      <div class="text-center py-6 text-50">
        <Icon icon="material-symbols:search-off" class="text-2xl mb-2" />
        <p>{i18n(I18nKey.noResults)} "{keywordMobile}"</p>
      </div>
    
    <!-- 搜索结果列表 -->
    {:else}
      {#each result as item}
        <a 
          href={item.url}
          class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
                 rounded-xl text-lg px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]"
        >
          <div class="transition text-90 inline-flex font-bold group-hover:text-[var(--primary)]">
            {item.meta.title}
            <Icon 
              icon="fa6-solid:chevron-right" 
              class="transition text-[0.75rem] translate-x-1 my-auto text-[var(--primary)]" 
            />
          </div>
          <div class="transition text-sm text-50">
            {@html item.excerpt}
          </div>
        </a>
      {/each}
    {/if}
  </div>
</div>

<style>
  /* 基础样式 */
  input:focus {
    outline: 0;
  }
  
  /* 搜索面板样式 */
  .search-panel {
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    z-index: 100;
    background: var(--card-bg);
    transition: transform 0.3s ease, opacity 0.3s ease;
    transform-origin: top right;
  }
  
  /* 浮动面板动画 */
  .float-panel {
    transform: scale(1);
    opacity: 1;
  }
  
  .float-panel-closed {
    transform: scale(0.95);
    opacity: 0;
    pointer-events: none;
  }
  
  /* 缩放动画 */
  .scale-animation {
    transition: transform 0.2s ease;
  }
  
  .scale-animation:active {
    transform: scale(0.9);
  }
  
  /* 搜索加载动画 */
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
