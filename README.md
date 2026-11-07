# 天津大学化工热力学学生自主学习网站 | TJU-ThermoHub

**[打开在线学习网站](https://untholionleen.github.io/TJU-ThermoHub/)**

本仓库是网站的源代码与维护入口；学生使用时请点击上方在线网站链接，不需要阅读构建说明。

## 当前功能基线

- 纯物质 van der Waals、RK、SRK、PR 立方型状态方程计算。
- EOS 等温线、P-V-T 模型曲面及二维投影。
- 模型生成的压缩因子曲线与 CSV 数据导出。
- IAPWS-IF97 Region 4 饱和压力 / 饱和温度双向计算。
- 用户自定义网格数据的线性与双线性插值。
- 范德华方程临界参数逐步推导。
- 中英文独立切换、术语表、主要符号、单位换算和本地记录导出。

## 当前限制（请勿误认为已完成）

VLE 数值计算、PRG、Lee–Kesler 普遍化关联、完整 IF97 Region 1/2/3/5、空气与制冷剂图表，以及 D2–D11 推导仍待实现或逐式验证。未验证内容不输出伪造工程数值。本项目是教学开发基线，不是经认证的工业物性数据库。

## 源码结构

- `index.html`：网站入口与页面结构
- `assets/css/`：统一界面样式
- `assets/js/eos/`：状态方程计算
- `assets/js/steam/`：水和水蒸气性质
- `assets/js/charts/`：工程图表绘制
- `assets/js/derive/`：公式推导交互
- `assets/js/core/`：页面交互、数据加载与语言切换
- `data/`：物质参数与术语数据
- `tests/`：数值与边界自动测试
- `scripts/`：独立版构建脚本
- `legacy/`：旧版只读审计资料

## 本地运行与检查

需要 Node.js 与 Python 3：

```bash
npm run check
npm run build:standalone
python -m http.server 8000
```

浏览器打开 `http://localhost:8000/`。

## 部署与数据政策

推送至 `main` 后自动执行语法检查、数值测试、静态构建与 GitHub Pages 发布。Supabase 本期保持关闭，不加载 SDK、密钥或云端账号功能。云端数据管理只作为未来阶段规划。

旧仓库 `JsPSCES-TJU` 保持独立，不会被本项目覆盖。
