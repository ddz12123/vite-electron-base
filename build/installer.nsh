# 由 electron-builder.config.mjs 的 nsis.include 注入到 NSIS 向导
# customInit 读取上次选项 / customPageAfterChangeDir 附加选项页（桌面图标、开机自启）
# customInstall 落地选项 / customUnInstall 卸载时询问是否删除用户数据
!include "nsDialogs.nsh"

# 简体中文 LCID。用数字而不是 ${LANG_SIMPCHINESE}，避免依赖 installerLanguages 是否包含 zh_CN
!define /ifndef LANG_ZH_CN 2052
!define /ifndef RUN_REG_KEY "Software\Microsoft\Windows\CurrentVersion\Run"

# 安装器和卸载器是两次独立编译（-DBUILD_UNINSTALLER），只在一个 pass 里用到的变量
# 会触发 warning 6001，而 electron-builder 默认用 -WX 把警告当错误，所以按 pass 分开声明
!ifndef BUILD_UNINSTALLER
  Var /GLOBAL gOptionsDialog
  Var /GLOBAL gChkDesktopShortcut
  Var /GLOBAL gChkRunAtLogin
  Var /GLOBAL gWantDesktopShortcut
  Var /GLOBAL gWantRunAtLogin
  Var /GLOBAL gRegValue
  Var /GLOBAL gPageTitle
  Var /GLOBAL gPageSubtitle
  Var /GLOBAL gDesktopShortcutText
  Var /GLOBAL gRunAtLoginText
!else
  Var /GLOBAL gDeleteDataQuestion
!endif

!macro localize_option_texts
  ${if} $LANGUAGE == ${LANG_ZH_CN}
    StrCpy $gPageTitle "附加选项"
    StrCpy $gPageSubtitle "选择安装完成后要执行的操作"
    StrCpy $gDesktopShortcutText "创建桌面图标"
    StrCpy $gRunAtLoginText "开机后自动启动"
  ${else}
    StrCpy $gPageTitle "Additional options"
    StrCpy $gPageSubtitle "Choose what to do once the installation is finished"
    StrCpy $gDesktopShortcutText "Create a desktop shortcut"
    StrCpy $gRunAtLoginText "Start automatically after sign-in"
  ${endif}
!macroend

!macro localize_uninstall_text
  ${if} $LANGUAGE == ${LANG_ZH_CN}
    StrCpy $gDeleteDataQuestion "是否同时删除 ${PRODUCT_NAME} 的用户数据（配置、缓存等）？$\r$\n$\r$\n数据位置：%APPDATA%\${APP_FILENAME}$\r$\n$\r$\n选择“否”会保留数据，下次安装可以直接继续使用。"
  ${else}
    StrCpy $gDeleteDataQuestion "Also delete ${PRODUCT_NAME} user data (settings, cache)?$\r$\n$\r$\nLocation: %APPDATA%\${APP_FILENAME}$\r$\n$\r$\nChoosing No keeps the data so a future install can reuse it."
  ${endif}
!macroend

# 全新安装使用默认值；覆盖安装/重装沿用上次的选择，避免手动重装把用户选项重置回去
!macro customInit
  ReadRegStr $gRegValue SHELL_CONTEXT "${INSTALL_REGISTRY_KEY}" InstallLocation
  ${if} $gRegValue == ""
    StrCpy $gWantDesktopShortcut "1"
    StrCpy $gWantRunAtLogin "0"
  ${else}
    ReadRegStr $gRegValue SHELL_CONTEXT "${INSTALL_REGISTRY_KEY}" DesktopShortcut
    ${if} $gRegValue == ""
      StrCpy $gWantDesktopShortcut "1"
    ${else}
      StrCpy $gWantDesktopShortcut $gRegValue
    ${endif}

    ReadRegStr $gRegValue SHELL_CONTEXT "${INSTALL_REGISTRY_KEY}" RunAtLogin
    ${if} $gRegValue == ""
      StrCpy $gWantRunAtLogin "0"
    ${else}
      StrCpy $gWantRunAtLogin $gRegValue
    ${endif}
  ${endif}

  # 尊重内置的 --no-desktop-shortcut 参数，否则 customInstall 会把快捷方式补建回来
  ${if} ${isNoDesktopShortcut}
    StrCpy $gWantDesktopShortcut "0"
  ${endif}
!macroend

