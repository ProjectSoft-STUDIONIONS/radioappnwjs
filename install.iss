#define AppVersion '2.0.2'
#define AppCopyright 'Copyright В© 2010 all right reserved ProjectSoft && STUDIONIONS'
#define DirName 'YourRadio'

[Setup]
AppId={{E71B86C4-BF18-420C-89E2-68F1546C59B7}
AppName=Your Radio
AppVersion={#AppVersion}
AppVerName=Your Radio v{#AppVersion}
AppCopyright={#AppCopyright}
AppMutex=Your Radio
AppPublisher=ProjectSoft && STUDIONIONS
AppPublisherURL=https://projectsoft.ru/
AppSupportURL=https://projectsoft.ru/
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
; DefaultGroupName=\

; Compression=lzma/ultra
SolidCompression=false
; InternalCompressLevel=ultra
; CompressionThreads=5

OutputDir=installer
OutputBaseFilename={#DirName}
SetupIconFile=src/icon/favicon.ico
WizardImageFile=src/wizard/wizard.bmp
WizardSmallImageFile=src/wizard/logo.bmp

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

PrivilegesRequired=admin

; AppMutex=MyProgramsMutexName,Global\MyProgramsMutexName

[Languages]
Name: "ru"; MessagesFile: compiler:Languages\Russian.isl
Name: "en"; MessagesFile: "compiler:Default.isl"

[Messages]
AboutSetupNote=Your Radio Repository: https://github.com/ProjectSoft-STUDIONIONS/radioappnwjs


[CustomMessages]
ru.MyAppName=Ваше Радио
en.MyAppName=Your Radio
ru.MyUninstallText=Удалить
en.MyUninstallText=Uninstall

[Icons]
Name: "{commonstartmenu}\{cm:MyAppName}"; Filename: {app}\radioapp.exe; WorkingDir: {app}; IconFilename: {app}\radioapp.exe; IconIndex: 0

[Dirs]
Name: {app}\locales
Name: {app}\pnacl
Name: {app}\swiftshader

[UninstallDelete]
Name: {app}\; Type: filesandordirs

[Files]
#include AddBackslash(SourcePath) + "prepocessor.iss"
; App 32
#emit ProcessScanDir('build\normal\radioapp\win32', '{app}', 'solidbreak ', False)
; swiftshader 32
#emit ProcessScanDir('build\normal\radioapp\win32\swiftshader', '{app}\swiftshader\', 'solidbreak ', False)
; pnacl
#emit ProcessScanDir('build\normal\radioapp\win32\pnacl', '{app}\pnacl\', 'solidbreak ', False)
; locales
#emit ProcessScanDir('build\normal\radioapp\win32\locales', '{app}\locales\', 'solidbreak ', False)

#expr SaveToFile (AddBackslash (SourcePath) + ".install.iss")
