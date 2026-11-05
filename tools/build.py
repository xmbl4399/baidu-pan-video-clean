#!/usr/bin/env python3
"""把 src/ 下的片段拼成单文件油猴脚本（等价于 ScriptCat 里那一条）。

拼接规则很关键：artPlugins 清理版以 `])` 结尾，主脚本以 `(function() {` 开头。
两者之间必须有一个前导分号，否则会被解析成 `([...])(function(){...})()`，
脚本在拼装行就抛 TypeError（曾真实踩过，见 README「已知坑」）。

用法:
    python3 tools/build.py            # 生成 baidu-pan-video-clean.user.js
    python3 tools/build.py --check    # 只比对，不写盘（CI/提交前用）
"""
import argparse
import hashlib
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
OUT = ROOT / "baidu-pan-video-clean.user.js"

# 顺序即拼接顺序；每个片段自带结尾换行
PARTS = ("header.txt", "notice.txt", "artPlugins.clean.js", "main.js")


def render() -> str:
    # 每个片段自带结尾换行，片段之间再补一个换行 → 保持原文件的空行分隔
    chunks = [(SRC / name).read_text(encoding="utf-8") for name in PARTS]
    text = "\n".join(chunks)

    # 硬约束：主脚本前的分隔必须是 `;\n\n(function`，不能是裸的 `\n(function`
    if "]);\n\n;(function() {" not in text:
        raise SystemExit(
            "拼接失败：artPlugins 片段与 main.js 之间缺少 `]);` + `;(function() {` 分隔，"
            "会把数组当函数调用（ASI 陷阱）"
        )
    return text


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="只校验产物是否与 src 同步")
    args = ap.parse_args()

    text = render()
    current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""

    if args.check:
        if current != text:
            sys.stderr.write("产物与 src/ 不同步，请运行 tools/build.py\n")
            return 1
        print(f"OK 已同步 ({len(text.encode())} B)")
        return 0

    OUT.write_text(text, encoding="utf-8")
    digest = hashlib.sha256(text.encode()).hexdigest()
    print(f"written {OUT.name}  {len(text.encode())} B  sha256={digest[:16]}…")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
