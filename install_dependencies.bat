@echo off
echo Installing dependencies...

:: المكتبات الأساسية
npm install --save mssql @types/mssql
npm install --save bcrypt @types/bcrypt
npm install --save jsonwebtoken @types/jsonwebtoken
npm install --save @auth/nextjs-edge
npm install --save zod
npm install --save axios

:: مكتبات الواجهة وإدارة الحالة
npm install --save @tanstack/react-query
npm install --save zustand
npm install --save @hookform/resolvers

:: مكتبات المكونات والتصميم
npm install --save @radix-ui/react-dialog
npm install --save @radix-ui/react-dropdown-menu
npm install --save @radix-ui/react-label
npm install --save @radix-ui/react-menubar
npm install --save @radix-ui/react-select
npm install --save @radix-ui/react-separator
npm install --save @radix-ui/react-slot
npm install --save @radix-ui/react-tabs
npm install --save class-variance-authority
npm install --save clsx
npm install --save tailwind-merge

:: مكتبات الأدوات والمساعدة
npm install --save date-fns
npm install --save react-hook-form
npm install --save react-hot-toast
npm install --save recharts

:: مكتبات التطوير
npm install --save-dev @types/node
npm install --save-dev @types/react
npm install --save-dev @types/react-dom
npm install --save-dev eslint
npm install --save-dev eslint-config-next
npm install --save-dev prettier
npm install --save-dev typescript
npm install --save-dev @typescript-eslint/parser
npm install --save-dev @typescript-eslint/eslint-plugin

echo Dependencies installed successfully!
pause
