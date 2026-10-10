---
title: 公式渲染测试
description: 检查 MathJax 4 在本站的渲染效果, 包括 AMS 环境, physics 宏包和自定义宏.
date: 2026-10-10
tags: [meta, 代数]
macros:
  abs: ['\left| #1 \right|', 1]
  Gal: '\operatorname{Gal}'
---

这篇文章用来检查公式渲染. 行内公式写在单个美元符号之间, 例如 $\Gal(\overline{\Q}/\Q)$ 和 $\abs{x - y} < \eps$. 文中的 `\abs` 和 `\Gal` 定义在本文的 frontmatter 里, `\Q` 和 `\eps` 是全站宏.

> 引用块用正文的宋体, 颜色较浅. 引用中的公式也正常: $e^{i\pi} + 1 = 0$.

## AMS 环境与编号

带编号的公式可以用 `\label` 和 `\eqref` 引用:

$$
\begin{equation}
  \int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
  \label{eq:gauss}
\end{equation}
$$

由 \eqref{eq:gauss} 可得 $\Gamma(1/2) = \sqrt{\pi}$. 多行对齐:

$$
\begin{align*}
  (a + b)^2 &= a^2 + 2ab + b^2 \\
  \sum_{\substack{0 \le i \le m \\ 0 < j < n}} P(i, j) &= \prod_{p \text{ prime}} \frac{1}{1 - p^{-s}}
\end{align*}
$$

分段函数:

$$
f(x) = \begin{cases}
  x^2 \sin(1/x) & x \neq 0, \\
  0 & x = 0.
\end{cases}
$$

## 定理环境

:::definition
设 $G$ 是群, $H \subseteq G$. 如果 $H$ 对 $G$ 的运算也构成群, 就称 $H$ 是 $G$ 的**子群**, 记作 $H \le G$.
:::

:::theorem[Lagrange]{#thm:lagrange}
设 $G$ 是有限群, $H \le G$. 那么 $\abs{H}$ 整除 $\abs{G}$, 并且
$$
[G : H] = \frac{\abs{G}}{\abs{H}}.
$$
:::

:::proof
$H$ 的左陪集构成 $G$ 的一个划分, 并且每个陪集 $gH$ 和 $H$ 之间有双射 $h \mapsto gh$. 所以
$$
\abs{G} = [G : H] \cdot \abs{H}.
$$
:::

:::lemma
若 $\abs{G} = p$ 是素数, 则 $G$ 是循环群. 这里的冒号测试: $f:X \to Y$, $\phi:G\to H$.
:::

:::proof
取 $g \ne e$. 由定理 \ref{thm:lagrange}, $\abs{\langle g \rangle}$ 整除 $p$, 所以 $\langle g \rangle = G$.
:::

:::remark
定理 \ref{thm:lagrange} 的逆命题不成立: $A_4$ 没有 6 阶子群. 普通文字里的冒号不受影响, 例如 std::vector 和 note:this.
:::

## 字体与箭头

$\mathbb{R}$, $\mathcal{C}$, $\mathfrak{g}$, $\mathscr{F}$, $\mathsf{Set}$, $\mathds{1}$. 正合列:

$$
0 \longrightarrow A \xrightarrow{\ f\ } B \xrightarrow[\text{surj}]{\ g\ } C \longrightarrow 0
$$

### 李代数 $\mathfrak{sl}_2(\C)$

$[h, e] = 2e$, $[h, f] = -2f$, $[e, f] = h$.

### 交换图

交换图 (amscd):

$$
\begin{CD}
  A @>f>> B \\
  @VgVV @VVhV \\
  C @>>k> D
\end{CD}
$$

## physics 与 mathtools

$$
\dv{x} \qty(\frac{1}{x}) = -\frac{1}{x^2}, \qquad
\pdv{f}{x}{y}, \qquad
\bra{\psi} \hat{H} \ket{\phi}, \qquad
\norm{v} \coloneqq \sqrt{\inner{v}{v}}
$$

$$
\Hom_{\mathsf{Set}}(X, Y) \cong \set{f : X \to Y}, \qquad \underbrace{1 + 1 + \cdots + 1}_{n} = n
$$

## 表格

| 群 $G$ | 阶 $\abs{G}$ | 是否交换 |
|:--|--:|:-:|
| $\Z/n\Z$ | $n$ | 是 |
| $S_3$ | $6$ | 否 |
| $Q_8$ | $8$ | 否 |
| $A_5$ | $60$ | 否 |

## 代码

```python
def zeta(s, terms=10_000):
    """Partial sum of the Riemann zeta function."""
    return sum(n ** -s for n in range(1, terms + 1))
```

## 长公式

$$
\left( \sum_{k=1}^{n} a_k b_k \right)^2 \le \left( \sum_{k=1}^{n} a_k^2 \right) \left( \sum_{k=1}^{n} b_k^2 \right) \quad \text{for all } a_1, \dots, a_n, b_1, \dots, b_n \in \R
$$
