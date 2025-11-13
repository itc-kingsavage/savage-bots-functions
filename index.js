// Main bot connector and exports
import savageXConnector from './bots/savage-x/connector.js';
import deUnknownConnector from './bots/de-unknown/connector.js';
import queenRixieConnector from './bots/queen-rixie/connector.js';

export {
  savageXConnector,
  deUnknownConnector,
  queenRixieConnector
};

// Initialize bots
export function initializeBots() {
  console.log('🦅 Savage Bots Initializing...');
  
  const bots = {
    savageX: savageXConnector(),
    deUnknown: deUnknownConnector(),
    queenRixie: queenRixieConnector()
  };
  
  console.log('✅ All bots activated successfully');
  return bots;
}

// Bot manager
export class BotManager {
  constructor() {
    this.bots = new Map();
    this.activeBots = new Set();
  }
  
  registerBot(name, connector) {
    this.bots.set(name, connector);
    this.activeBots.add(name);
    console.log(`🤖 Registered bot: ${name}`);
  }
  
  getBot(name) {
    return this.bots.get(name);
  }
  
  getAllBots() {
    return Array.from(this.bots.values());
  }
  
  removeBot(name) {
    this.bots.delete(name);
    this.activeBots.delete(name);
    console.log(`🗑️ Removed bot: ${name}`);
  }
}

// Global bot instance
const botManager = new BotManager();

// Auto-initialize Savage-X bot
botManager.registerBot('savage-x', savageXConnector());

// PORT BINDING FOR RENDER
const PORT = process.env.PORT || 3000;

// Simple HTTP server to bind port
import { createServer } from 'http';
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: '🦅 Savage Bots Running', 
    bots: Array.from(botManager.activeBots),
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, () => {
  console.log(`🚀 Savage Bots deployed on port ${PORT}`);
  console.log(`🦅 Savage-X: ✅ Active`);
  console.log(`🔮 De-Unknown: ✅ Ready`); 
  console.log(`👑 Queen Rixie: ✅ Online`);
});

export default botManager;
