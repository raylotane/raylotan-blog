# 从零实现一个插件化 CLI 工具：fewjs 架构深度解析

## 前言

不久前，我动手写了一个叫 **fewjs** 的小项目——一个基于插件架构的前端 CLI 工具。说是工具，其实更像是一次对"插件系统如何设计"的探索性实践。

市面上已经有 UmiJS、Vue CLI、Vite 等成熟框架，它们无一例外都拥有强大的插件机制。但"会用"和"能造"是两码事。当你想理解一个系统时，最好的方式是从零造一个。

这篇文章会从设计决策出发，逐步剖析 fewjs 的架构、插件机制，并与 UmiJS 的设计做对比——希望能给你在构建自己的插件化系统时提供一些参考。

---

## 一、fewjs 是什么

fewjs 是一个基于插件的前端开发 CLI，目前支持通过命令行启动开发服务器和扩展命令。它的核心代码只有不到 200 行 TypeScript，却完整实现了一个可工作的插件系统。

从使用者的视角来看：

```bash
$ few dev      # 启动 Vite 开发服务器（端口 1337）
$ few version  # 查看版本信息
```

就是这么简单。关键在于：**每一个命令都是一个插件**，彼此独立，通过统一的 API 与核心交互。

---

## 二、整体架构

fewjs 的整体架构可以用一张图概括：

```
CLI 入口 (bin/few.js)
      │
      ▼
  cli.ts ── 参数解析（yParser）
      │
      ▼
 Service ── 插件加载与命令调度
   │   │
   │   ├── 加载 plugins/version.ts
   │   ├── 加载 plugins/dev.ts
   │   └── 注册 command → { name, fn }
   │
   ▼
 根据用户输入分发到对应命令
      │
      ├── few dev → import("vite") → 启动开发服务器
      └── few version → 打印版本号
```

核心有三个角色：

| 角色 | 职责 |
|------|------|
| **Service** | 核心引擎，负责加载插件、管理命令、调度执行 |
| **PluginApi** | 插件可用的 API 表面，是插件与核心沟通的桥梁 |
| **Plugin** | 具体的功能实现，以函数形式注册到系统中 |

三者的关系很简单：**Service 创建 PluginApi，PluginApi 注入给 Plugin，Plugin 通过 PluginApi 向 Service 注册命令**。

这种"依赖注入"的模式有效解耦了核心与插件——插件不需要知道 Service 的存在，只与 PluginApi 这个受控接口打交道。

---

## 三、插件系统的设计细节

### 3.1 插件即函数

在 fewjs 中，一个插件就是一个函数：

```typescript
// plugins/dev.ts
export default (api: IApi) => {
    api.registerCommand({
        name: 'dev',
        description: "mode for dev",
        fn: async () => {
            const vitePkg = await import("vite")
            const server = await vitePkg.createServer({
                root: process.cwd(),
                server: { port: 1337 },
            })
            await server.listen()
            server.printUrls()
        }
    })
}
```

这里做了两个关键设计决策：

**决策一：插件是纯函数，不是类。**

相比类继承的方式，函数式插件更容易组合和测试。一个插件就是一个 `(api) => void` —— 没有生命周期、没有状态管理、没有继承链。这降低了编写插件的门槛，也减少了心智负担。

当然，代价是灵活性——函数式插件无法拥有独立的生命周期钩子（除非在 PluginApi 层面提供 hook 注册能力，我们后面会谈到）。

**决策二：动态 import 替代静态 import。**

`dev` 插件使用 `import("vite")` 而非 `import vite from "vite"`。这意味着如果你运行 `few version`，Vite 永远不会被加载。对于大型依赖，这种懒加载策略能显著提升其他命令的启动速度。

### 3.2 Service：简陋但够用的核心

Service 是插件系统的引擎，核心代码只有约 40 行：

```typescript
export class Service {
    plugins: string[]
    commands: Record<string, Command> = {}

    async run(opt: IServiceRunOptions) {
        // 阶段一：顺序加载所有插件
        while (this.plugins.length) {
            await this.initPlugins(this.plugins.shift() as string)
        }
        // 阶段二：查找并执行命令
        const command = this.commands[name]
        command.fn(args)
    }

    async initPlugins(pluginPath: string) {
        const ret = await this.getPlugin(pluginPath)
        const pluginApi = new PluginApi({ service: this })
        ret(pluginApi)
    }
}
```

注意这里的**两阶段设计**：

1. **加载阶段**：顺序加载所有插件，每个插件调用 `api.registerCommand()` 将命令注册到 Service 的 `commands` 字典中。
2. **执行阶段**：根据用户输入查找已注册的命令并执行。

这种设计的好处是插件之间不会相互干扰——一个插件可以在不知道其他插件存在的情况下注册命令。但如果插件 A 需要依赖插件 B 注册的某个能力，这个模型就不够用了（这恰恰是 UmiJS 通过 `registerMethod` 和 `onGenerateFiles` 等 API 解决的问题）。

### 3.3 PluginApi：受控的 API 表面

PluginApi 是插件唯一能接触到的 API：

```typescript
export class PluginApi {
    private service: Service

    constructor(opt: IPluginApiOptions) {
        this.service = opt.service
    }

    registerCommand(opt: IRegisterCommandOptions) {
        this.service.commands[name] = opt
    }

    registerMathod() {
        // 暂未实现
    }
}
```

唯一真正实现的方法是 `registerCommand`。另一个方法 `registerMathod`（注意拼写，这暴露了原型阶段的手速）是个空壳——在 UmiJS 中，`registerMethod` 允许一个插件向其他插件暴露可调用的方法，是插件间通信的关键机制。这里没有实现它，但留下了扩展点。

