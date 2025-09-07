# EMFILE Error Fix

## Problem
The "EMFILE: too many open files" error occurs when Vite/Node.js runs out of file descriptors, particularly common on Windows when working with large dependency trees like MUI.

## Solution Applied

### 1. Vite Configuration Optimization
Added to `vite.config.ts`:
```typescript
server: {
  watch: {
    usePolling: false,
    useFsEvents: false,
  },
  fs: {
    strict: false,
  },
},
optimizeDeps: {
  include: [
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
  ],
},
```

### 2. Dependency Cleanup
- Removed and reinstalled `node_modules` to clear any corruption
- Added `.npmrc` for better npm behavior

### 3. Icon Import Optimization
- Already using specific icon imports instead of barrel imports
- MUI icons are pre-bundled in optimizeDeps

## Prevention
- Use specific imports instead of `import * from '@mui/icons-material'`
- Keep dependencies updated
- Restart dev server if file watching gets overloaded

## If Error Persists
1. Restart the development server
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. On Windows, increase file descriptor limit in PowerShell:
   ```powershell
   # Run as Administrator
   Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Kernel" -Name "ObCaseInsensitive" -Value 1
   ```
