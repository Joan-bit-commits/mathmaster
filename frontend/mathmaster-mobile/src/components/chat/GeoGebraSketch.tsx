import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export interface GeoGebraPayload {
  view: "2D" | "3D";
  title: string;
  commands: string[];
  axes?: boolean;
  grid?: boolean;
  x_min?: number;
  x_max?: number;
  y_min?: number;
  y_max?: number;
  x_label?: string;
  y_label?: string;
  z_label?: string;
}

interface Props {
  payload: GeoGebraPayload;
  height?: number;
}

// GeoGebra's documented loader. (The old code built ".../apps/deployggb/js/deployggb.js", which does not exist,
// so the script never loaded and every sketch ended on "unavailable".)
const GEOGEBRA_SCRIPT_SRC = "https://www.geogebra.org/apps/deployggb.js";
// The applet downloads a few MB on first use, so give slow mobile connections a fair chance.
const LOAD_TIMEOUT_MS = 20000;

export default function GeoGebraSketch({ payload, height = 340 }: Props) {
  const [loadState, setLoadState] = useState<"loading" | "ready" | "failed">("loading");
  const [attempt, setAttempt] = useState(0);
  const html = useMemo(() => buildHtml(payload), [payload]);
  const stateRef = useRef(loadState);
  stateRef.current = loadState;

  useEffect(() => {
    setLoadState("loading");
    const timer = setTimeout(() => {
      if (stateRef.current === "loading") setLoadState("failed");
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [payload, attempt]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="shape-outline" size={16} color="#006591" />
        <Text style={styles.title} numberOfLines={1}>
          {payload.title || (payload.view === "3D" ? "3D sketch" : "Sketch")}
        </Text>
        <Text style={styles.badge}>{payload.view}</Text>
      </View>

      <View style={[styles.frame, { height }]}>
        <WebView
          key={attempt}
          originWhitelist={["*"]}
          source={{ html, baseUrl: "https://www.geogebra.org" }}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
          startInLoadingState
          nestedScrollEnabled
          renderLoading={() => (
            <View style={styles.overlay}>
              <ActivityIndicator color="#006591" />
              <Text style={styles.overlayText}>Building {payload.view} workspace…</Text>
            </View>
          )}
          onMessage={(event) => {
            const data = event.nativeEvent.data;
            if (data === "ggb-ready") setLoadState("ready");
            else if (data?.startsWith("ggb-error:")) setLoadState("failed");
          }}
          onError={() => setLoadState("failed")}
          onHttpError={() => setLoadState("failed")}
        />
        {loadState === "failed" && (
          <View style={styles.overlay}>
            <MaterialCommunityIcons name="wifi-off" size={26} color="#6e7881" />
            <Text style={styles.failedTitle}>Couldn't load the sketch</Text>
            <Text style={styles.overlayText}>Check your connection and try again.</Text>
            <Pressable
              onPress={() => setAttempt((n) => n + 1)}
              accessibilityRole="button"
              accessibilityLabel="Retry loading the sketch"
              style={styles.retry}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}
      </View>

      {payload.view === "3D" && <Text style={styles.hint}>Drag to rotate · Pinch to zoom</Text>}
    </View>
  );
}

function buildHtml(payload: GeoGebraPayload): string {
  const appName = payload.view === "3D" ? "3d" : "classic";
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
<style>
  html, body { margin: 0; padding: 0; height: 100%; background: #fff; overflow: hidden; }
  #ggb { width: 100vw; height: 100vh; }
</style>
<script>
  function post(message) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(message);
  }
  // The commands are baked into the page. (Posting them from React Native after load never reached the page
  // on Android, which delivers WebView messages to \`document\`, not \`window\`.)
  var COMMANDS = ${JSON.stringify(payload.commands || [])};
  function safe(fn) { try { fn(); } catch (e) {} }
  var parameters = {
    appName: ${JSON.stringify(appName)},
    showToolBar: false, showAlgebraInput: false, showMenuBar: false,
    showZoomButtons: true, allowStyleBar: false, showFullscreenButton: false,
    enableRightClick: false, enableLabelDrags: false, enableShiftDragZoom: true,
    preventFocus: true, borderColor: null,
    appletOnLoad: function (api) {
      // Each step is isolated: one unsupported call must never block the sketch from showing.
      ${buildConfigJs(payload)}
      for (var i = 0; i < COMMANDS.length; i++) safe(function () { api.evalCommand(COMMANDS[i]); });
      post('ggb-ready');
    }
  };
</script>
<script src="${GEOGEBRA_SCRIPT_SRC}" onerror="post('ggb-error:script')"></script>
</head>
<body>
  <div id="ggb"></div>
  <script>
    if (typeof GGBApplet === 'undefined') {
      post('ggb-error:script');
    } else {
      parameters.width = window.innerWidth;
      parameters.height = window.innerHeight;
      new GGBApplet(parameters, true).inject('ggb');
    }
  </script>
</body>
</html>`;
}

function buildConfigJs(p: GeoGebraPayload): string {
  if (p.view === "2D") {
    const xmin = p.x_min ?? -5, xmax = p.x_max ?? 5, ymin = p.y_min ?? -5, ymax = p.y_max ?? 5;
    const axes = p.axes !== false, grid = p.grid !== false;
    const lines = [
      `safe(function () { api.setCoordSystem(${xmin}, ${xmax}, ${ymin}, ${ymax}); });`,
      `safe(function () { api.setAxesVisible(${axes}, ${axes}); });`,
      `safe(function () { api.setGridVisible(${grid}); });`,
    ];
    if (p.x_label || p.y_label) {
      lines.push(
        `safe(function () { api.setAxisLabels(1, ${JSON.stringify(p.x_label || "x")}, ${JSON.stringify(p.y_label || "y")}); });`,
      );
    }
    return lines.join("\n      ");
  }
  return `safe(function () { api.setAxisLabels(-1, ${JSON.stringify(p.x_label || "x")}, ${JSON.stringify(p.y_label || "y")}, ${JSON.stringify(p.z_label || "z")}); });`;
}

// Same card language as the rest of the app: no outline, soft shadow, 24px radius.
const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    shadowColor: "#006591",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 1,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10 },
  title: { flex: 1, fontSize: 14, fontWeight: "600", color: "#0b1c30" },
  badge: { fontSize: 11, fontWeight: "700", color: "#3e4850", backgroundColor: "#e5eeff", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: "hidden" },
  frame: { backgroundColor: "#ffffff" },
  overlay: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", backgroundColor: "#eff4ff", padding: 20, gap: 6 },
  overlayText: { fontSize: 13, color: "#3e4850", textAlign: "center" },
  failedTitle: { marginTop: 4, fontSize: 15, fontWeight: "600", color: "#0b1c30" },
  retry: { marginTop: 10, borderRadius: 12, backgroundColor: "#006591", paddingHorizontal: 20, paddingVertical: 9 },
  retryText: { fontSize: 14, fontWeight: "600", color: "#ffffff" },
  hint: { fontSize: 11, color: "#6e7881", textAlign: "center", paddingVertical: 8 },
});