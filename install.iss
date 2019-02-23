#define AppName '¬аше –адио'
#define AppVersion '1.0'
#define AppCopyright 'Copyright © 2010 all right reserved ProjectSoft && STUDIONIONS'
#define InstallText '”далить'
#define DirName 'YouRadio'
#define AppNameDir 'radio'
[Setup]
AppId={{E71B86C4-BF18-420C-89E2-68F1546C59B7}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppVersion}
AppCopyright={#AppCopyright}
AppMutex={#AppName}
AppPublisher=ProjectSoft && STUDIONIONS
AppPublisherURL=http://studionions.ru/
AppSupportURL=http://studionions.ru/
AppContact=projectsoft2009@yandex.ru
AppComments={#AppName}
; AppUpdatesURL={#GitReleace}

VersionInfoVersion={#AppVersion}
VersionInfoCompany=ProjectSoft && STUDIONIONS
VersionInfoDescription={#AppName}. {#AppCopyright}
VersionInfoTextVersion={#AppVersion}
VersionInfoCopyright={#AppCopyright}
VersionInfoProductName={#AppName}
VersionInfoProductVersion={#AppVersion}
VersionInfoProductTextVersion={#AppName} v{#AppVersion}

DefaultDirName={pf}\{#DirName}
DefaultGroupName={#AppName}

Compression=lzma/ultra
SolidCompression=true
InternalCompressLevel=ultra
CompressionThreads=5

OutputDir=installer
OutputBaseFilename=YouRadio
SetupIconFile=package/favicon.ico
WizardImageFile=src/wizard.bmp
WizardSmallImageFile=src/logo.bmp


UninstallDisplayName={#InstallText} {#AppName}
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

BackSolid=true
WindowStartMaximized=false
DisableProgramGroupPage=true
DisableDirPage=true
ShowLanguageDialog=no

; ArchitecturesInstallIn64BitMode=x64 запрашивает, чтобы установка была выполнена
; в 64-битном режиме. Ёто означает, что она должна использовать собственный
; каталог 64-битных программных файлов и 64-битное представление реестра.
; ј во всех остальных архитектурах он будет установлен в 32-битном режиме.
; ѕримечание: мы не устанавливаем ProcessorsAllowed, потому что мы хотим,
; чтобы эта установка работала на всех архитектурах.
ArchitecturesInstallIn64BitMode=x64
PrivilegesRequired=admin

[Languages]
Name: russian; MessagesFile: compiler:Languages\Russian.isl

[Messages]
AboutSetupMenuItem=&© ProjectSoft 2018

[Icons]
Name: {group}\{#AppName}; Filename: {app}\radio.exe; WorkingDir: {app}; IconFilename: {app}\radio.exe; IconIndex: 0
Name: {group}\”далить; Filename: {uninstallexe}

[Dirs]
Name: {app}\locales
Name: {app}\pnacl
Name: {app}\swiftshader

[UninstallDelete]
Name: {app}\; Type: filesandordirs

[Files]
#include AddBackslash(SourcePath) + "prepocessor.iss"
; App 64
#emit ProcessScanDir('.nwjs\normal\' + AppNameDir + '\win64', '{app}', False, 'Is64BitInstallMode')
; swiftshader 64
#emit ProcessScanDir('.nwjs\normal\' + AppNameDir + '\win64\swiftshader', '{app}\swiftshader\', False, 'Is64BitInstallMode')
; App 32
#emit ProcessScanDir('.nwjs\normal\' + AppNameDir + '\win32', '{app}', 'solidbreak ', 'not Is64BitInstallMode')
; swiftshader 32
#emit ProcessScanDir('.nwjs\normal\' + AppNameDir + '\win32\swiftshader', '{app}\swiftshader\', 'solidbreak ', 'not Is64BitInstallMode')
; pnacl
#emit ProcessScanDir('.nwjs\normal\' + AppNameDir + '\win32\pnacl', '{app}\pnacl\', 'solidbreak ', False)
; locales
#emit ProcessScanDir('.nwjs\normal\' + AppNameDir + '\win32\locales', '{app}\locales\', 'solidbreak ', False)

#expr SaveToFile (AddBackslash (SourcePath) + ".install.iss")
