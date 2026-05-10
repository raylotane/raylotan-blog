---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Raylotane Blog"
  tagline: 前端工程 × AI 实践
  actions:
    - theme: brand
      text: 开始探索
      link: /00_Inbox
features:
  - title: AI工程应用
    details: AI 评估体系建设、RAG、Agent 实践、LLM 应用开发
    link: /01_AI_Engineering/ai-evaluation-series/blog-v1-basic-chat.md
  - title: 前端工程化
    details: Rollup 打包、CLI 工具、插件架构、构建优化
    link: /02_Engineering/building-react-mpa-with-morejs-cli.md.md

footer: |
  专注前端工程化与 AI 应用开发<br>
  记录从 0 到 1 的技术实践
---

<br/>

:::mermaid
mindmap
  root((AI工程应用体系))
    用户：学会与AI协作
      高效的AI使用者
      提示词工程
        提示工程指南
        AI提示词框架
        提示词优化
        提示词优化工具/平台
    开发者：掌握AICoding工具
      善于使用AI工具解决具体问题
      API调用
        熟悉OpenAI/Claude API调用方式
        参数：temperature / top_p / max_tokens
      MCP & Skill & Memory
        扩展AI特定的行动工具/技能
        沉淀跨会话的记忆
      AI应用开发框架
        ai-sdk
        langChain生态
        workflow
      Agent原理
        实现“推理->行动->观察”循环结构
        Plan模式 / SubAgent原理 / Skill
    工程师：设计与落地工程应用
      建设可度量/可治理/可演进的组织级平台能力
      模型定制与RAG体系
        私有大模型继续预训练（CPT）/指令微调
        基座：Llama / DeepSeek / Qwen等
      监测 & 评估 & 优化
        Observability / Evaluation / Improvement
        langfuse
      安全与数据处理
        数据脱敏、清洗与合规性处理
:::
