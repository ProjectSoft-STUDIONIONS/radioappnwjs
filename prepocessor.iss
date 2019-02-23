#pragma parseroption -p-
#define FileEntry(Source, DestDir, Check, Flags) \
	"Source: \"" + Source + "\"; DestDir: " + DestDir + "; " + \
	(Flags ? "Flags: " + Flags + "; " : "") + \
	(Check ? "Check: " + Check : "") + "\n"
#define ProcessFile(Source, DestDir, FindResult, FindHandle, Flags, Check) \
	FindResult \
		? \
			Local[0] = FindGetFileName(FindHandle), \
			Local[1] = Source + "\\" + Local[0], \
			(Local[0] != "." && Local[0] != ".." \
				? (DirExists(Local[1]) \
					? ProcessFolder(Local[1], DestDir + "\\" + Local[0], Flags, Check) \
					: FileEntry(Local[1], DestDir, Check, Flags)) \
				: "") + ProcessFile(Source, DestDir, FindNext(FindHandle), FindHandle, Flags, Check) : ""
#define ProcessFolder(Source, DestDir, Flags, Check) \
	Local[0] = FindFirst(Source + "\\*", faAnyFile), \
	ProcessFile(Source, DestDir, Local[0], Local[0], Flags, Check)
#define ScanDirProcess(Source, DestDir, FindResult, FindHandle, Flags, Check) \
	FindResult \
		? \
			Local[0] = FindGetFileName(FindHandle), \
			Local[1] = Source + "\\" + Local[0], \
			(Local[0] != "." && Local[0] != ".." \
				? (DirExists(Local[1]) \
					? "" \
					: FileEntry(Local[1], DestDir, Check, Flags)) \
				: "") + ScanDirProcess(Source, DestDir, FindNext(FindHandle), FindHandle, Flags, Check) \
		: ""
#define ProcessScanDir(Source, DestDir, Flags, Check) \
	Local[0] = FindFirst(Source + "\\*", faAnyFile), \
	ScanDirProcess(Source, DestDir, Local[0], Local[0], Flags, Check)
#pragma parseroption -p+