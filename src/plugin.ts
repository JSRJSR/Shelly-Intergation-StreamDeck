import { StreamDeckPlugin } from '@elgato/streamdeck';
import { ShellyClient } from './lib/shelly-client';
import { StatusPoller } from './lib/status-poller';
import { ToggleAction } from './actions/toggle-action';
import { OnAction } from './actions/on-action';
import { OffAction } from './actions/off-action';
import { DimmingAction } from './actions/dimming-action';
import { RGBWColorAction } from './actions/rgbw-color-action';
import { StatusAction } from './actions/status-action';

const plugin = new StreamDeckPlugin();
const client = new ShellyClient();
const poller = new StatusPoller(client);

// Register actions
plugin.registerAction('com.shelly.toggle', (context) => new ToggleAction(context, client));
plugin.registerAction('com.shelly.on', (context) => new OnAction(context, client));
plugin.registerAction('com.shelly.off', (context) => new OffAction(context, client));
plugin.registerAction('com.shelly.dimming', (context) => new DimmingAction(context, client));
plugin.registerAction('com.shelly.rgbw', (context) => new RGBWColorAction(context, client));
plugin.registerAction('com.shelly.status', (context) => new StatusAction(context, client, poller));

plugin.run();

