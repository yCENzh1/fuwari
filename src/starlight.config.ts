export default {
  // 在这里定义所有 Starlight 的配置
  title: 'Starlight', // Starlight 部分的标题
  description: 'Hello starlight!',
  social: {
    github: 'https://github.com/yCENzh',
  },
  // 侧边栏是关键，我们先定义一个简单的
  sidebar: [
    {
      label: 'Start',
      items: [
        // 这个链接稍后会对应我们创建的文件
        { label: '欢迎', link: '/welcome/' },
      ],
    },
    // 你可以继续添加更多分组
    // {
    //   label: '技术笔记',
    //   autogenerate: { directory: 'tech' }, // 自动生成 tech 目录下的链接
    // },
  ],
};