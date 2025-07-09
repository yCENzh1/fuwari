<script lang="ts">
import { onMount } from "svelte";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrlBySlug } from "../utils/url-utils";

// 类型声明
export interface Post {
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

// 组件属性
export let tags: string[] = [];
export let categories: string[] = [];
export let sortedPosts: Post[] = [];

// 内部状态
let groups: Group[] = [];
let uncategorized: boolean = false;

// 工具函数：格式化日期为MM-DD
function formatDate(date: Date) {
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")}`;
}

// 工具函数：格式化标签为#tag1 #tag2
function formatTag(tagList: string[]) {
    return tagList.map(t => `#${t}`).join(" ");
}

// 工具函数：计算分组
function computeGroups(posts: Post[], tags: string[], categories: string[], uncategorized: boolean) {
    // 应用过滤条件
    let filteredPosts = posts.filter(post => {
        // 标签过滤
        const tagMatch = tags.length === 0 || 
            (Array.isArray(post.data.tags) && 
            tags.some(tag => post.data.tags.includes(tag)));
        
        // 分类过滤
        const categoryMatch = categories.length === 0 || 
            (categories.length > 0 && post.data.category && 
            categories.includes(post.data.category));
        
        // 未分类过滤
        const uncategorizedMatch = !uncategorized || 
            (uncategorized && !post.data.category);
        
        return tagMatch && categoryMatch && uncategorizedMatch;
    });

    // 按年份分组
    const grouped = filteredPosts.reduce(
        (acc, post) => {
            const year = post.data.published.getFullYear();
            acc[year] = acc[year] || [];
            acc[year].push(post);
            return acc;
        },
        {} as Record<number, Post[]>
    );

    // 转换为数组并按年份降序排序
    return Object.entries(grouped)
        .map(([year, posts]) => ({
            year: parseInt(year),
            posts
        }))
        .sort((a, b) => b.year - a.year);
}

// 解析URL参数
function parseUrlParams() {
    if (typeof window === 'undefined') return; // SSR安全
    
    const params = new URLSearchParams(window.location.search);
    return {
        tags: params.has("tag") ? params.getAll("tag") : [],
        categories: params.has("category") ? params.getAll("category") : [],
        uncategorized: params.has("uncategorized")
    };
}

// 响应式计算分组
$: {
    const params = parseUrlParams();
    if (params) {
        tags = params.tags;
        categories = params.categories;
        uncategorized = params.uncategorized;
        
        groups = computeGroups(sortedPosts, tags, categories, uncategorized);
    }
}
</script>

<div class="card-base px-8 py-6">
    {#each groups as group (group.year)}
        <div class="group-container">
            <!-- 年份标题行 -->
            <div class="flex flex-row w-full items-center h-[3.75rem]">
                <div class="w-[15%] md:w-[10%] text-2xl font-bold text-right text-75">
                    {group.year}
                </div>
                
                <div class="w-[15%] md:w-[10%] flex justify-center">
                    <div class="timeline-dot"></div>
                </div>
                
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
                    class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
                >
                    <div class="flex flex-row items-center h-full">
                        <!-- 日期 -->
                        <div class="w-[15%] md:w-[10%] text-sm text-right text-50">
                            {formatDate(post.data.published)}
                        </div>
                        
                        <!-- 时间线标记 -->
                        <div class="w-[15%] md:w-[10%] relative dash-line flex items-center h-full">
                            <div class="timeline-marker"></div>
                        </div>
                        
                        <!-- 标题 -->
                        <div class="post-title">
                            {post.data.title}
                        </div>
                        
                        <!-- 标签 -->
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
    .timeline-dot {
        height: 0.75rem;
        width: 0.75rem;
        background: none;
        border-radius: 9999px;
        outline: 3px solid rgb(var(--primary));
        outline-offset: -2px;
        z-index: 50;
    }
    
    .timeline-marker {
        margin: 0 auto;
        width: 0.25rem;
        height: 0.25rem;
        border-radius: 9999px;
        background: oklch(0.5 0.05 var(--hue));
        outline: 4px solid rgb(var(--card-bg));
        transition: all 0.2s ease;
        z-index: 50;
    }
    
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
    
    .post-tags {
        display: none;
        width: 15%;
        text-align: left;
        font-size: 0.875rem;
        color: rgb(var(--text-30));
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.2s ease;
    }
    
    @media (min-width: 768px) {
        .post-tags {
            display: block;
        }
    }
    
    a:hover .timeline-marker {
        height: 1.25rem;
        background: rgb(var(--primary));
        outline-color: rgb(var(--btn-plain-bg-hover));
    }
    
    a:active .timeline-marker {
        outline-color: rgb(var(--btn-plain-bg-active));
    }
    
    a:hover .post-title {
        transform: translateX(0.25rem);
        color: rgb(var(--primary));
    }
</style>
