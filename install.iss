#define AppVersion '1.3'
#define AppCopyright 'Copyright © 2010 all right reserved ProjectSoft && STUDIONIONS'
#define DirName 'YouRadio'

[Setup]
AppId={{E71B86C4-BF18-420C-89E2-68F1546C59B7}
AppName=Your Radio
AppVersion={#AppVersion}
AppVerName=Your Radio v{#AppVersion}
AppCopyright={#AppCopyright}
AppMutex=Your Radio
AppPublisher=ProjectSoft && STUDIONIONS
AppPublisherURL=https://github.com/ProjectSoft-STUDIONIONS/radioappnwjs
AppSupportURL=https://github.com/ProjectSoft-STUDIONIONS/radioappnwjs
AppContact=projectsoft2009@yandex.ru
AppComments=Your Radio
; AppUpdatesURL={#GitReleace}

VersionInfoVersion={#AppVersion}
VersionInfoCompany=ProjectSoft && STUDIONIONS
VersionInfoDescription=Your Radio. {#AppCopyright}
VersionInfoTextVersion=Your Radio v{#AppVersion}
VersionInfoCopyright={#AppCopyright}
VersionInfoProductName=Your Radio
VersionInfoProductVersion={#AppVersion}
VersionInfoProductTextVersion=Your Radio v{#AppVersion}

DefaultDirName={commonpf}\{#DirName}
DefaultGroupName=Your Radio

; Compression=lzma/ultra
; SolidCompression=true
; InternalCompressLevel=ultra
; CompressionThreads=5

OutputDir=installer
OutputBaseFilename={#DirName}
SetupIconFile=package/favicon.ico
WizardImageFile=src/wizard.bmp
WizardSmallImageFile=src/logo.bmp

UninstallDisplayIcon={uninstallexe}

DisableWelcomePage=False
DisableReadyPage=true
DisableReadyMemo=true
DisableFinishedPage=false
FlatComponentsList=false
AlwaysShowComponentsList=false
ShowComponentSizes=false
WindowShowCaption=false
WindowResizable=false
UsePreviousAppDir=false
UsePreviousGroup=false
AppendDefaultDirName=false

; BackSolid=true
; WindowStartMaximized=false
DisableProgramGroupPage=true
DisableDirPage=true
ShowLanguageDialog=yes

; ArchitecturesInstallIn64BitMode=x64 запрашивает, чтобы установка была выполнена
; в 64-битном режиме. Ёто означает, что она должна использовать собственный
; каталог 64-битных программных файлов и 64-битное представление реестра.
; во всех остальных архитектурах он будет установлен в 32-битном режиме.
; Џримечание: мы не устанавливаем ProcessorsAllowed, потому что мы хотим,
; чтобы эта установка работала на всех архитектурах.
ArchitecturesInstallIn64BitMode=x64
; PrivilegesRequired=admin

[Languages]
Name: "ru"; MessagesFile: compiler:Languages\Russian.isl
Name: "en"; MessagesFile: "compiler:Default.isl"

[Messages]
AboutSetupNote=Your Radio Repository: https://github.com/ProjectSoft-STUDIONIONS/radioappnwjs


[CustomMessages]
ru.MyAppName=Ваше радио
en.MyAppName=Your Radio
ru.MyUninstallText=Удалить
en.MyUninstallText=Uninstall

[Icons]
Name: {group}\{cm:MyAppName}; Filename: {app}\radio.exe; WorkingDir: {app}; IconFilename: {app}\radio.exe; IconIndex: 0
Name: {group}\{cm:MyUninstallText} {cm:MyAppName}; Filename: {uninstallexe}

[Dirs]
Name: {app}\locales
Name: {app}\pnacl
Name: {app}\swiftshader

[UninstallDelete]
Name: {app}\; Type: filesandordirs

[Files]
#include AddBackslash(SourcePath) + "prepocessor.iss"
; App 64
#emit ProcessScanDir('.nwjs\normal\radio\win64', '{app}', False, 'Is64BitInstallMode')
; swiftshader 64
#emit ProcessScanDir('.nwjs\normal\radio\win64\swiftshader', '{app}\swiftshader\', False, 'Is64BitInstallMode')
; App 32
#emit ProcessScanDir('.nwjs\normal\radio\win32', '{app}', 'solidbreak ', 'not Is64BitInstallMode')
; swiftshader 32
#emit ProcessScanDir('.nwjs\normal\radio\win32\swiftshader', '{app}\swiftshader\', 'solidbreak ', 'not Is64BitInstallMode')

; App 32
; #emit ProcessScanDir('.nwjs\normal\radio\win32', '{app}', 'solidbreak ', False)
; swiftshader 32
; #emit ProcessScanDir('.nwjs\normal\radio\win32\swiftshader', '{app}\swiftshader\', 'solidbreak ', False)
; pnacl
; #emit ProcessScanDir('.nwjs\normal\radio\win32\pnacl', '{app}\pnacl\', 'solidbreak ', False)

; locales
#emit ProcessScanDir('.nwjs\normal\radio\win32\locales', '{app}\locales\', 'solidbreak ', False)

#expr SaveToFile (AddBackslash (SourcePath) + ".install.iss")
