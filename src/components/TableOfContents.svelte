<script>
  import { onMount, onDestroy } from 'svelte';

  // 接收从 Astro 传递过来的 headings 数据
  export let headings = [];

  // 获取所有标题级别 (h1-h6)
  $: filteredHeadings = headings.filter(heading => heading.depth >= 1 && heading.depth <= 6);

  let tocContentEl;
  let tocArrowEl;
  let tocToggleEl;
  let isExpanded = false; // 用于控制展开/收起状态
  let tocObserver;

  // Svelte 的 onMount 等同于 DOMContentLoaded，在组件挂载后执行
  onMount(() => {
    // 高亮当前阅读位置的逻辑
    const observeHeadings = () => {
      const pageHeadings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
      const tocLinks = document.querySelectorAll('.toc-link');
      
      if (pageHeadings.length === 0 || tocLinks.length === 0) return;

      tocObserver = new IntersectionObserver((entries) => {
        let activeId = '';
        
        // 找到视口中最靠上的可见标题
        const visibleHeadings = entries.filter(e => e.isIntersecting);
        if (visibleHeadings.length > 0) {
            // 按文档顺序排序，取第一个
            visibleHeadings.sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
            activeId = visibleHeadings[0].target.id;
        }

        tocLinks.forEach(link => {
          const headingId = link.getAttribute('data-heading-id');
          if (headingId === activeId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }, {
        rootMargin: '0px 0px -80% 0px', // 从屏幕顶部到下方20%区域内都算
        threshold: 0
      });
      
      pageHeadings.forEach(heading => tocObserver.observe(heading));
    };

    // 延迟执行以确保其他 DOM 元素加载完毕
    const timeoutId = setTimeout(observeHeadings, 100);

    // Astro 页面切换时，重新执行高亮逻辑
    document.addEventListener('astro:page-load', observeHeadings);

    // 组件销毁时，清理监听器和定时器
    return () => {
      if (tocObserver) {
        tocObserver.disconnect();
      }
      clearTimeout(timeoutId);
      document.removeEventListener('astro:page-load', observeHeadings);
    };
  });

  // 展开/收起目录
  function toggleToc() {
    isExpanded = !isExpanded;
  }
</script>

{#if filteredHeadings.length > 0}
  <div class="mb-5 rounded-[var(--radius-large)] overflow-hidden bg-black/5 dark:bg-white/5 backdrop-blur-sm">
    <!-- 目录标题栏 -->
    <button 
      bind:this={tocToggleEl}
      class="toc-toggle w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      type="button"
      on:click={toggleToc}
    >
      <span class="flex items-center gap-2">
        <div class="h-5 w-5 rounded-md bg-black/10 dark:bg-white/10 text-black/50 dark:text-white/50 flex items-center justify-center">
          📋
        </div>
        目录
      </span>
      <span bind:this={tocArrowEl} class="toc-arrow text-xs text-black/50 dark:text-white/50 transition-transform duration-300 ease-in-out" class:rotated={isExpanded}>
        ▼
      </span>
    </button>
    
    <!-- 目录内容 -->
    <div bind:this={tocContentEl} class="toc-content max-h-0 overflow-y-auto px-4 border-t border-black/10 dark:border-white/10 transition-all duration-300 ease-in-out" class:expanded={isExpanded}>
      <nav class="pt-3 pb-4">
        {#each filteredHeadings as heading (heading.slug)}
          {@const indentClass = 
            heading.depth === 1 ? '' :
            heading.depth === 2 ? 'ml-2' :
            heading.depth === 3 ? 'ml-4' :
            heading.depth === 4 ? 'ml-6' :
            heading.depth === 5 ? 'ml-8' : 'ml-10'
          }
          {@const sizeClass = 
            heading.depth === 1 ? 'text-sm font-bold' :
            heading.depth === 2 ? 'text-sm font-medium' :
            heading.depth === 3 ? 'text-xs font-medium' :
            'text-xs'
          }
          <a
            href={`#${heading.slug}`}
            class={`toc-link block py-2 text-black/60 dark:text-white/60 hover:text-[var(--primary)] transition-colors ${indentClass} ${sizeClass}`}
            data-heading-id={heading.slug}
          >
            {heading.text}
          </a>
        {/each}
      </nav>
    </div>
  </div>
{/if}

<style>
  .toc-link.active {
    color: var(--primary);
    font-weight: 600;
  }
  
  .toc-content.expanded {
    max-height: 80vh;
  }
  
  .toc-arrow.rotated {
    transform: rotate(180deg);
  }
  
  /* 滚动条样式 (与原版相同) */
  .toc-content::-webkit-scrollbar {
    width: 4px;
  }
  .toc-content::-webkit-scrollbar-track {
    background: transparent;
  }
  .toc-content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
  .dark .toc-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }
  .toc-content::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.4);
  }
  .dark .toc-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
</style>