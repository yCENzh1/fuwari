<script lang="ts">
import { onMount } from "svelte";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrlBySlug } from "../utils/url-utils";

export let tags: string[] = [];
export let categories: string[] = [];
export let sortedPosts: Post[] = [];

let groups: Group[] = [];

// 初始化参数
let uncategorized = false;

// 在 onMount 中安全访问 window 对象
onMount(() => {
  const params = new URLSearchParams(window.location.search);
  uncategorized = params.get("uncategorized") === "true";
  
  // 初始调用过滤函数
  filterAndGroupPosts();
});

// 类型定义保持不变
interface Post {
  slug: string;
  data: {
    title: string;
    tags: string[];
    category?: string;
    published: Date;
  };
}

interface Group {
  year: number;
  posts: Post[];
}

// 日期格式化 - 保持原始格式
function formatDate(date: Date) {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${month}-${day}`;
}

// 标签格式化 - 保持原始格式
function formatTag(tagList: string[]) {
  return tagList.map((t) => `#${t}`).join(" ");
}

// 核心逻辑优化但保持功能不变
const filterAndGroupPosts = () => {
  if (sortedPosts.length === 0) {
    groups = [];
    return;
  }
  
  let filteredPosts = [...sortedPosts];

  // 标签过滤
  if (tags.length > 0) {
    filteredPosts = filteredPosts.filter(
      (post) =>
        Array.isArray(post.data.tags) &&
        post.data.tags.some((tag) => tags.includes(tag))
    );
  }

  // 分类过滤
  if (categories.length > 0) {
    filteredPosts = filteredPosts.filter(
      (post) => post.data.category && categories.includes(post.data.category)
    );
  }

  // 未分类过滤
  if (uncategorized) {
    filteredPosts = filteredPosts.filter((post) => !post.data.category);
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

  // 转换为数组并排序
  groups = Object.entries(grouped)
    .map(([year, posts]) => ({
      year: parseInt(year, 10),
      posts
    }))
    .sort((a, b) => b.year - a.year);
};

// 响应式处理
$: {
  filterAndGroupPosts();
}
</script>

<!-- 完全保持原始UI结构 -->
<div class="card-base px-8 py-6">
  {#each groups as group}
    <div>
      <div class="flex flex-row w-full items-center h-[3.75rem]">
        <div class="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75">
          {group.year}
        </div>
        <div class="w-[15%] md:w-[10%]">
          <div
            class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto
                  -outline-offset-[2px] z-50 outline-3"
          ></div>
        </div>
        <div class="w-[70%] md:w-[80%] transition text-left text-50">
          {group.posts.length} {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
        </div>
      </div>

      {#each group.posts as post}
        <a
          href={getPostUrlBySlug(post.slug)}
          aria-label={post.data.title}
          class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
        >
          <div class="flex flex-row justify-start items-center h-full">
            <!-- 日期 -->
            <div class="w-[15%] md:w-[10%] transition text-sm text-right text-50">
              {formatDate(post.data.published)}
            </div>

            <!-- 点线 -->
            <div class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center">
              <div
                class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                       bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                       outline outline-4 z-50
                       outline-[var(--card-bg)]
                       group-hover:outline-[var(--btn-plain-bg-hover)]
                       group-active:outline-[var(--btn-plain-bg-active)]"
              ></div>
            </div>

            <!-- 标题 -->
            <div
              class="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold
                     group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                     text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden"
            >
              {post.data.title}
            </div>

            <!-- 标签 -->
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
