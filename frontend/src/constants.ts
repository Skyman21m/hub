export const localStorageKeys = {
  returnTo: "returnTo",
  setupReturnTo: "setupReturnTo",
  channelOrder: "channelOrder",
  authToken: "authToken",
  supportAlbySidebarHintHiddenUntil: "supportAlbySidebarHintHiddenUntil",
  aiHeroDismissed: "aiHeroDismissed",
  cardsHeroDismissed: "cardsHeroDismissed",
  homeStoriesViewed: "homeStoriesViewed",
};

export const ONCHAIN_DUST_SATS = 1000;
export const ALBY_HIDE_HOSTED_BALANCE_BELOW = 100;
export const ALBY_MIN_HOSTED_BALANCE_FOR_FIRST_CHANNEL = 10_000;

export const LIST_TRANSACTIONS_LIMIT = 20;
export const LIST_APPS_LIMIT = 20;
export const MAX_FREE_SUBWALLETS = 3;
export const PAY_FROM_SELECT_APPS_LIMIT = 100;

export const SUPPORT_ALBY_CONNECTION_NAME = `ZapPlanner - Alby Hub`;
export const SUPPORT_ALBY_LIGHTNING_ADDRESS = "hub@getalby.com";

export const SUBWALLET_APPSTORE_APP_ID = "uncle-jim";
export const ALBY_ACCOUNT_APP_NAME = "getalby.com";

export const DEFAULT_APP_BUDGET_SATS = 100_000;
export const DEFAULT_APP_BUDGET_RENEWAL = "monthly";

export const BITCOIN_DISPLAY_FORMAT_BIP177 = "bip177";
export const BITCOIN_DISPLAY_FORMAT_SATS = "sats";

export const RELAY_PRESET_CUSTOM = "custom";

export type RelayPreset = {
  label: string;
  value: string;
};

export const RELAY_PRESETS: RelayPreset[] = [
  {
    label: "Alby (default)",
    value: "wss://relay.getalby.com,wss://relay2.getalby.com",
  },
  { label: "Alby Relay 1", value: "wss://relay.getalby.com" },
  { label: "Alby Relay 2", value: "wss://relay2.getalby.com" },
  { label: "Damus", value: "wss://relay.damus.io" },
  { label: "nos.lol", value: "wss://nos.lol" },
  { label: "nostr.band", value: "wss://relay.nostr.band" },
  { label: "Primal", value: "wss://relay.primal.net" },
];
