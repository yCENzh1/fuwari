<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  
  import I18nKey from "../i18n/i18nKey";
  import { i18n } from "../i18n/translation";
  import { getPostUrlBySlug } from "../utils/url-utils";
  
  // 定义清晰的类型
  export interface Post {
    slug: string;
    data: {
      title: string;
      tags: string[];
      category?: string;
      published: Date;
    };
  }
  
  export interface Group {
    year: number;
    posts: Post[];
  }
  
  export let sortedPosts: Post[] = [];
  
  // 状态管理
  let groups: Group[] = [];
  let isLoading = true;
  let hasResults = false;
  let tags: string[] = [];
  let categories: string[] = [];
  let uncategorized: boolean = false;
  let error: string | null = null;
  
  // 工具函数
  const formatDate = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${month}-${day}`;
  };
  
  const formatTag = (tagList: string[]): string => {
    return tagList.map(t => `#${t}`).join(" ");
  };
  
  // 过滤和分组逻辑
  const filterAndGroupPosts = (): void => {
    try {
      isLoading = true;
      
      // 应用过滤器
      let filteredPosts: Post[] = [...sortedPosts];
      
      if (tags.length > 0) {
        filteredPosts = filteredPosts.filter(
          post => Array.isArray(post.data.tags) &&
          tags.some(tag => post.data.tags.includes(tag))
        );
      }
      
      if (categories.length > 0) {
        filteredPosts = filteredPosts.filter(
          post => post.data.category && categories.includes(post.data.category)
        );
      }
      
      if (uncategorized) {
        filteredPosts = filteredPosts.filter(post => !post.data.category);
      }
      
      // 按年份分组
      const grouped = filteredPosts.reduce(
        (acc, post) => {
          const year = post.data.published.getFullYear();
          if (!acc[year]) {
            acc[year] = [];
          }
          acc[year].push(post);
          return acc;
        },
        {} as Record<number, Post[]>
      );
      
      // 转换为数组并按年份降序排序
      const groupedPostsArray = Object.entries(grouped)
        .map(([yearStr, posts]) => ({
          year: Number.parseInt(yearStr),
          posts
        }))
        .sort((a, b) => b.year - a.year);
      
      groups = groupedPostsArray;
      hasResults = groups.length > 0;
    } catch (e) {
      error = "Failed to load posts. Please try again later.";
      console.error("Error processing posts:", e);
    } finally {
      isLoading = false;
    }
  };
  
  // 响应式处理URL参数
  const handleUrlParams = (): void => {
    if (!browser) return;
    
    const params = new URLSearchParams(window.location.search);
    tags = params.has("tag") ? params.getAll("tag") : [];
    categories = params.has("category") ? params.getAll("category") : [];
    uncategorized = params.get("uncategorized") === "true";
    
    // 更新页面标题以反映筛选条件
    let title = "Archive";
    if (tags.length > 0) title += ` | Tags: ${tags.join(", ")}`;
    if (categories.length > 0) title += ` | Categories: ${categories.join(", ")}`;
    if (uncategorized) title += " | Uncategorized";
    
    document.title = title;
  };
  
  // 监听URL变化
  const initUrlListener = (): void => {
    if (!browser) return;
    
    const updateOnPopState = () => {
      handleUrlParams();
      filterAndGroupPosts();
    };
    
    window.addEventListener("popstate", updateOnPopState);
    
    return () => {
      window.removeEventListener("popstate", updateOnPopState);
    };
  };
  
  // 组件生命周期
  onMount(() => {
    if (!browser) return;
    
    handleUrlParams();
    filterAndGroupPosts();
    initUrlListener();
    
    // 如果URL中有筛选参数，滚动到结果区域
    if (tags.length > 0 || categories.length > 0 || uncategorized) {
      setTimeout(() => {
        const archiveElement = document.querySelector(".archive-panel");
        if (archiveElement) {
          archiveElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  });
  
  // 当sortedPosts变化时重新计算
  $: if (sortedPosts.length > 0) {
    filterAndGroupPosts();
  }
</script>

<style>
  /* 移除了有问题的 @import 语句 */
  .archive-panel {
    background: var(--card-bg);
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 2rem;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  }
  
  .year-group {
    margin-bottom: 2rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .year-header {
    display: flex;
    align-items: center;
    height: 3.75rem;
    margin-bottom: 1rem;
    
    .year-label {
      width: 15%;
      text-align: right;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-75);
      transition: color 0.2s ease;
      
      @media (min-width: 768px) {
        width: 10%;
      }
    }
    
    .year-dot {
      width: 15%;
      display: flex;
      justify-content: center;
      
      @media (min-width: 768px) {
        width: 10%;
      }
      
      .dot {
        height: 0.75rem;
        width: 0.75rem;
        border-radius: 50%;
        background: transparent;
        outline: 3px solid var(--primary);
        outline-offset: -2px;
        z-index: 50;
        transition: all 0.2s ease;
      }
    }
    
    .post-count {
      width: 70%;
      text-align: left;
      color: var(--text-50);
      transition: color 0.2s ease;
      
      @media (min-width: 768px) {
        width: 80%;
      }
    }
  }
  
  .post-item {
    display: block;
    height: 2.5rem;
    border-radius: 0.375rem;
    margin-bottom: 0.5rem;
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--btn-plain-bg-hover);
      text-decoration: none;
    }
    
    &:active {
      background: var(--btn-plain-bg-active);
    }
    
    .post-content {
      display: flex;
      align-items: center;
      height: 100%;
    }
    
    .post-date {
      width: 15%;
      text-align: right;
      font-size: 0.875rem;
      color: var(--text-50);
      transition: color 0.2s ease;
      
      @media (min-width: 768px) {
        width: 10%;
      }
    }
    
    .post-dot {
      width: 15%;
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
      
      @media (min-width: 768px) {
        width: 10%;
      }
      
      &::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 2px;
        background: repeating-linear-gradient(
          to bottom,
          var(--border-color),
          var(--border-color) 2px,
          transparent 2px,
          transparent 4px
        );
        z-index: 10;
      }
      
      .dot {
        margin: 0 auto;
        width: 0.25rem;
        height: 0.25rem;
        border-radius: 50%;
        background: oklch(0.5 0.05 var(--hue));
        outline: 4px solid var(--card-bg);
        z-index: 50;
        transition: all 0.2s ease;
      }
    }
    
    &:hover .post-dot .dot {
      height: 1.25rem;
      background: var(--primary);
      outline-color: var(--btn-plain-bg-hover);
    }
    
    &:active .post-dot .dot {
      outline-color: var(--btn-plain-bg-active);
    }
    
    .post-title {
      width: 70%;
      max-width: 70%;
      text-align: left;
      font-weight: 700;
      color: var(--text-75);
      padding-right: 1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all 0.2s ease;
      
      @media (min-width: 768px) {
        width: 65%;
        max-width: 65%;
      }
    }
    
    &:hover .post-title {
      transform: translateX(0.25rem);
      color: var(--primary);
    }
    
    .post-tags {
      display: none;
      text-align: left;
      font-size: 0.875rem;
      color: var(--text-30);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.2s ease;
      
      @media (min-width: 768px) {
        display: block;
        width: 15%;
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-50);
    
    .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    
    .title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .description {
      margin-bottom: 1.5rem;
    }
    
    .action-btn {
      display: inline-block;
      padding: 0.5rem 1.5rem;
      background: var(--primary);
      color: white;
      border-radius: 0.375rem;
      font-weight: 600;
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--primary-dark);
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
    }
  }
  
  .loading-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3rem;
    
    .spinner {
      width: 3rem;
      height: 3rem;
      border: 4px solid var(--border-color);
      border-top: 4px solid var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
  
  .error-message {
    padding: 2rem;
    text-align: center;
    color: var(--error);
    background: var(--error-bg);
    border-radius: 0.375rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>

<div class="archive-panel">
  {#if isLoading}
    <div class="loading-indicator">
      <div class="spinner" aria-label="Loading posts"></div>
    </div>
  
  {:else if error}
    <div class="error-message">
      <p>{error}</p>
    </div>
  
  {:else if !hasResults}
    <div class="empty-state">
      <div class="icon">📭</div>
      <h3 class="title">{i18n(I18nKey.noPostsFound)}</h3>
      <p class="description">{i18n(I18nKey.noPostsDescription)}</p>
      <a href="?" class="action-btn">{i18n(I18nKey.clearFilters)}</a>
    </div>
  
  {:else}
    {#each groups as group (group.year)}
      <div class="year-group">
        <div class="year-header">
          <div class="year-label">{group.year}</div>
          <div class="year-dot">
            <div class="dot" />
          </div>
          <div class="post-count">
            {group.posts.length} {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
          </div>
        </div>
        
        {#each group.posts as post (post.slug)}
          <a
            href={getPostUrlBySlug(post.slug)}
            aria-label={post.data.title}
            class="post-item"
          >
            <div class="post-content">
              <div class="post-date">{formatDate(post.data.published)}</div>
              
              <div class="post-dot">
                <div class="dot" />
              </div>
              
              <div class="post-title">{post.data.title}</div>
              
              <div class="post-tags">{formatTag(post.data.tags)}</div>
            </div>
          </a>
        {/each}
      </div>
    {/each}
  {/if}
</div>
