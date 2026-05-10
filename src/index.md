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

<br/>

:::mermaid
mindmap
  root(AI质量保障体系)
    监测：模型到底在干嘛？
      常见能力
        Prompt/Response全量记录
        Token使用量、延迟
        Tool调用轨迹（特别是Agent）
        用户反馈（like/dislike）
        多轮对话链路追踪（trace）
      典型工具
        Langfuse
        LangSmith
    评估：回答好不好？
      评估方式
        人工评估（HumanEval）
          标注好/不好、打分（1-5）
          标记hallucination、是否合规
          纠错文本
        规则评估（Rule-based）
          JSON是否合法
          是否调用了正确tool
          是否包含某些字段
        LLM评估（LLM-as-a-Judge）
          用另一个模型来打分
      常用框架
        Ragas
        DeepEval
        OpenAI Evals
      主流策略
        规则 + LLMJudge + 少量人工
      评分类型
        质量评分、准确率（0-1或1~5）
        判断是否hallucination/合规（0/1）
        分类标注（helpful/irrelevant）
        纠错型反馈（纠错文本）
    优化：怎么变好？
      评估之后才是关键：怎么提升？
      优化方法
        Prompt优化（最直接）
          few-shot
          chain-of-thought
          system prompt调整
        Tool/Agent优化
          tool schema设计
          tool selection prompt
          tool返回格式
        微调（Fine-tuning）
          RAG（检索增强）
          SFT（监督微调）
          DPO/RLHF
        自动优化（进阶）
          Prompt自动搜索（AutoPrompt）
          Self-reflection
          Multi-agent critique
      优化原则
        从上往下开始优化
        成本逐渐上升，收益比逐渐减少
:::
