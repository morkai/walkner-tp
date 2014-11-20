@echo off
nssm stop walkner-tp
nssm remove walkner-tp confirm
nssm install walkner-tp "node.exe" "backend\main.js" "..\config\production\frontend.js"
nssm set walkner-tp AppDirectory "%~dp0.."
nssm set walkner-tp AppEnvironmentExtra "NODE_ENV=production"
nssm set walkner-tp AppStdout "%~dp0..\data\logs\walkner-tp.log"
nssm set walkner-tp AppStderr "%~dp0..\data\logs\walkner-tp.log"
nssm set walkner-tp Description "Aplikacja wspomagajaca zamawianie transportu."
nssm set walkner-tp DisplayName "Walkner TP"
nssm set walkner-tp Start SERVICE_AUTO_START
nssm set walkner-tp AppRotateFiles 1
nssm set walkner-tp AppRotateBytes 5242880
