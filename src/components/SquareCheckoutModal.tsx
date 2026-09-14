import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'
import * as WebBrowser from 'expo-web-browser'
import { Ionicons } from '@expo/vector-icons'
import { businessApi, ApiError } from '../services/api'
import { colors } from '../constants'

type CheckoutMode = 'subscribe' | 'update'

type Props = {
  visible: boolean
  mode?: CheckoutMode
  planKey: string
  planName: string
  priceLabel?: string
  amountCents?: number
  currency?: string
  businessId: string | number
  buyerEmail?: string
  buyerName?: string
  onClose: () => void
  onSuccess: (updated: Record<string, unknown>) => void
}

function buildCheckoutHtml({
  applicationId,
  locationId,
  environment,
  amountCents,
  currency,
  planName,
  buyerName,
  buyerEmail,
  enableApplePay,
}: {
  applicationId: string
  locationId: string
  environment?: string
  amountCents: number
  currency: string
  planName: string
  buyerName: string
  buyerEmail: string
  enableApplePay: boolean
}) {
  const sdk =
    environment === 'production'
      ? 'https://web.squarecdn.com/v1/square.js'
      : 'https://sandbox.web.squarecdn.com/v1/square.js'
  const amount = Math.max(1, Number(amountCents) || 0) / 100
  const amountStr = amount.toFixed(2) === '0.00' ? '0.01' : amount.toFixed(2)
  const currencyCode = String(currency || 'GBP').toUpperCase()
  const country = currencyCode === 'USD' ? 'US' : currencyCode === 'EUR' ? 'IE' : 'GB'
  const isGb = country === 'GB'

  const safe = (value: string) =>
    String(value || '')
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, ' ')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <script src="${sdk}"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 16px; background: #0b1220; color: #f8fafc; }
    #card-container { min-height: 90px; margin: 12px 0 16px; padding: 12px; border-radius: 12px; background: #111827; border: 1px solid #1e293b; }
    button { width: 100%; border: 0; border-radius: 999px; padding: 14px 16px; font-size: 16px; font-weight: 700; }
    button:disabled { opacity: 0.6; }
    #pay-btn { background: #ff4081; color: #fff; }
    #apple-pay-btn {
      display: none; width: 100%; height: 48px; margin-bottom: 10px; border-radius: 999px;
      background: #000; color: #fff; font-size: 16px; font-weight: 700;
      align-items: center; justify-content: center; gap: 8px;
    }
    #apple-pay-btn.show { display: flex; }
    #google-pay-btn { display: none; height: 48px; margin-bottom: 10px; overflow: hidden; border-radius: 999px; }
    #google-pay-btn.show { display: block; }
    .divider { display: none; text-align: center; color: #94a3b8; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; margin: 14px 0; position: relative; }
    .divider.show { display: block; }
    .divider span { background: #0b1220; padding: 0 8px; position: relative; z-index: 1; }
    .divider:before { content: ''; position: absolute; left: 0; right: 0; top: 50%; border-top: 1px solid #1e293b; }
    .err { color: #f87171; font-size: 13px; margin-top: 10px; min-height: 18px; }
    .hint { color: #94a3b8; font-size: 13px; line-height: 1.4; }
  </style>
</head>
<body>
  <p class="hint">Pay securely with Apple Pay, Google Pay, or card. Processed by Square.</p>
  <button id="apple-pay-btn" type="button" aria-label="Pay with Apple Pay">Pay with Apple Pay</button>
  <div id="google-pay-btn" role="button" aria-label="Pay with Google Pay"></div>
  <div class="divider" id="wallet-divider"><span>or pay with card</span></div>
  <div id="card-container"></div>
  <button id="pay-btn" disabled>Loading…</button>
  <div class="err" id="err"></div>
  <script>
    const post = (payload) => {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    };
    const setErr = (msg) => { document.getElementById('err').textContent = msg || ''; };
    const enableApplePay = ${enableApplePay ? 'true' : 'false'};
    const verificationDetails = {
      intent: 'STORE',
      customerInitiated: true,
      sellerKeyedIn: false,
      billingContact: (function () {
        const parts = '${safe(buyerName)}'.trim().split(/\\s+/).filter(Boolean);
        const givenName = parts[0] || 'Customer';
        const familyName = parts.length > 1 ? parts.slice(1).join(' ') : 'Account';
        return {
          givenName,
          familyName,
          email: '${safe(buyerEmail)}' || undefined,
          countryCode: '${country}',
          addressLines: ['${isGb ? '1 Example Street' : '1 Main Street'}'],
          city: '${isGb ? 'London' : 'New York'}',
          postalCode: '${isGb ? 'SW1A 1AA' : '10001'}',
        };
      })(),
    };

    async function boot() {
      try {
        if (!window.Square) throw new Error('Square SDK failed to load');
        const payments = window.Square.payments('${safe(applicationId)}', '${safe(locationId)}');
        const currencyCode = '${currencyCode}';
        const amount = '${amountStr}';
        const buildRequest = () => payments.paymentRequest({
          countryCode: '${country}',
          currencyCode,
          requestBillingContact: true,
          total: { amount, label: '${safe(planName)}' || 'Check A Review subscription' },
        });

        let walletShown = false;

        if (enableApplePay) {
          try {
            const applePay = await payments.applePay(buildRequest());
            const appleBtn = document.getElementById('apple-pay-btn');
            appleBtn.classList.add('show');
            appleBtn.onclick = async () => {
              setErr('');
              appleBtn.disabled = true;
              try {
                const result = await applePay.tokenize(verificationDetails);
                if (result.status !== 'OK' || !result.token) {
                  throw new Error(
                    (result.errors && result.errors[0] && result.errors[0].message) ||
                      'Apple Pay failed',
                  );
                }
                post({ type: 'token', token: result.token, verificationToken: result.verificationToken || null });
              } catch (err) {
                if (!/cancel/i.test((err && err.message) || '')) {
                  const msg = err && err.message ? err.message : 'Apple Pay failed';
                  setErr(msg);
                  post({ type: 'error', message: msg });
                }
              } finally {
                appleBtn.disabled = false;
              }
            };
            walletShown = true;
          } catch (err) {
            post({
              type: 'apple_pay_unavailable',
              message: (err && err.message) || 'Apple Pay is not available in this session',
            });
          }
        }

        try {
          const googlePay = await payments.googlePay(buildRequest());
          const googleWrap = document.getElementById('google-pay-btn');
          await googlePay.attach('#google-pay-btn', {
            buttonColor: 'black',
            buttonType: 'plain',
            buttonSizeMode: 'fill',
          });
          googleWrap.classList.add('show');
          googleWrap.onclick = async () => {
            setErr('');
            try {
              const result = await googlePay.tokenize(verificationDetails);
              if (result.status !== 'OK' || !result.token) {
                throw new Error((result.errors && result.errors[0] && result.errors[0].message) || 'Google Pay failed');
              }
              post({ type: 'token', token: result.token, verificationToken: result.verificationToken || null });
            } catch (err) {
              if (!/cancel/i.test((err && err.message) || '')) {
                setErr(err && err.message ? err.message : 'Google Pay failed');
              }
            }
          };
          walletShown = true;
        } catch (err) {
          /* Google Pay optional */
        }

        if (walletShown) document.getElementById('wallet-divider').classList.add('show');

        const card = await payments.card();
        await card.attach('#card-container');
        const btn = document.getElementById('pay-btn');
        btn.disabled = false;
        btn.textContent = 'Pay with card';
        btn.onclick = async () => {
          btn.disabled = true;
          btn.textContent = 'Processing…';
          setErr('');
          try {
            const result = await card.tokenize(verificationDetails);
            if (result.status !== 'OK' || !result.token) {
              throw new Error((result.errors && result.errors[0] && result.errors[0].message) || 'Card tokenization failed');
            }
            post({ type: 'token', token: result.token, verificationToken: result.verificationToken || null });
          } catch (err) {
            setErr(err && err.message ? err.message : 'Payment failed');
            btn.disabled = false;
            btn.textContent = 'Pay with card';
            post({ type: 'error', message: err && err.message ? err.message : 'Payment failed' });
          }
        };
        post({ type: 'ready' });
      } catch (err) {
        setErr(err && err.message ? err.message : 'Could not load payment form');
        post({ type: 'error', message: err && err.message ? err.message : 'Could not load payment form' });
      }
    }
    boot();
  </script>
</body>
</html>`
}

export function SquareCheckoutModal({
  visible,
  mode = 'subscribe',
  planKey,
  planName,
  priceLabel,
  amountCents = 0,
  currency = 'GBP',
  businessId,
  buyerEmail = '',
  buyerName = '',
  onClose,
  onSuccess,
}: Props) {
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [paying, setPaying] = useState(false)
  const [openingApplePay, setOpeningApplePay] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const payingRef = useRef(false)
  // Apple Pay cannot reliably tokenize inside RN WebView (Apple blocks Payment Request
  // when the WebView uses script messaging). Use Safari Payment Link on iOS instead.
  const showSafariApplePay = Platform.OS === 'ios' && mode === 'subscribe'

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    setLoadingConfig(true)
    setError(null)
    setHtml(null)
    businessApi
      .getSquareConfig()
      .then((config) => {
        if (cancelled) return
        if (!config?.cardPaymentsEnabled || !config.applicationId || !config.locationId) {
          throw new Error(
            'Square card payments are not configured. Add SQUARE_APPLICATION_ID on the API.',
          )
        }
        setHtml(
          buildCheckoutHtml({
            applicationId: config.applicationId,
            locationId: config.locationId,
            environment: config.environment,
            amountCents,
            currency,
            planName,
            buyerName,
            buyerEmail,
            enableApplePay: false,
          }),
        )
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : err.message || 'Could not load checkout')
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingConfig(false)
      })
    return () => {
      cancelled = true
    }
  }, [visible, amountCents, currency, planName, buyerName, buyerEmail])

  async function handleToken(token: string, verificationToken?: string | null) {
    if (payingRef.current) return
    payingRef.current = true
    setPaying(true)
    setError(null)
    try {
      const updated =
        mode === 'update'
          ? await businessApi.updatePaymentMethod(businessId, token, verificationToken || undefined)
          : await businessApi.payWithCard(businessId, planKey, token, verificationToken || undefined)
      onSuccess(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Payment failed')
    } finally {
      payingRef.current = false
      setPaying(false)
    }
  }

  async function handleMessage(event: WebViewMessageEvent) {
    let payload: {
      type?: string
      token?: string
      verificationToken?: string | null
      message?: string
    }
    try {
      payload = JSON.parse(event.nativeEvent.data)
    } catch {
      return
    }

    if (payload.type === 'error' && payload.message) {
      setError(payload.message)
      return
    }
    if (payload.type === 'token' && payload.token) {
      await handleToken(payload.token, payload.verificationToken)
    }
  }

  async function openApplePayInSafari() {
    setOpeningApplePay(true)
    setError(null)
    try {
      const checkout = await businessApi.createCheckout(businessId, planKey)
      if (!checkout?.url) throw new Error('Could not create Apple Pay checkout link')
      const result = await WebBrowser.openBrowserAsync(checkout.url, {
        dismissButtonStyle: 'close',
        enableBarCollapsing: true,
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      })
      if (result.type === 'cancel' || result.type === 'dismiss') {
        try {
          const updated = await businessApi.confirmCheckout(businessId)
          if (updated?.plan && updated.plan !== 'free') {
            onSuccess(updated)
            return
          }
        } catch {
          /* payment may not have completed */
        }
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Could not open Apple Pay'
      setError(
        /catalog object/i.test(message)
          ? 'Square plan catalog needs a refresh. Try again in a moment.'
          : message,
      )
    } finally {
      setOpeningApplePay(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.page }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
              {mode === 'update' ? 'Change payment method' : 'Checkout'}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 4, fontSize: 13 }}>
              {planName}
              {priceLabel ? ` · ${priceLabel}` : ''}
              {mode === 'update' ? '' : ' · Company billing via Square'}
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10} disabled={paying || openingApplePay}>
            <Ionicons name="close" size={26} color={colors.muted} />
          </Pressable>
        </View>

        {error ? (
          <Text style={{ color: colors.danger, paddingHorizontal: 16, paddingTop: 12 }}>{error}</Text>
        ) : null}

        {showSafariApplePay ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <Pressable
              onPress={openApplePayInSafari}
              disabled={openingApplePay || paying}
              style={({ pressed }) => ({
                backgroundColor: '#000',
                borderRadius: 999,
                minHeight: 48,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                opacity: openingApplePay || paying ? 0.6 : pressed ? 0.85 : 1,
              })}
            >
              {openingApplePay ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Apple Pay</Text>
                </>
              )}
            </Pressable>
            <View style={{ alignItems: 'center', marginTop: 14, marginBottom: 4 }}>
              <Text style={{ color: colors.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>
                or pay with card
              </Text>
            </View>
          </View>
        ) : null}

        {loadingConfig || !html ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.accent} />
            <Text style={{ color: colors.muted, marginTop: 12 }}>Loading Square checkout…</Text>
          </View>
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html, baseUrl: 'https://squareup.com' }}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
            style={{ flex: 1, backgroundColor: colors.page, opacity: paying ? 0.5 : 1 }}
          />
        )}

        {paying ? (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 24,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <ActivityIndicator color={colors.accent} />
              <Text style={{ color: colors.text, fontWeight: '600' }}>Processing payment…</Text>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  )
}
