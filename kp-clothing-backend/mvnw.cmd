@echo off
REM mvnw.cmd - Maven Wrapper for KP Clothing Backend
REM This script uses the locally installed Maven at %LOCALAPPDATA%\maven-install\apache-maven-3.9.9
set MAVEN_HOME=%LOCALAPPDATA%\maven-install\apache-maven-3.9.9
set PATH=%MAVEN_HOME%\bin;%PATH%
call mvn %*
