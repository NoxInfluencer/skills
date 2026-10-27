const args = process.argv.slice(2);
try {
  if (args.includes("--help")) {
    console.log("Usage: node scripts/package-workbuddy.mjs [--check] [--dev]\n默认生成正式 WorkBuddy 连接器 ZIP；--check 仅读取检查；--dev 允许测试地址及暂未交付的空 Skill，产物带 -dev 标记。");
  } else {
    if (args.some((arg) => !["--check", "--dev"].includes(arg))) throw new Error("只支持 --check、--dev；不支持跳过其他校验。");
    const { inspectWorkbuddyPackage, packageForWorkbuddy } = await import("./workbuddy-package.mjs");
    const options = { development: args.includes("--dev") };
    if (args.includes("--check")) {
      const plan = inspectWorkbuddyPackage(options);
      for (const warning of plan.warnings) console.warn(warning);
      if (plan.issues.length) throw new Error(`WorkBuddy 打包检查未通过（${plan.issues.length} 项）：\n${plan.issues.map((issue) => `- ${issue}`).join("\n")}`);
      console.log(`WorkBuddy ${options.development ? "开发" : "正式"}包本地检查通过（${plan.entries.length} 个文件）。`);
    } else {
      const result = await packageForWorkbuddy(options);
      for (const warning of result.warnings) console.warn(warning);
      console.log(`WorkBuddy ZIP 已生成：${result.path}\n文件数：${result.fileCount}\nSHA-256：${result.sha256}\n旁边的 .sha256 和 .files.json 用于核对，不进入 ZIP。`);
    }
    console.log("此命令不连接 MCP、不发起授权、不安装或上传。OAuth、业务联调、source 唯一性及审核需另行完成。");
  }
} catch (error) {
  console.error(error.code === "ERR_MODULE_NOT_FOUND" ? "缺少开发依赖。请先在插件目录执行 npm ci。" : error.message);
  process.exitCode = 1;
}
