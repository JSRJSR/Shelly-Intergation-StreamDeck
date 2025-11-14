import streamDeck from '@elgato/streamdeck';
import { ShellyClient } from './lib/shelly-client';
import { ToggleAction } from './actions/toggle-action';
import { TestGen1LightAction } from './actions/test-gen1-light-action';

// Catch any uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[ShellyPlugin] UNCAUGHT EXCEPTION:', error);
  console.error('[ShellyPlugin] Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[ShellyPlugin] UNHANDLED REJECTION:', reason);
  console.error('[ShellyPlugin] Promise:', promise);
});

console.log('[ShellyPlugin] Starting plugin initialization...');
console.log('[ShellyPlugin] Process args:', process.argv);
console.log('[ShellyPlugin] Working directory:', process.cwd());

try {
  const client = new ShellyClient();
  console.log('[ShellyPlugin] ShellyClient created');

  // Register Toggle action
  console.log('[ShellyPlugin] Registering ToggleAction...');
  streamDeck.actions.registerAction(new ToggleAction(client));
  console.log('[ShellyPlugin] ToggleAction registered');

  // Register Test Gen1 Light action
  console.log('[ShellyPlugin] Registering TestGen1LightAction...');
  streamDeck.actions.registerAction(new TestGen1LightAction(client));
  console.log('[ShellyPlugin] TestGen1LightAction registered');

  // Connect to Stream Deck
  console.log('[ShellyPlugin] Connecting to Stream Deck...');
  streamDeck.connect();
  console.log('[ShellyPlugin] Connection initiated');
} catch (error) {
  console.error('[ShellyPlugin] FATAL ERROR during initialization:', error);
  console.error('[ShellyPlugin] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
  // Try to connect anyway - might still work
  try {
    streamDeck.connect();
  } catch (connectError) {
    console.error('[ShellyPlugin] Failed to connect:', connectError);
  }
}

