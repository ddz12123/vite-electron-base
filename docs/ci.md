# CI 与自动更新

这个模板已经接入 `electron-updater`，但自动更新默认关闭。只有设置下面的开关后，打包配置才会生成 `publish`，应用启动时才会检查更新：

```text
VITE_AUTO_UPDATE_ENABLED=true
```

普通开发和普通构建保持默认值 `false`，不会请求更新服务。

## GitHub Releases

适合代码和发行包都放在 GitHub 的项目。

CI 环境变量：

```text
VITE_AUTO_UPDATE_ENABLED=true
VITE_AUTO_UPDATE_PROVIDER=github
VITE_UPDATE_GITHUB_OWNER=your-org
VITE_UPDATE_GITHUB_REPO=your-repo
GH_TOKEN=<具有 contents:write 权限的 GitHub Token>
```

发布命令按平台执行，并追加 `--publish always`：

```bash
pnpm run build:win -- --publish always
pnpm run build:mac -- --publish always
pnpm run build:linux -- --publish always
```

版本号应先更新 `package.json`，再创建对应的 `v*` Git tag。GitHub Provider 会上传安装包、`latest*.yml` 和 blockmap 文件，客户端启动时会从对应 Release 查询更新。

GitHub Actions 最小骨架如下。macOS 签名和公证需要额外配置证书 secrets，模板不默认开启。

```yaml
name: release

on:
  push:
    tags: ['v*']
  workflow_dispatch:

permissions:
  contents: write

jobs:
  publish:
    strategy:
      matrix:
        include:
          - os: windows-latest
            target: win
          - os: macos-latest
            target: mac
          - os: ubuntu-latest
            target: linux
    runs-on: ${{ matrix.os }}
    env:
      VITE_AUTO_UPDATE_ENABLED: 'true'
      VITE_AUTO_UPDATE_PROVIDER: github
      VITE_UPDATE_GITHUB_OWNER: ${{ github.repository_owner }}
      VITE_UPDATE_GITHUB_REPO: ${{ github.event.repository.name }}
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build:${{ matrix.target }} -- --publish always
```

## 自定义 Generic Server

适合使用对象存储、CDN 或自建下载服务器的项目。

CI 环境变量：

```text
VITE_AUTO_UPDATE_ENABLED=true
VITE_AUTO_UPDATE_PROVIDER=generic
VITE_UPDATE_URL=https://downloads.example.com/vite-electron-base/
```

`VITE_UPDATE_URL` 建议使用 HTTPS，并以 `/` 结尾。构建发布后，服务器目录至少需要提供对应平台的元数据和安装包，例如：

```text
latest.yml
latest-mac.yml
latest-linux.yml
vite-electron-base-1.0.1-setup.exe
vite-electron-base-1.0.1.dmg
vite-electron-base-1.0.1.AppImage
```

实际文件名以 `electron-builder` 生成的产物为准；不要手工修改 `latest*.yml` 中的 sha512 和文件大小。

自定义服务器的构建命令仍然追加 `--publish always`。上传文件可以由 CI 的对象存储插件或单独的发布步骤完成，模板不绑定具体云厂商。

## 发布前检查

- `package.json` 的版本号已递增，且没有复用旧版本号。
- `VITE_AUTO_UPDATE_ENABLED` 只在发布 CI 中设置为 `true`。
- GitHub 模式配置了 `GH_TOKEN`，Generic 模式确认 `latest*.yml` 与安装包位于同一更新目录。
- Windows、macOS、Linux 分别使用目标平台构建，不要把一个平台的更新元数据混用到其他平台。
- 正式发布建议启用代码签名；签名变化会影响 Windows/macOS 的升级体验。
