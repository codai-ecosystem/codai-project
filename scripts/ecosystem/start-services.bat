@echo off
echo 🚀 Starting CodAI Ecosystem Services...

:: Define services and ports
set "services=admin:4002 aide:4003 ajutai:4004 analizai:4005 bancai:4006 codai:4030 cumparai:4007 curtai:4008 dash:4009 dexai:4010 docs:4011 explorer:4012 hub:4013 jucai:4014 kodex:4015 legalizai:4016 logai:4017 marketai:4018 memorai:4019 mobile:4020 mod:4021 muzicai:4022 publicai:4023 sociai:4024 stocai:4025 studiai:4026 tools:4027 wallet:4028 x:4029"

:: Start each service
for %%s in (%services%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        echo Starting %%a on port %%b...
        start "%%a Service" cmd /k "cd apps\%%a && pnpm install --ignore-workspace && pnpm dev --port %%b"
        timeout /t 3 /nobreak >nul
    )
)

echo ✅ All services are starting!
echo Check http://localhost:[port] for each service
pause
