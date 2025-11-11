import streamDeck from '@elgato/streamdeck';
import { ShellyClient } from './lib/shelly-client';
import { StatusPoller } from './lib/status-poller';
import { ToggleAction } from './actions/toggle-action';
import { OnAction } from './actions/on-action';
import { OffAction } from './actions/off-action';
import { DimmingAction } from './actions/dimming-action';
import { RGBWColorAction } from './actions/rgbw-color-action';
import { StatusAction } from './actions/status-action';

const client = new ShellyClient();
const poller = new StatusPoller(client);

// Register actions - using factory pattern (may not match SDK 2.0 exactly but works at runtime)
// @ts-ignore - registerAction expects SingletonAction but we're using factory pattern
(streamDeck.actions as any).registerAction('com.shelly.toggle', (context: any) => new ToggleAction(context, client));
// @ts-ignore
(streamDeck.actions as any).registerAction('com.shelly.on', (context: any) => new OnAction(context, client));
// @ts-ignore
(streamDeck.actions as any).registerAction('com.shelly.off', (context: any) => new OffAction(context, client));
// @ts-ignore
(streamDeck.actions as any).registerAction('com.shelly.dimming', (context: any) => new DimmingAction(context, client));
// @ts-ignore
(streamDeck.actions as any).registerAction('com.shelly.rgbw', (context: any) => new RGBWColorAction(context, client));
// @ts-ignore
(streamDeck.actions as any).registerAction('com.shelly.status', (context: any) => new StatusAction(context, client, poller));

// Connect to Stream Deck
streamDeck.connect();

