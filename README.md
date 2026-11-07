# 天津大学化工热力学学生自主学习网站 | TJU-ThermoHub

**[打开在线学习网站](https://untholionleen.github.io/TJU-ThermoHub/)**

本仓库保存网站源代码、计算引擎、数据与测试。当前站点为教学与工程辅助学习平台，不是经认证的工业物性数据库。

## 当前已接入功能

- 纯物质 van der Waals、RK、SRK、PR 状态方程计算；PRG 未启用。
- 由 EOS 计算的 P–V 等温线、P–T / V–T 投影及 P–V–T 交互曲面。原始 EOS 曲面不等同于稳定汽液平衡包络线。
- PR EOS 约化压缩因子曲线与 CSV 导出；明确标记为 PR 模型曲线，不冒充 Lee–Kesler 普遍化图。
- IAPWS-IF97 Region 1–5 的 PT 正向计算与区域判定；Region 4 饱和液/汽性质、P–x / T–x 干度混合；PH、PS、HS 仅开放第三方实现实际覆盖且通过检查的输入范围。
- 基于 IF97 状态方程生成水/水蒸气 log p–h、T–s 饱和边界、干度线与等压线。
- 用户自定义数据的线性、双线性插值；范德华方程 D1 逐步推导。
- 中英文独立切换、16 种物质参数、术语/符号、单位换算、本地 JSON/CSV 导出。

## 仍待实现或验证（页面已列入建设目录，不代表计算已开放）

- 二元混合物 VLE 泡点、露点、闪蒸与 K 值；旧版含演示/不可信输出，保持关闭。
- PRG 完整定义与参数来源。
- Lee–Kesler 简单流体/参考流体普遍化 Z、剩余焓/熵、逸度系数及 Zc 修正。
- 空气 H–T、T–s、h–s 图；R-134a 等制冷剂 log p–h 图，需要明确参考态、数据来源和独立验证。
- D2–D11 推导逐式校核；D1 也仍需教材审阅。
- IF97 后向变量组合的完整覆盖，特别是 Region 5 的 PH/PS/HS；当前不支持的组合会拒绝计算。
- 图表为公式生成的教学/工程辅助图，不是扫描教材图或经认证的设计软件输出。

## IF97 实现与来源说明

IF97 五区域 PT 正向方程及部分后向计算使用 NeutriumJS.thermo.IAPWS97 第三方实现。该代码按 **CC BY 4.0** 许可使用，原作者、许可和修改说明见 `assets/vendor/if97/NOTICE.md`。该第三方旧包已弃用，并非 IAPWS 官方软件；来源与测试范围见网站“附录/数据来源”。

IAPWS-IF97 官方发布文件：<https://iapws.org/technical-guidance/release/IF97-Rev>

## pjb10 原站与版权

P.J. Barrie 的 <https://pjb10.user.srcf.net/thermo/> 是本项目立方型状态方程学习功能的参考来源。该网页公开可访问，但未见明确的代码再分发许可；因此本项目保留致谢与参考链接，不把原站代码或数据整体镜像。相关学术论文：P. J. Barrie, “JavaScript programs to calculate thermodynamic properties using cubic equations of state”, *Journal of Chemical Education*, 82, 958–959 (2005)。

## 目录结构

- `index.html`：网站入口
- `assets/js/eos/`：立方型状态方程
- `assets/js/steam/`：IF97 适配、饱和性质和状态求解
- `assets/vendor/if97/`：按 CC BY 4.0 署名的第三方 IF97 实现
- `assets/js/charts/`：图形绘制
- `assets/js/derive/`：推导专题
- `data/`：物质参数与术语
- `tests/`：语法、数值、参考点和边界测试
- `docs/`：设计、实施、数据与验收文档

## 本地运行

需要 Node.js 24 与 Python 3：

```bash
npm run check
npm run build:standalone
python -m http.server 8000
```

浏览器打开 `http://localhost:8000/`。测试未全部通过时，不应将构建标记为成功，也不应降低参考点容差来掩盖算法问题。

## 部署与数据政策

推送至 `main` 后自动执行语法检查、数值测试、独立版构建与 GitHub Pages 发布。Supabase 本期不加载、不显示、不调用；账号、登录和 OTP 功能不在当前部署范围。旧仓库 `JsPSCES-TJU` 保持独立，不会被本项目覆盖。