!macro customPageAfterChangeDir
  # 自定义页只有两个回调：创建页（内含 nsDialogs::Create/Show）和离开页
  Function OptionsPageCreate
    # 自动更新（--updated）不需要重新选附加选项
    ${if} ${isUpdated}
      Abort
    ${endif}

    !insertmacro localize_option_texts
    !insertmacro MUI_HEADER_TEXT "$gPageTitle" "$gPageSubtitle"

    nsDialogs::Create 1018
    Pop $gOptionsDialog
    ${if} $gOptionsDialog == error
      Abort
    ${endif}

    ${NSD_CreateCheckbox} 0 12u 100% 12u "$gDesktopShortcutText"
    Pop $gChkDesktopShortcut
    ${if} $gWantDesktopShortcut == "1"
      ${NSD_Check} $gChkDesktopShortcut
    ${endif}

    ${NSD_CreateCheckbox} 0 34u 100% 12u "$gRunAtLoginText"
    Pop $gChkRunAtLogin
    ${if} $gWantRunAtLogin == "1"
      ${NSD_Check} $gChkRunAtLogin
    ${endif}

    nsDialogs::Show
  FunctionEnd

  Function OptionsPageLeave
    ${NSD_GetState} $gChkDesktopShortcut $0
    ${if} $0 == ${BST_CHECKED}
      StrCpy $gWantDesktopShortcut "1"
    ${else}
      StrCpy $gWantDesktopShortcut "0"
    ${endif}

    ${NSD_GetState} $gChkRunAtLogin $0
    ${if} $0 == ${BST_CHECKED}
      StrCpy $gWantRunAtLogin "1"
    ${else}
      StrCpy $gWantRunAtLogin "0"
    ${endif}
  FunctionEnd

  Page custom OptionsPageCreate OptionsPageLeave
!macroend

!macro customInstall
  # --updated 表示自动更新：目标目录、快捷方式、自启项都保持用户现状，不做任何改动
  ${ifNot} ${isUpdated}
    ${if} $gWantDesktopShortcut == "1"
      ${ifNot} ${FileExists} "$newDesktopLink"
        CreateShortCut "$newDesktopLink" "$appExe" "" "$appExe" 0 "" "" "${APP_DESCRIPTION}"
        ClearErrors
        WinShell::SetLnkAUMI "$newDesktopLink" "${APP_ID}"
      ${endif}
    ${else}
      Delete "$newDesktopLink"
      ClearErrors
    ${endif}

    ${if} $gWantRunAtLogin == "1"
      ${if} $installMode == "all"
        WriteRegStr HKLM "${RUN_REG_KEY}" "${PRODUCT_FILENAME}" '"$appExe"'
        DeleteRegValue HKCU "${RUN_REG_KEY}" "${PRODUCT_FILENAME}"
      ${else}
        WriteRegStr HKCU "${RUN_REG_KEY}" "${PRODUCT_FILENAME}" '"$appExe"'
        DeleteRegValue HKLM "${RUN_REG_KEY}" "${PRODUCT_FILENAME}"
      ${endif}
    ${else}
      DeleteRegValue HKCU "${RUN_REG_KEY}" "${PRODUCT_FILENAME}"
      DeleteRegValue HKLM "${RUN_REG_KEY}" "${PRODUCT_FILENAME}"
    ${endif}
    ClearErrors

    WriteRegStr SHELL_CONTEXT "${INSTALL_REGISTRY_KEY}" DesktopShortcut $gWantDesktopShortcut
    WriteRegStr SHELL_CONTEXT "${INSTALL_REGISTRY_KEY}" RunAtLogin $gWantRunAtLogin
  ${endif}
!macroend

!macro customUnInstall
  DeleteRegValue HKCU "${RUN_REG_KEY}" "${PRODUCT_FILENAME}"
  DeleteRegValue HKLM "${RUN_REG_KEY}" "${PRODUCT_FILENAME}"
  ClearErrors

  # 静默卸载与自动更新不弹窗（自动更新走 --updated，用户数据必须保留）
  ${ifNot} ${Silent}
    ${ifNot} ${isUpdated}
      !insertmacro localize_uninstall_text
      MessageBox MB_YESNO|MB_ICONQUESTION "$gDeleteDataQuestion" IDNO keepUserData
        # electron 的 userData 目录名可能来自 productFilename、productName 或 package.json name
        ${if} $installMode == "all"
          SetShellVarContext current
        ${endif}
        RMDir /r "$APPDATA\${APP_FILENAME}"
        !ifdef APP_PRODUCT_FILENAME
          RMDir /r "$APPDATA\${APP_PRODUCT_FILENAME}"
        !endif
        RMDir /r "$APPDATA\${APP_PACKAGE_NAME}"
        ${if} $installMode == "all"
          SetShellVarContext all
        ${endif}
      keepUserData:
    ${endif}
  ${endif}
!macroend
