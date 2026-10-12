# 写作速查表

完整示例见 `src/content/posts/hello-math/zh.md` (草稿, 只在 `bun run dev` 中显示).

## 新文章

```sh
bun run new fno-notes        # 新建 src/content/posts/fno-notes/zh.md
bun run new fno-notes --en   # 同一篇的英文版 en.md
bun run dev                  # 预览 http://localhost:4321/posts/fno-notes/
```

一篇文章一个文件夹, 图片和视频放在同一个文件夹里. 中英文版本共用一个文件夹, 可以只有其中一个.

```yaml
---
title: 标题
description: 一两句摘要, 显示在标题下和文章列表里.
date: 2026-10-10
updated: 2026-11-01      # 可选, 显示 "更新于"
tags: [PDE, 神经算子]
draft: true              # 改成 false 才会发布
numbering: true          # 可选, false 关闭章节编号
macros:                  # 可选, 只在本文生效
  Lap: '\Delta'
  norm: ['\left\| #1 \right\|', 1]
---
```

frontmatter 是 YAML: 值里有 "冒号 + 空格" 时 (例如 `description: "一览: 公式, 定理"`), 要加引号, 否则内容同步会失败, dev 服务器停在旧内容上.

## 章节

```md
## 引言 \label{sec:intro}
### 记号
```

`##` 和 `###` 自动编号 (1, 1.1). 引用写 `第 \ref{sec:intro} 节`.

## 公式

```md
行内 $u_t = \Delta u$, 行间:

$$
\begin{equation}
  -\Delta u = f \quad \text{in } \Omega
  \label{eq:poisson}
\end{equation}
$$

由 \eqref{eq:poisson} 可知 ...
```

- `\eqref` 和 `\ref` 可以直接写在正文里, 不用加 `$`. 引用写在公式前面也可以.
- 全站宏在 `lemma.config.mjs` 的 `math.macros` 里, 比如 `\R`, `\set{...}`, `\inner{u}{v}`.
- 已加载 physics, mathtools, cases, mhchem 等宏包. 用了未定义的宏, 构建时会给出 `[mathjax]` 警告.

## 定理

```md
:::theorem[Lax-Milgram]{#thm:lax}
设 $a$ 是 Hilbert 空间 $V$ 上有界且强制的双线性型, 则 ...
:::

:::proof
由 Riesz 表示定理 ...
:::
```

可用的环境: theorem, lemma, proposition, corollary, definition, example, remark, proof. 编号按节计 (2.1, 2.2). 引用写 `定理 \ref{thm:lax}`. `:::proof[定理 \ref{thm:lax} 的证明]` 可以替换证明的标题.

## 引用文献

```md
见 \cite{evans2010}, \cite{a, b}, \cite[第 6 章]{evans2010}.
```

- 文献条目写在 `src/bibliography.bib` 里, 是普通的 BibTeX, 直接编辑即可. citekey 就是条目里 `@article{key,` 的 `key`.
- 也可以用文献管理软件导出 BibTeX, 再把文件加进 `lemma.config.mjs` 的 `bibliography.files`.
- 文末自动生成 "参考文献", 按首次引用的顺序编号. key 不存在时, 构建会给出 `[cite]` 警告.

## 图, 表, 交换图

```md
:::figure{#fig:mesh .invert-dark}
![网格](./mesh.png)

图注, 可以有公式 $h \to 0$.
:::

:::table{#tab:err}
| $h$ | 误差 |
|--:|--:|
| 0.1 | 1.2e-3 |

表注写在下面, 显示在表格上方.
:::
```

- 引用写 `图 \ref{fig:mesh}`, `表 \ref{tab:err}`.
- `.invert-dark`: 透明背景上的黑线图, 在深色模式下自动反色. 照片不要加.
- 图片原图尽量小于 2 MB. 线条图优先用 SVG.

交换图和 TikZ 图 (本机用 LaTeX 编译, 可以放进 `:::figure` 里):

````md
```tikzcd
A \arrow[r, "f"] \arrow[d, "g"'] & B \arrow[d, "h"] \\
C \arrow[r, "k"'] & D
```

```tikz
\draw[->] (0,0) -- (2,1) node[right] {$u(x,t)$};
```
````

- 全站宏和本文的宏在图里同样可用.
- 编译结果缓存在 `tikz-cache/`. 这个目录要一起 commit, 否则部署时没有这张图.
- 编译出错时, 构建会给出 `[tikz]` 警告, 页面上显示源码.

## 视频

```md
:::figure[解的演化.]{#fig:evolution}
![热方程的解](./heat.mp4)
:::
```

- 视频小于 25 MiB 时, 直接放进文章文件夹.
- 视频更大时, 先运行 `bun run media:push`. 它会上传到 R2 (`media.jczhang.cc`), 并让 git 忽略这个文件. 文章里的写法不变. 上传要用 `cf` 命令行工具: 先安装 `cf`, 再运行 `cf auth login`.
- 压缩建议: H.264, 1080p 以内. `ffmpeg -i in.mov -c:v libx264 -crf 26 -preset slow -an out.mp4`.

## 其他

- 脚注: `正文[^1]`, 然后 `[^1]: 注释内容.`
- 代码块: 用三个反引号, 写上语言, 比如 ` ```python `. 页面上有复制按钮.
- 用 `.md`, 不要用 `.mdx`. MDX 会把 `{` 和 `<` 当成代码, TeX 会出错.
