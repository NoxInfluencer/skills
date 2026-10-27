const args = process.argv.slice(2);
try {
  if (args.includes("--help")) {
    console.log("Usage: node scripts/package-chatgpt.mjs [--check]\n默认生成 ChatGPT 上架 ZIP；--check 仅检查，不生成文件。");
  } else {
    if (args.some((arg) => arg !== "--check")) throw new Error("只支持 --check；此命令不提供跳过校验的参数。");
    const { inspectChatgptPackage, packageForChatgpt } = await import("./chatgpt-package.mjs");
    if (args.includes("--check")) {
      const plan = inspectChatgptPackage();
      if (plan.issues.length) throw new Error(`ChatGPT 打包检查未通过（${plan.issues.length} 项）：\n${plan.issues.map((issue) => `- ${issue}`).join("\n")}`);
      console.log(`ChatGPT 本地打包检查通过（${plan.entries.length} 个文件）。`);
    } else {
      const result = await packageForChatgpt();
      console.log(`ChatGPT ZIP 已生成：${result.path}\n文件数：${result.fileCount}\nSHA-256：${result.sha256}\n旁边的 .sha256 和 .files.json 用于核对，只上传 ZIP。`);
      if (result.reviewPending) console.log("审核用例或演示录像尚未完整配置，正式提审前仍需准备。");
    }
    console.log("此命令只检查本地包；企业身份、链接可访问性、域名验证、OAuth、MCP 工具扫描及审核在官方后台完成。");
  }
} catch (error) {
  console.error(error.code === "ERR_MODULE_NOT_FOUND" ? "缺少开发依赖。请先在插件目录执行 npm ci。" : error.message);
  process.exitCode = 1;
}
