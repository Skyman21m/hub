import {
  CheckIcon,
  LockIcon,
  MonitorIcon,
  MoonIcon,
  StarsIcon,
  SunIcon,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import Loading from "src/components/Loading";
import SettingsHeader from "src/components/SettingsHeader";
import { ThemePreview } from "src/components/ThemePreview";
import { UpgradeDialog } from "src/components/UpgradeDialog";
import { Badge } from "src/components/ui/badge";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { Separator } from "src/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "src/components/ui/tabs";
import { DarkMode, Themes, useTheme } from "src/components/ui/theme-provider";
import {
  BITCOIN_DISPLAY_FORMAT_BIP177,
  BITCOIN_DISPLAY_FORMAT_SATS,
  RELAY_PRESET_CUSTOM,
  RELAY_PRESETS,
} from "src/constants";
import { useAlbyMe } from "src/hooks/useAlbyMe";
import { useCurrencies } from "src/hooks/useCurrencies";
import { useInfo } from "src/hooks/useInfo";
import { cn } from "src/lib/utils";
import { handleRequestError } from "src/utils/handleRequestError";
import { request } from "src/utils/request";

function Settings() {
  const { data: albyMe } = useAlbyMe();
  const { theme, darkMode, setTheme, setDarkMode } = useTheme();
  const { currencies, isLoading: isCurrenciesLoading } = useCurrencies();
  const [showUpgradeDialog, setShowUpgradeDialog] = React.useState(false);

  const { data: info, mutate: reloadInfo } = useInfo();

  async function updateSettings(
    payload: Record<string, string | boolean>,
    successMessage: string,
    errorMessage: string
  ) {
    try {
      await request("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      await reloadInfo();
      toast(successMessage);
    } catch (error) {
      console.error(error);
      handleRequestError(errorMessage, error);
    }
  }

  async function updateCurrency(currency: string) {
    await updateSettings(
      { currency },
      `Currency set to ${currency}`,
      "Failed to update currencies"
    );
  }

  async function updateBitcoinDisplayFormat(bitcoinDisplayFormat: string) {
    await updateSettings(
      { bitcoinDisplayFormat },
      "Bitcoin display format updated",
      "Failed to update bitcoin display format"
    );
  }

  const currentRelayValue = React.useMemo(
    () => info?.relays.map((r: { url: string }) => r.url).join(",") ?? "",
    [info?.relays]
  );

  const matchedPreset = React.useMemo(
    () => RELAY_PRESETS.find((p) => p.value === currentRelayValue),
    [currentRelayValue]
  );

  const [relaySelection, setRelaySelection] = React.useState<string>(
    matchedPreset ? matchedPreset.value : RELAY_PRESET_CUSTOM
  );
  const [customRelayUrl, setCustomRelayUrl] = React.useState<string>(
    matchedPreset ? "" : currentRelayValue
  );
  const [isSavingCustomRelay, setIsSavingCustomRelay] = React.useState(false);

  React.useEffect(() => {
    setRelaySelection(
      matchedPreset ? matchedPreset.value : RELAY_PRESET_CUSTOM
    );
    setCustomRelayUrl(matchedPreset ? "" : currentRelayValue);
  }, [matchedPreset, currentRelayValue]);

  async function saveRelayUrls(urls: string[]) {
    try {
      await request("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ relayUrls: urls }),
      });
      await reloadInfo();
      toast("Nostr relay updated. Restart Alby Hub to apply.");
    } catch (error) {
      console.error(error);
      handleRequestError("Failed to update relay", error);
    }
  }

  async function onRelayPresetChange(value: string) {
    setRelaySelection(value);
    if (value === RELAY_PRESET_CUSTOM) {
      return;
    }
    await saveRelayUrls(value.split(","));
  }

  async function onSaveCustomRelay() {
    const trimmed = customRelayUrl.trim();
    if (!trimmed) {
      toast.error("Enter a wss:// URL");
      return;
    }
    setIsSavingCustomRelay(true);
    try {
      await saveRelayUrls(
        trimmed
          .split(",")
          .map((u: string) => u.trim())
          .filter(Boolean)
      );
    } finally {
      setIsSavingCustomRelay(false);
    }
  }

  const customRelayList = customRelayUrl
    .split(",")
    .map((u: string) => u.trim())
    .filter(Boolean);

  const MAX_CUSTOM_RELAYS = 4;

  function appendPresetToCustom(url: string) {
    setCustomRelayUrl((prev: string) => {
      const trimmedPrev = prev.trim();
      const existing = trimmedPrev
        ? trimmedPrev
            .split(",")
            .map((u: string) => u.trim())
            .filter(Boolean)
        : [];
      if (existing.includes(url)) {
        return trimmedPrev;
      }
      if (existing.length >= MAX_CUSTOM_RELAYS) {
        return trimmedPrev;
      }
      return existing.length === 0 ? url : `${existing.join(",")},${url}`;
    });
  }

  if (!info) {
    return <Loading />;
  }

  const paidThemes = ["matrix", "ghibli", "claymorphism"];
  const hasPlan = !!albyMe?.subscription.plan_code;

  const darkModeOptions: {
    value: DarkMode;
    icon: React.ReactNode;
    label: string;
  }[] = [
    { value: "light", icon: <SunIcon className="size-4" />, label: "Light" },
    { value: "dark", icon: <MoonIcon className="size-4" />, label: "Dark" },
    {
      value: "system",
      icon: <MonitorIcon className="size-4" />,
      label: "System",
    },
  ];

  return (
    <>
      <SettingsHeader
        pageTitle="Settings"
        title="General"
        description="Customize how Alby Hub looks and feels."
      />
      <div className="flex flex-col gap-6 pb-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-sm">
            <h3 className="font-semibold">Appearance</h3>
            <p className="text-muted-foreground">
              Choose a theme and light/dark mode.
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label id="theme-label">Theme</Label>
              <div
                role="radiogroup"
                aria-labelledby="theme-label"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
              >
                {Themes.map((t) => {
                  const isPaidTheme = paidThemes.includes(t);
                  const isDisabled = isPaidTheme && !hasPlan;
                  const isSelected = theme === t;

                  return (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        if (isDisabled) {
                          setShowUpgradeDialog(true);
                          return;
                        }
                        setTheme(t);
                        toast("Theme updated.");
                      }}
                      className={cn(
                        "group relative flex flex-col rounded-lg border-2 text-left transition-all w-full overflow-hidden hover:border-primary/50",
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border",
                        isDisabled
                          ? "cursor-not-allowed opacity-60 hover:border-border"
                          : "cursor-pointer"
                      )}
                    >
                      <ThemePreview theme={t} />
                      <div className="flex items-center justify-center gap-1.5 py-1.5 px-1 w-full">
                        <span className="text-xs font-medium capitalize truncate">
                          {t}
                        </span>
                        {isPaidTheme && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0"
                          >
                            <StarsIcon className="size-2.5" />
                            Pro
                          </Badge>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-primary flex items-center justify-center">
                          <CheckIcon className="size-2.5 text-primary-foreground" />
                        </div>
                      )}
                      {isDisabled && (
                        <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-background flex items-center justify-center">
                          <LockIcon className="size-2.5 text-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <UpgradeDialog
                open={showUpgradeDialog}
                onOpenChange={setShowUpgradeDialog}
              />
            </div>

            <div className="space-y-3">
              <Label id="dark-mode-label">Mode</Label>
              <Tabs value={darkMode}>
                <TabsList>
                  {darkModeOptions.map((option) => (
                    <TabsTrigger
                      value={option.value}
                      onClick={() => {
                        setDarkMode(option.value);
                        toast("Appearance updated.");
                      }}
                      className="px-3"
                    >
                      {option.icon}
                      {option.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-sm">
            <h3 className="font-semibold">Units & Currency</h3>
            <p className="text-muted-foreground">
              Choose how amounts are displayed.
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="bitcoinDisplayFormat">Display Unit</Label>
              <Select
                value={info.bitcoinDisplayFormat}
                onValueChange={updateBitcoinDisplayFormat}
              >
                <SelectTrigger className="w-full md:w-60">
                  <SelectValue placeholder="Select a display format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BITCOIN_DISPLAY_FORMAT_BIP177}>
                    ₿
                  </SelectItem>
                  <SelectItem value={BITCOIN_DISPLAY_FORMAT_SATS}>
                    sats
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="currency">Fiat Currency</Label>
              <Select
                value={info?.currency}
                onValueChange={updateCurrency}
                disabled={isCurrenciesLoading}
              >
                <SelectTrigger className="w-full md:w-60">
                  <SelectValue
                    placeholder={
                      isCurrenciesLoading
                        ? "Loading currencies..."
                        : "Select a currency"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name} ({code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-sm">
            <h3 className="font-semibold">Nostr Relay</h3>
            <p className="text-muted-foreground">
              Relay used for Nostr Wallet Connect. A restart of Alby Hub is
              required for changes to take effect.
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="relay">Relay</Label>
              <Select
                value={relaySelection}
                onValueChange={onRelayPresetChange}
              >
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue placeholder="Select a relay" />
                </SelectTrigger>
                <SelectContent>
                  {RELAY_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                  <SelectItem value={RELAY_PRESET_CUSTOM}>Custom…</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {relaySelection === RELAY_PRESET_CUSTOM && (
              <div className="grid gap-1.5">
                <Label htmlFor="customRelayUrl">Custom relay URL</Label>
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <Input
                    id="customRelayUrl"
                    placeholder="wss://your-relay.example"
                    value={customRelayUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCustomRelayUrl(e.target.value)
                    }
                    className="w-full md:w-80"
                  />
                  <Button
                    type="button"
                    onClick={onSaveCustomRelay}
                    disabled={isSavingCustomRelay || !customRelayUrl.trim()}
                  >
                    {isSavingCustomRelay ? "Saving…" : "Save"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Multiple relays can be entered separated by commas (up to{" "}
                  {MAX_CUSTOM_RELAYS}).
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Quick add ({customRelayList.length}/{MAX_CUSTOM_RELAYS}):
                  </span>
                  {RELAY_PRESETS.filter((p) => !p.value.includes(",")).map(
                    (preset) => {
                      const alreadyAdded = customRelayList.includes(
                        preset.value
                      );
                      const atLimit =
                        customRelayList.length >= MAX_CUSTOM_RELAYS;
                      return (
                        <Button
                          key={preset.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={alreadyAdded || atLimit}
                          onClick={() => appendPresetToCustom(preset.value)}
                        >
                          {alreadyAdded ? "✓ " : "+ "}
                          {preset.label}
                        </Button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;
