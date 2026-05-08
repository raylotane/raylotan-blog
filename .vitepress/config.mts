import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Raylotane",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Inbox', link: '/00_Inbox' },
      {
        text: 'AI', items: [
          { text: 'AI 评估系列', link: '/01_AI/ai-evaluation-series/blog-v1-basic-chat.md' },
          { text: 'Learn Claude Code', link: '/01_AI/learn-claude-code/Mini-Agent-Loop' },
        ]
      },
    ],
    sidebar: {
      '/00_Inbox/': [
        {
          text: 'Inbox',
          items: [
            // { text: 'Markdown Examples', link: '/markdown-examples' },
            // { text: 'Runtime API Examples', link: '/api-examples' }
          ]
        }
      ],
      '/01_AI/': [
        {
          text: 'AI',
          items: [
            { text: 'MCP 详解', link: '/01_AI/MCP-Detail' },
          ]
        },
        {
          text: 'AI 评估系列',
          items: [
            { text: 'v1-基础 Chat：打通 AI SDK 与 Langfuse 的第一次连接', link: '/01_AI/ai-evaluation-series/blog-v1-basic-chat.md' },
            // { text: 'Agent for Plan mode', link: '/01_AI/learn-claude-code/Agent-for-Plan-mode' },
            // { text: 'Sub Agent Mode', link: '/01_AI/learn-claude-code/SubAgent-Mode' },
          ]
        },
        {
          text: 'Learn Claude Code',
          items: [
            { text: 'Mini Agent Loop', link: '/01_AI/learn-claude-code/Mini-Agent-Loop' },
            { text: 'Agent for Plan mode', link: '/01_AI/learn-claude-code/Agent-for-Plan-mode' },
            { text: 'Sub Agent Mode', link: '/01_AI/learn-claude-code/SubAgent-Mode' },
          ]
        },

      ]
    },
    // sidebar: [
    //   {
    //     text: 'Examples',
    //     items: [
    //       { text: 'Markdown Examples', link: '/markdown-examples' },
    //       { text: 'Runtime API Examples', link: '/api-examples' }
    //     ]
    //   }
    // ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/raylotane/raylotane-blog' }
    ]
  },
  srcDir: 'src'
})
