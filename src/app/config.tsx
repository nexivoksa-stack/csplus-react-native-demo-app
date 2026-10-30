import { DEFAULT_CONFIG } from "@/lib/config";
import { useConfig } from "@/state/config-context";
import { Body, Button, Card, Field, H1, Screen, Segmented } from "@/ui/kit";

export default function ConfigScreen() {
  const { config, update, loaded } = useConfig();
  return (
    <Screen>
      <H1>Config</H1>
      {!loaded ? <Body muted>Loading saved settings…</Body> : null}

      <Card title="How the app proves itself">
        <Segmented
          value={config.mode}
          onChange={(mode) => update({ mode })}
          options={[
            { value: "publishable", label: "Publishable key" },
            { value: "signed", label: "Signed (grant)" },
          ]}
        />
        <Body muted>
          {config.mode === "publishable"
            ? "The key ships in the app. It is not a secret: anyone can extract it."
            : "The app holds no credential. A server you control mints a single-use grant for each call."}
        </Body>
      </Card>

      {config.mode === "publishable" ? (
        <Card title="Publishable key">
          <Field label="Public key" value={config.publicKey} onChangeText={(publicKey) => update({ publicKey })} placeholder="csp_pk_live_…" />
          <Field label="Token endpoint (optional)" value={config.tokenEndpoint} onChangeText={(tokenEndpoint) => update({ tokenEndpoint })} placeholder="https://api.csplus.ai/v1/web/token" hint="Leave empty for production. Point at staging to test." />
          <Field label="Agent id (optional)" value={config.agentId} onChangeText={(agentId) => update({ agentId })} hint="Empty = the key's default agent." />
          <Field label="Language (optional)" value={config.lang} onChangeText={(lang) => update({ lang })} placeholder="en" />
        </Card>
      ) : (
        <Card title="Mint server">
          <Field label="Mint server URL" value={config.mintUrl} onChangeText={(mintUrl) => update({ mintUrl })} placeholder="http://10.0.2.2:8787" hint="Android emulator: http://10.0.2.2:8787. A real phone: your computer's LAN address." />
          <Field label="Token endpoint (optional)" value={config.tokenEndpoint} onChangeText={(tokenEndpoint) => update({ tokenEndpoint })} placeholder="https://api.csplus.ai/v1/web/token" />
          <Field label="Agent id (sent to the mint server)" value={config.agentId} onChangeText={(agentId) => update({ agentId })} />
          <Field label="Language (sent to the mint server)" value={config.lang} onChangeText={(lang) => update({ lang })} placeholder="en" />
        </Card>
      )}

      <Card title="This app">
        <Field label="App id" value={config.appId} onChangeText={(appId) => update({ appId })} hint="Declared, not proven. The key must list it to allow native apps." />
        <Body muted>Background behaviour is on the Lifecycle tab.</Body>
      </Card>

      <Button title="Reset to defaults" kind="secondary" onPress={() => update(DEFAULT_CONFIG)} />
    </Screen>
  );
}
