import { spawn } from 'child_process';

const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

console.log('🚀 Starting Fullstack Application...');

// Start WebSocket Server
const wsServer = spawn('node', ['server.mjs'], {
  env: { ...process.env, PORT: WS_PORT },
  stdio: 'inherit',
  shell: true
});

// Start Next.js Server  
const nextServer = spawn('npm', ['run', 'start'], {
  env: { ...process.env, PORT },
  stdio: 'inherit',
  shell: true
});

// Graceful shutdown
process.on('SIGTERM', () => {
  nextServer.kill();
  wsServer.kill();
  process.exit(0);
});