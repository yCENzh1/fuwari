<script lang="ts">
import { onMount } from "svelte";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrlBySlug } from "../utils/url-utils";

// 明确定义类型
type PostData = {
  title: string;
  tags: string[];
  category?: string;
  published: Date;
};

export interface Post {
  slug: string;
  data: PostData;
}

interface Group {
  year: number;
  posts: Post[];
}

export let tags: string[] = [];
export let categories: string[] = [];
export let sortedPosts: Post[] = [];

// 响应式变量
let groups: Group[] = [];

// 初始化参数
const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
const uncategorized = params.get("uncategorized") === "true";

// 提取工具函数
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit"
  }).replace(/\//g, "-");
};

const formatTag = (tagList: string[]): string => {
  return tagList.map(t => `#${t}`).join(" ");
};

// 响应式处理过滤逻辑
$: {
  if (sortedPosts.length === 0) return;
  
  let filteredPosts = [...sortedPosts];

  // 标签过滤
  if (tags.length > 0) {
    filteredPosts = filteredPosts.filter(
      post => post.data.tags?.some(tag => tags.includes(tag))
    );
  }

  // 分类过滤
  if (categories.length > 0) {
    filteredPosts = filteredPosts.filter(
      post => post.data.category && categories.includes(post.data.category)
    );
  }

  // 未分类过滤
  if (uncategorized) {
    filteredPosts = filteredPosts.filter(post => !post.data.category);
  }

  // 按年份分组
  const grouped = filteredPosts.reduce((acc, post) => {
    const year = post.data.published.getFullYear();
    acc[year] = acc[year] || [];
    acc[year].push(post);
    return acc;
  }, {} as Record<number, Post[]>);

  // 转换为数组并排序
  groups = Object.entries(grouped)
    .map(([year, posts]) => ({
      year: parseInt(year, 10),
      posts
    }))
    .sort((a, b) => b.year - a.year);
}
</script>

<div class="card-base px-4 py-6 sm:px-8">
  {#if groups.length === 0}
    <div class="text-center py-10 text-50">
      {i18n(I18nKey.noPostsFound)}
    </div>
  {:else}
    {#each groups as group (group.year)}
      <div class="mb-6 last:mb-0">
        <!-- 年份标题 -->
        <div class="flex items-center h-14 mb-2">
          <div class="w-1/6 md:w-[10%] text-right text-2xl font-bold text-75 pr-2">
            {group.year}
          </div>
          <div class="w-1/6 md:w-[10%] flex justify-center">
            <div class="h-3 w-3 rounded-full bg-transparent outline outline-3 outline-[var(--primary)] -outline-offset-[2px] z-50" />
          </div>
          <div class="w-4/6 md:w-4/5 text-left text-50 pl-2">
            {group.posts.length} {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
          </div>
        </div>

        <!-- 文章列表 -->
        <div class="ml-[16.666%] md:ml-[20%]">
          {#each group.posts as post (post.slug)}
            <a
              href={getPostUrlBySlug(post.slug)}
              aria-label={post.data.title}
              class="group btn-plain !block h-12 w-full rounded-lg hover:text-inherit mb-1 last:mb-0"
            >
              <div class="flex items-center h-full">
                <!-- 日期 -->
                <div class="w-1/6 md:w-[10%] text-right text-sm text-50 pr-2">
                  {formatDate(post.data.published)}
                </div>
                
                <!-- 时间线标记 -->
                <div class="w-1/6 md:w-[10%] flex justify-center relative">
                  <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2" />
                  <div class="transition-all duration-300 w-1 h-1 rounded-full bg-gray-400 group-hover:h-5 group-hover:bg-[var(--primary)] outline outline-4 outline-[var(--card-bg)] group-hover:outline-[var(--btn-plain-bg-hover)] group-active:outline-[var(--btn-plain-bg-active)] z-10" />
                </div>
                
                <!-- 标题 -->
                <div class="w-4/6 md:w-[65%] text-left font-bold text-75 truncate pr-4 transition-all group-hover:translate-x-1 group-hover:text-[var(--primary)]">
                  {post.data.title}
                </div>
                
                <!-- 标签（仅在桌面显示） -->
                <div class="hidden md:block md:w-[15%] text-left text-sm text-30 truncate">
                  {formatTag(post.data.tags || [])}
                </div>
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .dash-line::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    background: linear-gradient(to bottom, 
      transparent 0%, 
      transparent 10%, 
      var(--border-color) 10%, 
      var(--border-color) 90%, 
      transparent 90%, 
      transparent 100%);
    transform: translateX(-50%);
    z-index: 0;
  }
</style>
