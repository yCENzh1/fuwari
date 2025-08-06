---
title: 'Fuwari博客页面加密功能研究'
published: 2025-08-05
category: Default
tags: [加密,base64哈希,SHA256,salt,Fuwari]
password: 'ABCD1234'
---

# 基于 Astro & Fuwari 主题博客的页面加密功能研究

> 参考链接：[https://www.lapis.cafe/posts/technicaltutorials/astro-fuwari-page-lock/](https://www.lapis.cafe/posts/technicaltutorials/astro-fuwari-page-lock/)

---

## 背景说明

由于我的博客内容涉及多个领域，难免会触及一些具有争议性的议题，可能会忤逆部分不特定读者的观念或利益。因此，我认为有必要研究如何在 Astro + Fuwari 框架下实现对特定页面的加密保护——当然，这种加密应尽量避免「掩耳盗铃」，不要干出来大家 F12 搜索一下就可以直接获取密码和实际全文内容的抽象事。

特别感谢我亲爱的两位 AI 开发伙伴——Claude Code 和 Roo Code 的协助。接下来，我将简要介绍这一功能的核心思路与实现路径。出于隐私与安全的考量，我目前已将博客的仓库转为私有，因此无法直接向大家展示完整的源码修改内容。但我会尽可能详细地说明与该加密功能相关的所有关键修改点，方便有类似需求的朋友参考实现。

---

## 实操

1. 创建加密工具类  
首先创建 src/utils/contentProtect.ts

2. 创建密码保护组件  
创建 src/components/PasswordProtect.astro

3. 创建文章包装组件  
创建 src/components/ArticleWrapper.astro

4. 修改文章页面模板  
src/pages/posts/[...slug].astro修改为：

```astro
---
import Layout from '@layouts/Layout.astro';
import ArticleWrapper from '@components/ArticleWrapper.astro';
// ... 其他导入

export async function getStaticPaths() {
  // ... 你现有的逻辑
}

const { post } = Astro.props;
const { Content, frontmatter, compiledContent } = post;
---

<Layout title={frontmatter.title} description={frontmatter.description}>
  <main>
    <!-- 文章头部信息 -->
    <header>
      <h1>{frontmatter.title}</h1>
      <!-- 其他元信息 -->
    </header>

    <!-- 使用ArticleWrapper来处理加密 -->
    <ArticleWrapper frontmatter={frontmatter} compiledContent={compiledContent}>
      <Content />
    </ArticleWrapper>
  </main>
</Layout>
```

5. 集成到Layout.astro  
在 Layout.astro 文件的 script 部分，添加密码保护的初始化：

```JavaScript
// 在 initPageContent 函数中添加
function initPageContent() {
  initCustomScrollbar();
  createPhotoSwipe();
  
  // 初始化密码保护
  if (window.initPasswordProtect) {
    window.initPasswordProtect();
  }
}
```

6. 客户端加密方案  
使用 crypto-js 进行加密，创建 src/utils/crypto-client.ts

## 后盐（

> 在我思考过后,我决定和他杠上了,再改一遍

1. 修改crypto-client.ts,具体怎么改的.....懒得写,改了两个小时

2. 更新PasswordProtect.astro

3. 更新 src/utils/contentProtect.ts 使用动态salt