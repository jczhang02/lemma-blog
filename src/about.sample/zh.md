---
# 测试关于页布局用的虚构资料 (LEMMA_ABOUT=sample, bun run dev:sample). 人名, 单位和论文都是编的.
# 中文版没有 links 字段, 用来检查可选字段缺失时的情况.
title: 关于
name: 乔林
tagline: 博士后 · 北湖大学计算科学研究院
self: ['Qiao, Lin', '乔林']
sections:
  - heading: 工作经历
    items:
      - when: 2025 – 今
        title: 博士后, 计算科学研究院
        subtitle: '北湖大学 · 合作导师: Mira Halvorsen 教授'
        note: 刚性多尺度系统的算子学习; 带学习闭包的谱方法.
        href: 'https://example.org/ics'
      - when: 2024
        title: 研究实习, Harborview Labs 流体力学组
        subtitle: 暑期, 三个月
        links:
          - { label: 报告, href: 'https://example.org/report.pdf' }
          - { label: 代码, href: 'https://github.com/example-lqiao/harbor' }
  - heading: 教育经历
    items:
      - when: 2020 – 2025
        title: 应用数学博士, 北湖大学
        subtitle: '学位论文: 刚性且强非线性源项的反应扩散方程的谱神经算子方法'
        note: 导师周文教授. 优秀博士学位论文.
      - when: 2016 – 2020
        title: 数学学士, 东桥大学
  - heading: 代表论文
    selectedOnly: true
  - heading: 全部论文
    publications:
      - title: 'Spectral Neural Operators for Stiff Reaction–Diffusion Systems: Stability, Approximation Rates, and Learned Closures for Strongly Nonlinear Source Terms on Periodic and Bounded Domains'
        authors: [Xiaoyu Chen, Anna-Lena Müller, Lin Qiao*, Haoran Wang, 等]
        venue: Advances in Neural Information Processing Systems
        year: 2025
        selected: true
        url: 'https://example.org/papers/sno'
        pdf: 'https://example.org/papers/sno.pdf'
        arxiv: '2505.01234'
        doi: 10.5555/neurips.2025.01234
        links:
          - { label: 代码, href: 'https://github.com/example-lqiao/sno' }
          - { label: 幻灯片, href: 'https://example.org/sno-slides.pdf' }
        bibtex: |
          @inproceedings{qiao2025spectral,
            title = {Spectral Neural Operators for Stiff Reaction--Diffusion Systems},
            author = {Chen, Xiaoyu and Qiao, Lin and others},
            year = {2025},
          }
      - title: 刚性反应扩散方程的指数积分谱方法
        authors: [陈晓宇, 乔林, 周文]
        venue: '中国科学: 数学'
        year: 2024
        selected: true
        doi: 10.5555/scm.2024.0401
      - title: 'Learned Closures Fail Gracefully: A Negative Result'
        authors: [Lin Qiao, Chidi Okafor, Wen Zhou]
        venue: ICLR Workshop on Physics for Machine Learning
        year: 2023
      - title: On the Expressivity of Fourier Neural Operators
        authors: [Haoran Wang, Mira Halvorsen, Lin Qiao]
        venue: arXiv preprint
        year: 2022
        arxiv: '2210.04567'
  - heading: 教学
    items: []
  - heading: 获奖
    items:
      - when: 2024
        title: 优秀研究生
      - title: 多家期刊审稿人
---

我研究偏微分方程的数值分析与机器学习, 特别是刚性反应扩散系统的**算子学习**: 从少量轨迹学习解算子 $\mathcal{G}: u_0 \mapsto u(\cdot, T)$. 之前在[北湖大学](https://example.org)学习谱方法.

2026 年在找教职.
