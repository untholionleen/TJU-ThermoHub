# Changelog

## 13.1.0 (Nv3.1.0) — 2026-11-07

- 建立独立 `TJU-ThermoHub` 工程目录，避免在旧 `JsPSCES-TJU` 仓库内继续试错。
- 按规划建立模块化 CSS、JavaScript、化学物质数据、术语表、文档、测试、脚本和旧版归档目录。
- 配置 GitHub Pages 三阶段流水线：Verify → Build → Deploy；数值与语法测试失败会阻止部署。
- 生产 Pages artifact 仅包含站点运行所需文件，不发布 legacy 归档和内部文档。
- 保持 Supabase、账号、OTP 与云端运行能力关闭。
- 明确记录尚未实现或尚未验收的模型、图表和浏览器功能，不把基线描述为完整工程数据库。
