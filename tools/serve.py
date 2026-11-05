#!/usr/bin/env python3
"""本地起一个带 CORS 的静态服务，方便 ScriptCat 从 URL 一键安装。

    python3 tools/serve.py [port]

然后在脚本管理器里打开 http://127.0.0.1:8765/baidu-pan-video-clean.user.js
"""
import functools
import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *args):
        pass


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), functools.partial(Handler, directory=ROOT)) as server:
    print(f"serving {ROOT} -> http://127.0.0.1:{PORT}/baidu-pan-video-clean.user.js")
    server.serve_forever()
