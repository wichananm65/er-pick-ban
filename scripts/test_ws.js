const WebSocket = require('ws');
const url = 'ws://localhost:3001/ws';
const ws = new WebSocket(url);
ws.on('open', () => {
  console.log('connected');
  ws.send(JSON.stringify({ type: 'init-room', roomCode: 'TEST1' }));
});
ws.on('message', (data) => {
  console.log('recv:', data.toString());
  ws.close();
});
ws.on('error', (e) => console.error('err', e));
