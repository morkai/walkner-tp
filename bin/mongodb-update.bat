@echo off

set OLD_CD=%CD%
set NEW_CD=%~dp0
set DB_HOST=%TP_MONGODB_PRIMARY%
set DB_NAME=%1

if [%1] == [] SET DB_NAME=walkner-tp
if [%DB_HOST%] == [] set DB_HOST=localhost

set AUTH=--authenticationDatabase %DB_NAME% --username %TP_MONGODB_USER% --password %TP_MONGODB_PASS%

if [%TP_MONGODB_USER%] == [] set AUTH=

cd %NEW_CD%
call mongosh --host %DB_HOST% %AUTH% %DB_NAME% %NEW_CD%mongodb-update.js
cd %OLD_CD%
