<script lang="ts">
import { onMount } from "svelte";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrlBySlug } from "../utils/url-utils";

// 组件属性定义
export let tags: string[] = [];
export let categories: string[] = [];
export let sortedPosts: Post[] = [];

// 文章数据结构
interface Post {
  slug: string;
  data: {
    title: string;
    tags: string[];
    category?: string;
    published: Date;
  };
}

// 年份分组结构
interface Group {
  year: number;
  posts: Post[];
}

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
    .sort((a, b) => b.year - a.year);
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

<!-- 归档面板主容器 - 保留原有样式 -->
<div class="card-base px-8 py-6">
  {#each groups as group (group.year)}
    <div>
      <!-- 年份标题行 -->
      <div class="flex flex-row w-full items-center h-[3.75rem]">
        <!-- 年份显示 -->
        <div class="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75">
          {group.year}
        </div>
        
        <!-- 时间线圆点 - 保留原有样式 -->
        <div class="w-[15%] md:w-[10%]">
          <div class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] 
                mx-auto -outline-offset-[2px] z-50 outline-3">
          </div>
        </div>
        
        <!-- 文章数量统计 -->
        <div class="w-[70%] md:w-[80%] transition text-left text-50">
          {group.posts.length} {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
        </div>
      </div>

      <!-- 文章列表 -->
      {#each group.posts as post (post.slug)}
        <a
          href={getPostUrlBySlug(post.slug)}
          aria-label={post.data.title}
          class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
        >
          <div class="flex flex-row justify-start items-center h-full">
            <!-- 发布日期 -->
            <div class="w-[15%] md:w-[10%] transition text-sm text-right text-50">
              {formatDate(post.data.published)}
            </div>

            <!-- 时间线连接器 - 保留原有虚线样式 -->
            <div class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center">
              <!-- 交互式时间线圆点 -->
              <div
                class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                       bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                       outline outline-4 z-50
                       outline-[var(--card-bg)]
                       group-hover:outline-[var(--btn-plain-bg-hover)]
                       group-active:outline-[var(--btn-plain-bg-active)]"
              ></div>
            </div>

            <!-- 文章标题 -->
            <div
              class="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold
                     group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                     text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden"
            >
              {post.data.title}
            </div>

            <!-- 标签列表（桌面端显示） -->
            <div
              class="hidden md:block md:w-[15%] text-left text-sm transition
                     whitespace-nowrap overflow-ellipsis overflow-hidden text-30"
            >
              {formatTag(post.data.tags)}
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/each}
</div>

<style>
  /* 时间线连接器样式 - 保留原有虚线效果 */
  .dash-line::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    background-image: linear-gradient(to bottom, 
      var(--neutral-300) 50%, 
      transparent 50%);
    background-size: 1px 8px;
    background-repeat: repeat-y;
    z-index: 10;
  }
  
  /* 最后一个年份组中的最后一个文章不需要完整的时间线 */
  :global(:last-child) :global(:last-child) .dash-line::before {
    height: 50%; /* 只显示上半部分 */
    top: 0;
  }
  
  /* 第一个年份组中的第一个文章的时间线调整 */
  :global(:first-child) :global(:first-child) .dash-line::before {
    height: 50%; /* 只显示下半部分 */
    top: 50%;
  }
</style>
