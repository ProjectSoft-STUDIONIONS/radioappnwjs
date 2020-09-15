; BEGIN ISPPBUILTINS.ISS


; END ISPPBUILTINS.ISS


[Setup]
AppId={{E71B86C4-BF18-420C-89E2-68F1546C59B7}
AppName=Your Radio
AppVersion=2.0
AppVerName=Your Radio v2.0
AppCopyright=Copyright В© 2010 all right reserved ProjectSoft && STUDIONIONS
AppMutex=Your Radio
AppPublisher=ProjectSoft && STUDIONIONS
AppPublisherURL=https://projectsoft.ru/
AppSupportURL=https://projectsoft.ru/
AppContact=projectsoft2009@yandex.ru
AppComments=Your Radio
; AppUpdatesURL={#GitReleace}

VersionInfoVersion=2.0
VersionInfoCompany=ProjectSoft && STUDIONIONS
VersionInfoDescription=Your Radio. Copyright В© 2010 all right reserved ProjectSoft && STUDIONIONS
VersionInfoTextVersion=Your Radio v2.0
VersionInfoCopyright=Copyright В© 2010 all right reserved ProjectSoft && STUDIONIONS
VersionInfoProductName=Your Radio
VersionInfoProductVersion=2.0
VersionInfoProductTextVersion=Your Radio v2.0

DefaultDirName={commonpf}\YourRadio
; DefaultGroupName=\

; Compression=lzma/ultra
SolidCompression=false
; InternalCompressLevel=ultra
; CompressionThreads=5

OutputDir=installer
OutputBaseFilename=YourRadio
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
; App 32
Source: "build\normal\radioapp\win32\credits.html"; DestDir: {app}; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\d3dcompiler_47.dll"; DestDir: {app}; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\ffmpeg.dll"; DestDir: {app}; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\icudtl.dat"; DestDir: {app}; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\libEGL.dll"; DestDir: {app}; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\libGLESv2.dll"; DestDir: {app}; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\node.dll"; DestDir: {app}; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\notification_helper.exe"; DestDir: {app}; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\nw.dll"; DestDir: {app}; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\nw_100_percent.pak"; DestDir: {app}; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\nw_200_percent.pak"; DestDir: {app}; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\nw_elf.dll"; DestDir: {app}; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\radioapp.exe"; DestDir: {app}; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\resources.pak"; DestDir: {app}; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\v8_context_snapshot.bin"; DestDir: {app}; Flags: solidbreak ; 
; swiftshader 32
Source: "build\normal\radioapp\win32\swiftshader\libEGL.dll"; DestDir: {app}\swiftshader\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\swiftshader\libGLESv2.dll"; DestDir: {app}\swiftshader\; Flags: solidbreak ; 
; pnacl

; locales
Source: "build\normal\radioapp\win32\locales\am.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\am.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ar.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ar.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\bg.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\bg.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\bn.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\bn.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ca.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ca.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\cs.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\cs.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\da.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\da.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\de.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\de.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\el.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\el.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\en-GB.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\en-GB.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\en-US.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\en-US.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\es-419.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\es-419.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\es.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\es.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\et.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\et.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\fa.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\fa.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\fi.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\fi.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\fil.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\fil.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\fr.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\fr.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\gu.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\gu.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\he.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\he.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\hi.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\hi.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\hr.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\hr.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\hu.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\hu.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\id.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\id.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\it.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\it.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ja.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ja.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\kn.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\kn.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ko.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ko.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\lt.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\lt.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\lv.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\lv.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ml.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ml.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\mr.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\mr.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ms.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ms.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\nb.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\nb.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\nl.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\nl.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\pl.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\pl.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\pt-BR.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\pt-BR.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\pt-PT.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\pt-PT.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ro.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ro.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ru.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ru.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\sk.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\sk.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\sl.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\sl.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\sr.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\sr.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\sv.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\sv.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\sw.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\sw.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ta.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\ta.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\te.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\te.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\th.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\th.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\tr.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\tr.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\uk.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\uk.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\vi.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\vi.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\zh-CN.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\zh-CN.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\zh-TW.pak"; DestDir: {app}\locales\; Flags: solidbreak ; 
Source: "build\normal\radioapp\win32\locales\zh-TW.pak.info"; DestDir: {app}\locales\; Flags: solidbreak ; 

