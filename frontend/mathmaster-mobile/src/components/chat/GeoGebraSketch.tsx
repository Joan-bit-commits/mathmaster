import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
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

const GEOGEBRA_SCRIPT_SRC = "https://www.geogebra.org/apps/deployggb.js";
const LOAD_TIMEOUT_MS = 8000;

export default function GeoGebraSketch({ payload, height = 380 }: Props) {
  const webViewRef = useRef<WebView>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "failed">("loading");
  const html = useMemo(() => buildHtml(payload), [payload]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadState((prev) => (prev === "loading" ? "failed" : prev));
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [payload]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="shape" size={16} color="#0EA5E9" />
          <Text style={styles.title} numberOfLines={1}>
            {payload.title || (payload.view === "3D" ? "3D Sketch" : "Sketch")}
          </Text>
        </View>
        <View style={[styles.badge, payload.view === "3D" ? styles.badge3d : styles.badge2d]}>
          <Text style={styles.badgeText}>{payload.view}</Text>
        </View>
      </View>
      <View style={[styles.frame, { height }]}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html }}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          mixedContentMode="always"
          scalesPageToFit
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#0EA5E9" />
              <Text style={styles.loadingText}>Building {payload.view} workspace…</Text>
            </View>
          )}
          onMessage={(event) => {
            const data = event.nativeEvent.data;
            if (data === "ggb-ready") {
              webViewRef.current?.postMessage(JSON.stringify(payload.commands || []));
              setLoadState("ready");
            } else if (data?.startsWith("ggb-error:")) setLoadState("failed");
          }}
          onError={() => setLoadState("failed")}
        />
        {loadState === "failed" && (
          <View style={styles.failed}>
            <MaterialCommunityIcons name="alert-circle" size={32} color="#F43F5E" />
            <Text style={styles.failedTitle}>Sketch unavailable</Text>
            <Text style={styles.failedText}>GeoGebra failed to load. Check your internet and try again.</Text>
          </View>
        )}
      </View>
      {payload.view === "3D" && (
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>💡 Drag to rotate · Scroll to zoom</Text>
        </View>
      )}
    </View>
  );
}

function buildHtml(payload: GeoGebraPayload): string {
  const appName = payload.view === "3D" ? "3d" : "classic";
  const ggbBase = "https://www.geogebra.org/apps/deployggb/";
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
  var parameters = {
    appName: ${JSON.stringify(appName)},
    width: window.innerWidth, height: window.innerHeight,
    showToolBar: true, showAlgebraInput: true, showMenuBar: false,
    enableRightClick: true, enableLabelDrags: true, preventFocus: true,
    appletOnLoad: function(api) {
      try {
        ${buildConfigJs(payload)}
        window.addEventListener('message', function(ev) {
          try {
            var cmds = JSON.parse(ev.data);
            if (Array.isArray(cmds)) for (var i = 0; i < cmds.length; i++) try { api.evalCommand(cmds[i]); } catch (e) {}
          } catch (e) {}
        });
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage('ggb-ready');
      } catch (e) {
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage('ggb-error:' + e.message);
      }
    }
  };
</script>
<script src="${ggbBase}js/deployggb.js"></script>
</head>
<body>
  <div id="ggb"></div>
  <script>
    var applet = new GGBApplet(parameters, true);
    applet.inject('ggb');
  </script>
</body>
</html>`;
}

function buildConfigJs(p: GeoGebraPayload): string {
  if (p.view === "2D") {
    const xmin = p.x_min ?? -5, xmax = p.x_max ?? 5, ymin = p.y_min ?? -5, ymax = p.y_max ?? 5;
    const axes = p.axes !== false, grid = p.grid !== false;
    return [
      `api.setCoordSystem(${xmin}, ${xmax}, ${ymin}, ${ymax});`,
      `api.setAxesVisible(${axes}, ${axes});`,
      `api.setGridVisible(${grid});`,
      p.x_label ? `api.setAxisLabel(0, ${JSON.stringify(p.x_label)});` : "",
      p.y_label ? `api.setAxisLabel(1, ${JSON.stringify(p.y_label)});` : "",
    ].join("\n");
  }
  return `api.set3DView(${JSON.stringify(p.x_label || "x")}, ${JSON.stringify(p.y_label || "y")}, ${JSON.stringify(p.z_label || "z")});`;
}

const styles = StyleSheet.create({
  container: { marginVertical: 8, borderRadius: 12, overflow: "hidden", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#F8FAFC", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  title: { fontSize: 14, fontWeight: "600", color: "#0F172A", flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badge2d: { backgroundColor: "#0EA5E9" }, badge3d: { backgroundColor: "#A855F7" },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  frame: { backgroundColor: "#fff" },
  loading: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  loadingText: { marginTop: 8, color: "#64748B", fontSize: 13 },
  failed: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "#FEF2F2", padding: 20 },
  failedTitle: { marginTop: 8, fontSize: 15, fontWeight: "600", color: "#9F1239" },
  failedText: { marginTop: 4, fontSize: 13, color: "#9F1239", textAlign: "center" },
  hintBar: { borderTopWidth: 1, borderTopColor: "#E2E8F0", backgroundColor: "#F8FAFC", paddingHorizontal: 12, paddingVertical: 6 },
  hintText: { fontSize: 11, color: "#64748B", textAlign: "center" },
});
