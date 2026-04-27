@echo off
setlocal
cd /d "%~dp0auth-cart-service"
if errorlevel 1 goto err

echo [auth-cart-service] npm install...
call npm install
if errorlevel 1 goto err

echo [auth-cart-service] prisma db push (cree ou met a jour les tables depuis schema.prisma)...
call npx prisma db push
if errorlevel 1 goto err

echo [auth-cart-service] prisma generate...
call npx prisma generate
if errorlevel 1 goto err

cd /d "%~dp0support-service"
if errorlevel 1 goto err

echo [support-service] npm install...
call npm install
if errorlevel 1 goto err

echo [support-service] prisma generate (client depuis le schema auth)...
call npm run db:generate
if errorlevel 1 goto err

echo.
echo OK : tables synchronisees, clients Prisma generes.
echo Si erreur de connexion : verifie DATABASE_URL (Neon) dans auth-cart-service et support-service .env
exit /b 0

:err
echo Echec (code %errorlevel%).
exit /b 1
