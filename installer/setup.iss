; Power BI Insights Hub - Inno Setup Script
; ==========================================
; This script creates a Windows installer for Power BI Insights Hub

#define MyAppName "Power BI Insights Hub"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Sulaiman Ahmed"
#define MyAppURL "https://github.com/sulaiman013/power-bi-insights-hub"
#define MyAppExeName "Start_PowerBI_Expert.bat"

[Setup]
; Basic Info
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Install Location
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; Output
OutputDir=..\dist
OutputBaseFilename=PowerBI_Insights_Hub_Setup_{#MyAppVersion}
Compression=lzma2/ultra64
SolidCompression=yes

; Appearance
WizardStyle=modern
; SetupIconFile=..\assets\icon.ico  ; Uncomment and add icon.ico to assets folder
UninstallDisplayIcon={app}\PowerBI_Expert_Server.exe

; Privileges (run as admin for proper installation)
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog

; License
LicenseFile=..\backend\LICENSE

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1; Check: not IsAdminInstallMode

[Files]
; Backend executable
Source: "..\dist\PowerBI_Insights_Hub\PowerBI_Expert_Server.exe"; DestDir: "{app}"; Flags: ignoreversion

; Frontend files
Source: "..\dist\PowerBI_Insights_Hub\frontend\*"; DestDir: "{app}\frontend"; Flags: ignoreversion recursesubdirs createallsubdirs

; Launcher
Source: "..\dist\PowerBI_Insights_Hub\Start_PowerBI_Expert.bat"; DestDir: "{app}"; Flags: ignoreversion

; Documentation
Source: "..\dist\PowerBI_Insights_Hub\README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\dist\PowerBI_Insights_Hub\LICENSE"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: quicklaunchicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: shellexec postinstall skipifsilent

[Code]
// Check for prerequisites
function InitializeSetup(): Boolean;
begin
  Result := True;

  // Check if Power BI Desktop is recommended
  if not RegKeyExists(HKEY_LOCAL_MACHINE, 'SOFTWARE\Microsoft\Microsoft Power BI Desktop') and
     not RegKeyExists(HKEY_CURRENT_USER, 'SOFTWARE\Microsoft\Microsoft Power BI Desktop') then
  begin
    if MsgBox('Power BI Desktop is not detected on this system.' + #13#10 + #13#10 +
              'Power BI Insights Hub works best with Power BI Desktop installed.' + #13#10 +
              'You can still install, but some features may be limited.' + #13#10 + #13#10 +
              'Do you want to continue with the installation?',
              mbConfirmation, MB_YESNO) = IDNO then
    begin
      Result := False;
    end;
  end;
end;

// Show completion message
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    MsgBox('Installation complete!' + #13#10 + #13#10 +
           'To use Power BI Insights Hub:' + #13#10 +
           '1. Open a .pbix file in Power BI Desktop' + #13#10 +
           '2. Launch Power BI Insights Hub from the Start Menu' + #13#10 +
           '3. Configure your AI provider in Settings' + #13#10 +
           '4. Click "Discover & Connect" to connect to Power BI' + #13#10 + #13#10 +
           'For help, visit: ' + '{#MyAppURL}',
           mbInformation, MB_OK);
  end;
end;