### 3.4 IApi：扩展的想象空间

```typescript
// types/Api.ts
export interface IApi extends PluginApi { }
```

这看起来多余——`IApi` 就是 `PluginApi`，没有任何额外成员。但在 UmiJS 的设计中，这个接口至关重要。

随着框架演进，你可以给 `IApi` 添加框架特定的方法（比如 `api.onDevServerConfig()`、`api.modifyViteConfig()`），而 `PluginApi` 保持为插件系统的纯基础设施。这种"接口分离"让插件 API 的扩展变得安全——新增方法不会破坏已有插件。

---

## 四、与 UmiJS 插件体系的对比

fewjs 的设计深受 UmiJS 启发（依赖中也包含了 `@umijs/utils`），可以说是一个"迷你版 UmiJS"。但差距也是明显的：

| 特性 | fewjs | UmiJS |
|------|-------|-------|
| 插件加载 | 顺序同步加载 | 支持异步、按需、多阶段 |
| 命令注册 | 单向注册 | 支持优先级、覆盖 |
| 生命周期钩子 | ❌ 未实现 | ✅ tapable 钩子系统 |
| 插件间通信 | ❌ 未实现 | ✅ registerMethod |
| 配置读取 | ❌ 未实现 | ✅ 多层配置合并 |
| 构建集成 | 委托给 Vite | 内置 Webpack/Rust 编译 |

具体来说，UmiJS 的插件系统有三个 fewjs 没有的关键能力：

**1. Hook 系统**

UmiJS 基于 `tapable` 实现了完善的生命周期钩子：`onStart`、`onGenerateFiles`、`onBuildComplete` 等。这些 hook 让插件可以在特定时机介入构建流程。fewjs 预留了 `Hook.ts` 文件，但内容为空——这个能力还没实现。

**2. 方法注册**

通过 `api.registerMethod()`，一个插件可以向其他插件提供 API。例如，UmiJS 的 `@umijs/plugins` 插件注册了 `api.addLayout()` 和 `api.addRouter()`，其他插件可以调用它们来扩展布局和路由。这让插件的"可组合性"大幅提升。

**3. 配置式插件管理**

UmiJS 通过 `.umirc.ts` 的 `plugins` 配置来决定加载哪些插件，支持 npm 包和本地路径。fewjs 目前是硬编码插件列表——所有插件在 `cli.ts` 中写死。

---

## 五、几个有意思的设计细节

### 5.1 CJS 与 ESM 的兼容处理

```typescript
async getPlugin(plugin: string) {
    let ret = require(plugin)
    return ret.__esModule ? ret.default : ret
}
```

在 Node.js 环境中，如果插件的构建产物是 CJS（CommonJS），但源代码是 ESM 风格（`export default`），father 等构建工具会输出类似：

```javascript
exports.__esModule = true;
exports.default = function plugin(api) { ... };
```

这个 `__esModule` 检查就是用来处理这种情况的——自动解包 CJS wrapper，拿到真正的默认导出。这种"兼容胶水"在插件式系统的边界经常出现，值得留意。

### 5.2 没有错误处理的命令分发

```typescript
const command = this.commands[name]
command.fn(args)  // 如果 command 是 undefined，这里会抛 TypeError
```

如果用户输入了没有注册的命令（比如 `few start`），`this.commands["start"]` 会是 `undefined`，随后 `command.fn` 会抛出 `TypeError`。虽然顶层的 `cli.ts` 有 try/catch 兜底，但错误信息是模糊的。

这个问题暴露了一个早期项目常见的取舍：**是做"优雅的错误提示"还是"先把功能跑通"**？后者通常是正确答案——过早优化错误处理往往意味着你对核心逻辑的迭代还没完成。

### 5.3 端口硬编码

`dev` 插件的端口写死了 1337：

```typescript
const server = await vitePkg.createServer({
    root: process.cwd(),
    server: { port: 1337 },
})
```

这个数字本身没有特别含义（不是常见的 3000、8080、5173）。我猜作者只是选了一个不太可能和其他服务冲突的端口。在更成熟的版本中，端口应该支持配置（读取项目配置、环境变量、或者自动寻找空闲端口）。

---

## 六、总结

fewjs 是一个极简的插件化 CLI 工具，不到 200 行代码勾勒出一个可工作的插件系统轮廓。它最宝贵的不是功能（毕竟只是两个简单的插件），而是**对"插件系统如何工作"的一次完整实践**。

如果你也在设计自己的插件系统，我认为 fewjs 这几个决策是值得参考的：

1. **插件即函数**：降低编写门槛，提高可组合性
2. **受控 API 表面**：插件只看到它们该看到的（PluginApi），核心实现细节被隐藏
3. **两阶段调度**：加载与执行分离，避免顺序依赖带来的复杂性
4. **标记接口**：IApi extends PluginApi，为未来的扩展留好后路

当然，它也有很多未完成的地方：Hook 系统为空、插件间通信机制缺失、缺少配置管理、命令分发容错性差——但这些"未完成"同样有价值，它们是你理解一个生产级框架（如 UmiJS）为何要那样设计的线索。

少即是多，少到极致便是明晰。fewjs 就是这样一个"少到刚好被看穿"的系统。

---

> - 完整代码见：[https://github.com/raylotane/fewjs](https://github.com/raylotane/fewjs)
> - umijs 插件机制研究，JS 简易版：[https://github.com/raylotane/umijs-plugin-study-js](https://github.com/raylotane/umijs-plugin-study-js)
