const fs = require('fs');
fs.mkdirSync('src/app/[workspaceId]');
fs.renameSync('src/app/dashboard', 'src/app/[workspaceId]/dashboard');
