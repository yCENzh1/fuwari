<script lang="ts">
import { onMount } from "svelte";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrlBySlug } from "../utils/url-utils";

// 组件属性定义
export let tags: string[] = []; // 标签过滤参数
export let categories: string[] = []; // 分类过滤参数
export let sortedPosts: Post[] = []; // 排序后的文章列表

// 定义文章数据结构
interface Post {
  slug: string;
  data: {
    title: string;
    tags: string[];
    category?: string; // 可选分类
    published: Date;
  };
}

// 年份分组结构
interface Group {
  year: number;
  posts: Post[];
}

// 存储分组后的文章数据
let groups: Group[] = [];

// 页面加载时处理URL参数和文章过滤
onMount(() => {
  // 从URL参数中获取过滤条件
  const params = new URLSearchParams(window.location.search);
  tags = params.has("tag") ? params.getAll("tag") : [];
  categories = params.has("category") ? params.getAll("category") : [];
  const uncategorized = params.get("uncategorized") === "true";

  // 初始使用传入的排序文章
  let filteredPosts = [...sortedPosts];

  // 根据标签过滤文章
  if (tags.length > 0) {
    filteredPosts = filteredPosts.filter(post => 
      Array.isArray(post.data.tags) && 
      post.data.tags.some(tag => tags.includes(tag))
    );
  }

  // 根据分类过滤文章
  if (categories.length > 0) {
    filteredPosts = filteredPosts.filter(post => 
      post.data.category && categories.includes(post.data.category)
    );
  }

  // 过滤未分类的文章
  if (uncategorized) {
    filteredPosts = filteredPosts.filter(post => !post.data.category);
  }

  // 按年份分组文章
  const groupedByYear = filteredPosts.reduce((acc, post) => {
    const year = post.data.published.getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {} as Record<number, Post[]>);

  // 转换为数组并排序（从最新年份到最旧）
  groups = Object.entries(groupedByYear)
    .map(([yearStr, posts]) => ({
      year: parseInt(yearStr),
      posts
    }))
    .sort((a, b) => b.year - a.year); // 降序排序
});

/**
 * 格式化日期为 MM-DD 格式
 * @param date 日期对象
 * @returns 格式化的日期字符串 (如 "05-20")
 */
function formatDate(date: Date): string {
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

/**
 * 格式化标签数组为带#号的字符串
 * @param tagList 标签数组
 * @returns 格式化后的标签字符串 (如 "#技术 #博客")
 */
function formatTag(tagList: string[]): string {
  return tagList.map(t => `#${t}`).join(' ');
}
</script>

<!-- 归档面板主容器 -->
<div class="card-base px-8 py-6">
  {#each groups as group (group.year)}
    <div class="archive-group">
      <!-- 年份标题行 -->
      <div class="flex flex-row w-full items-center h-[3.75rem]">
        <!-- 年份显示 -->
        <div class="year-label">
          {group.year}
        </div>
        
        <!-- 时间线圆点 -->
        <div class="timeline-dot-container">
          <div class="timeline-dot"></div>
        </div>
        
        <!-- 文章数量统计 -->
        <div class="post-count">
          {group.posts.length} {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
        </div>
      </div>

      <!-- 文章列表 -->
      {#each group.posts as post (post.slug)}
        <a
          href={getPostUrlBySlug(post.slug)}
          aria-label={post.data.title}
          class="post-link"
        >
          <div class="post-container">
            <!-- 发布日期 -->
            <div class="post-date">
              {formatDate(post.data.published)}
            </div>

            <!-- 时间线装饰 -->
            <div class="timeline-connector">
              <div class="timeline-dot-interactive"></div>
            </div>

            <!-- 文章标题 -->
            <div class="post-title">
              {post.data.title}
            </div>

            <!-- 标签列表（桌面端显示） -->
            <div class="post-tags">
              {formatTag(post.data.tags)}
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/each}
</div>

<style>
  /* 基础样式 */
  .card-base {
    background: var(--card-bg);
    border-radius: 0.5rem;
    box-shadow: var(--card-shadow);
  }

  /* 年份标签样式 */
  .year-label {
    width: 15%;
    transition: all 0.3s ease;
    text-align: right;
    font-size: 1.5rem; /* text-2xl */
    font-weight: 700; /* font-bold */
    color: var(--text-75); /* text-75 */
  }
  
  @media (min-width: 768px) {
    .year-label {
      width: 10%;
    }
  }

  /* 时间线圆点容器 */
  .timeline-dot-container {
    width: 15%;
  }
  
  @media (min-width: 768px) {
    .timeline-dot-container {
      width: 10%;
    }
  }

  /* 静态时间线圆点 */
  .timeline-dot {
    height: 0.75rem; /* h-3 */
    width: 0.75rem; /* w-3 */
    background: none;
    border-radius: 9999px; /* rounded-full */
    outline: 3px solid var(--primary); /* outline-3 */
    outline-offset: -2px; /* -outline-offset-[2px] */
    z-index: 50;
    margin: 0 auto;
  }

  /* 文章数量统计 */
  .post-count {
    width: 70%;
    transition: all 0.3s ease;
    text-align: left;
    color: var(--text-50); /* text-50 */
  }
  
  @media (min-width: 768px) {
    .post-count {
      width: 80%;
    }
  }

  /* 文章链接样式 */
  .post-link {
    display: block; /* !block */
    height: 2.5rem; /* h-10 */
    width: 100%;
    border-radius: 0.5rem; /* rounded-lg */
    color: inherit;
    text-decoration: none;
  }
  
  .post-link:hover {
    color: initial; /* hover:text-[initial] */
    background: var(--btn-plain-bg-hover);
  }
  
  .post-link:active {
    background: var(--btn-plain-bg-active);
  }

  /* 文章容器 */
  .post-container {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
  }

  /* 文章日期 */
  .post-date {
    width: 15%;
    transition: all 0.3s ease;
    font-size: 0.875rem; /* text-sm */
    text-align: right;
    color: var(--text-50); /* text-50 */
  }
  
  @media (min-width: 768px) {
    .post-date {
      width: 10%;
    }
  }

  /* 时间线连接器 */
  .timeline-connector {
    width: 15%;
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
  }
  
  @media (min-width: 768px) {
    .timeline-connector {
      width: 10%;
    }
  }
  
  /* 虚线时间线 */
  .timeline-connector::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    background-image: linear-gradient(to bottom, var(--neutral-300) 50%, transparent 50%);
    background-size: 1px 8px;
    background-repeat: repeat-y;
  }

  /* 交互式时间线圆点 */
  .timeline-dot-interactive {
    transition: all 0.3s ease;
    margin: 0 auto;
    width: 0.25rem; /* w-1 */
    height: 0.25rem; /* h-1 */
    border-radius: 9999px; /* rounded */
    background: oklch(0.5 0.05 var(--hue)); /* 中性色 */
    outline: 4px solid var(--card-bg); /* outline-4 */
    z-index: 50;
  }
  
  .post-link:hover .timeline-dot-interactive {
    height: 1.25rem; /* group-hover:h-5 */
    background: var(--primary);
    outline-color: var(--btn-plain-bg-hover);
  }
  
  .post-link:active .timeline-dot-interactive {
    outline-color: var(--btn-plain-bg-active);
  }

  /* 文章标题 */
  .post-title {
    width: 70%;
    padding-right: 2rem; /* pr-8 */
    text-align: left;
    font-weight: 700; /* font-bold */
    color: var(--text-75); /* text-75 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.3s ease;
  }
  
  .post-link:hover .post-title {
    transform: translateX(0.25rem); /* group-hover:translate-x-1 */
    color: var(--primary); /* group-hover:text-[var(--primary)] */
  }
  
  @media (min-width: 768px) {
    .post-title {
      max-width: 65%; /* md:max-w-[65%] */
      width: 65%; /* md:w-[65%] */
    }
  }

  /* 文章标签 */
  .post-tags {
    display: none; /* 移动端默认隐藏 */
    width: 15%;
    text-align: left;
    font-size: 0.875rem; /* text-sm */
    transition: all 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-30); /* text-30 */
  }
  
  @media (min-width: 768px) {
    .post-tags {
      display: block; /* 桌面端显示 */
    }
  }
</style>
