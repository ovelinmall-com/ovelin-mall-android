import React, { useRef, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  ActivityIndicator,
  BackHandler,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';

const SITE_URL = 'https://ovelinmall-ovelin-mall.hf.space/';

export default function App() {
  const webviewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  // Hardware back button on Android navigates back inside WebView
  React.useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBack = () => {
      if (canGoBack && webviewRef.current) {
        webviewRef.current.goBack();
        return true; // handled
      }
      return false; // let OS handle (exit)
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [canGoBack]);

  const onNavChange = (nav: WebViewNavigation) => {
    setCanGoBack(nav.canGoBack);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FF0055" barStyle="light-content" />

      <WebView
        ref={webviewRef}
        source={{ uri: SITE_URL }}
        style={styles.webview}
        onNavigationStateChange={onNavChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        // Keep cookies & session alive
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        // Allow all mixed content (HTTP resources inside HTTPS page)
        mixedContentMode="always"
        // Enable JS & DOM storage
        javaScriptEnabled
        domStorageEnabled
        // Enable file downloads
        allowFileAccess
        allowUniversalAccessFromFileURLs
        // Hide the loading bar that WebView shows natively
        startInLoadingState={false}
        // User agent — appears as a normal Android browser
        userAgent="Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 OvelinMallApp/1.0"
        // Inject JS to hide any "install app" banners if present
        injectedJavaScript={`
          (function() {
            var style = document.createElement('style');
            style.innerHTML = '#app-install-banner, .install-prompt { display: none !important; }';
            document.head.appendChild(style);
          })();
          true;
        `}
      />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#FF0055" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF0055',
  },
  webview: {
    flex: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
