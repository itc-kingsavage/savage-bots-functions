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

export default botManager;
