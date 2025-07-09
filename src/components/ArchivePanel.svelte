<script lang="ts">
import { onMount } from "svelte";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrlBySlug } from "../utils/url-utils";

// 定义文章接口
export interface Post {
  slug: string;
  data: {
    title: string;
    tags: string[];
    category?: string;
    published: Date;
  };
}

// 年份分组接口
interface YearGroup {
  year: number;
  posts: Post[];
}

// 组件接收的属性
export let sortedPosts: Post[] = [];
let groups: YearGroup[] = [];

// 安全访问URL参数（兼容SSR）
const getURLParams = () => {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
};

// 日期格式化工具
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit"
  }).replace(/\//, "-");
};

// 标签格式化工具
const formatTags = (tags: string[]) => {
  return tags.map(tag => `#${tag}`).join(" ");
};

// 文章分组函数
const groupPostsByYear = (posts: Post[]): YearGroup[] => {
  // 使用Map提高分组效率
  const yearMap = new Map<number, Post[]>();
  
  posts.forEach(post => {
    const year = post.data.published.getFullYear();
    if (!yearMap.has(year)) {
      yearMap.set(year, []);
    }
    yearMap.get(year)?.push(post);
  });
  
  // 转换为数组并按年份降序排序
  return Array.from(yearMap, ([year, posts]) => ({ year, posts }))
    .sort((a, b) => b.year - a.year);
};

// 文章过滤函数
const filterPosts = (posts: Post[]) => {
  const params = getURLParams();
  const tags = params.getAll("tag");
  const categories = params.getAll("category");
  const uncategorized = params.has("uncategorized");

  return posts.filter(post => {
    // 标签过滤
    if (tags.length > 0 && !post.data.tags?.some(tag => tags.includes(tag))) {
      return false;
    }
    
    // 分类过滤
    if (categories.length > 0 && !categories.includes(post.data.category || "")) {
      return false;
    }
    
    // 未分类过滤
    if (uncategorized && post.data.category) {
      return false;
    }
    
    return true;
  });
};

// 组件挂载时处理数据
onMount(() => {
  const filteredPosts = filterPosts(sortedPosts);
  groups = groupPostsByYear(filteredPosts);
});
</script>

<div class="card-base px-8 py-6">
  {#each groups as group (group.year)}
    <!-- 年份分组标题 -->
    <div class="year-group">
      <div class="flex flex-row w-full items-center h-[3.75rem]">
        <!-- 年份 -->
        <div class="w-[15%] md:w-[10%] text-2xl font-bold text-right text-75">
          {group.year}
        </div>
        
        <!-- 年份标记点 -->
        <div class="w-[15%] md:w-[10%]">
          <div class="year-dot"></div>
        </div>
        
        <!-- 文章数量 -->
        <div class="w-[70%] md:w-[80%] text-left text-50">
          {group.posts.length} 
          {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
        </div>
      </div>

      <!-- 文章列表 -->
      {#each group.posts as post (post.slug)}
        <a
          href={getPostUrlBySlug(post.slug)}
          aria-label={post.data.title}
          class="post-item group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
        >
          <div class="flex flex-row justify-start items-center h-full">
            <!-- 发布日期 -->
            <div class="w-[15%] md:w-[10%] text-sm text-right text-50">
              {formatDate(post.data.published)}
            </div>

            <!-- 装饰线及悬停点 -->
            <div class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center">
              <div class="post-dot"></div>
            </div>

            <!-- 文章标题 -->
            <div class="post-title">
              {post.data.title}
            </div>

            <!-- 标签列表（大屏显示） -->
            <div class="hidden md:block md:w-[15%] text-left text-sm whitespace-nowrap overflow-ellipsis overflow-hidden text-30">
              {formatTags(post.data.tags)}
            </div>
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <!-- 无数据提示 -->
    <div class="text-center py-10 text-50">
      {i18n(I18nKey.noPosts)}
    </div>
  {/each}
</div>

<style>
  /* 年份标记点样式 */
  .year-dot {
    height: 12px;
    width: 12px;
    background: none;
    border-radius: 9999px;
    outline: 3px solid rgb(var(--primary));
    outline-offset: -2px;
    margin: 0 auto;
    z-index: 50;
  }

  /* 文章装饰点样式 */
  .post-dot {
    margin: 0 auto;
    width: 4px;
    height: 4px;
    border-radius: 9999px;
    background: oklch(0.5 0.05 var(--hue));
    outline: 4px solid rgb(var(--card-bg));
    z-index: 50;
    transition: all 0.2s ease;
  }

  /* 文章项悬停效果 */
  .post-item:hover .post-dot {
    height: 20px;
    background: rgb(var(--primary));
    outline-color: rgb(var(--btn-plain-bg-hover));
  }

  .post-item:active .post-dot {
    outline-color: rgb(var(--btn-plain-bg-active));
  }

  /* 文章标题样式 */
  .post-title {
    width: 70%;
    max-width: 65%;
    padding-right: 2rem;
    text-align: left;
    font-weight: bold;
    color: rgb(var(--text-75));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.2s ease;
  }

  .post-item:hover .post-title {
    transform: translateX(0.25rem);
    color: rgb(var(--primary));
  }

  /* 年份分组间距 */
  .year-group + .year-group {
    margin-top: 2rem;
  }

  /* 装饰线效果 */
  .dash-line::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      transparent 20%,
      rgb(var(--border-color)) 20%,
      rgb(var(--border-color)) 80%,
      transparent 80%,
      transparent 100%
    );
    z-index: 10;
  }
</style>
