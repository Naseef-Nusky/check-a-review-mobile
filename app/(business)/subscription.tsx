import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { businessApi, ApiError } from '../../src/services/api'
import { useAuth } from '../../src/context/AuthContext'
import { Button, Card, ErrorText, Screen, Subtitle } from '../../src/components/ui'
import { SquareCheckoutModal } from '../../src/components/SquareCheckoutModal'
import { colors } from '../../src/constants'

type PlanCatalogItem = {
  key: string
  name?: string
  tagline?: string
  priceLabel?: string
  periodLabel?: string
  monthlyAmountCents?: number
  currency?: string
  features?: string[]
  notes?: string[]
  checkout?: string
  ctaLabel?: string
  trialDays?: number
}

type PaymentRow = {
  id?: string | number
  plan?: string
  amount?: number
  currency?: string
  status?: string
  created_at?: string
  createdAt?: string
}

type SubscriptionData = {
  plan?: string
  status?: string
  current_period_end?: string
  cancelAtPeriodEnd?: string
  cancellationScheduled?: boolean
  squareConfigured?: boolean
  cardPaymentsEnabled?: boolean
  square_subscription_id?: string
  paymentOverdue?: boolean
  featuresSuspended?: boolean
  graceDaysRemaining?: number
  graceEndsAt?: string
  billingPlan?: string
  catalog?: PlanCatalogItem[]
  entitlements?: {
    usage?: {
      invitationsThisMonth?: number
      users?: number
      domains?: number
    }
    limits?: {
      invitationsPerMonth?: number
      invitationsPerMonthLabel?: string
      usersLabel?: string
      domainsLabel?: string
      widgetsLabel?: string
    }
  }
  paymentMethod?: {
    brand?: string
    last4?: string
    expMonth?: number
    expYear?: number
  }
}

function formatPlanDate(value?: string | null) {
  if (!value) return 'the end of your billing period'
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatMoney(cents?: number, currency = 'GBP') {
  const code = String(currency || 'GBP').toUpperCase()
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format((Number(cents) || 0) / 100)
  } catch {
    return `${code} ${((Number(cents) || 0) / 100).toFixed(2)}`
  }
}

export default function BusinessSubscriptionScreen() {
  const { user } = useAuth()
  const [businessId, setBusinessId] = useState<string | number | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [squareStatus, setSquareStatus] = useState<{
    squareConfigured: boolean
    cardPaymentsEnabled: boolean
    missing: string[]
  }>({ squareConfigured: false, cardPaymentsEnabled: false, missing: [] })
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [checkout, setCheckout] = useState<{
    mode: 'subscribe' | 'update'
    key: string
    name: string
    priceLabel?: string
    amountCents: number
    currency: string
  } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const profile = (await businessApi.getMyProfile()) as { id?: string | number }
      if (!profile?.id) throw new Error('Business profile not found')
      setBusinessId(profile.id)
      const [sub, history, squareConfig] = await Promise.all([
        businessApi.getSubscription(profile.id) as Promise<SubscriptionData>,
        businessApi.getPayments(profile.id).catch(() => []) as Promise<PaymentRow[]>,
        businessApi.getSquareConfig().catch(() => null),
      ])
      setSubscription(sub)
      setPayments(Array.isArray(history) ? history : [])

      const missing: string[] = []
      const appId = String(squareConfig?.applicationId || '')
      const locationId = String(squareConfig?.locationId || '')
      if (!appId || /your_square|change-me/i.test(appId)) missing.push('SQUARE_APPLICATION_ID')
      if (!locationId || /your_square|change-me/i.test(locationId)) missing.push('SQUARE_LOCATION_ID')
      if (!sub?.squareConfigured) missing.push('SQUARE_ACCESS_TOKEN')

      setSquareStatus({
        squareConfigured: Boolean(sub?.squareConfigured),
        cardPaymentsEnabled: Boolean(squareConfig?.cardPaymentsEnabled ?? sub?.cardPaymentsEnabled),
        missing: [...new Set(missing)],
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load subscription')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  const currentPlan = subscription?.plan || 'free'
  const catalog = subscription?.catalog || []
  const squareReady = squareStatus.squareConfigured && squareStatus.missing.length === 0
  const cardReady = squareStatus.cardPaymentsEnabled && squareStatus.missing.length === 0
  const cancelAccessUntil = subscription?.cancelAtPeriodEnd || subscription?.current_period_end
  const cancellationScheduled = Boolean(subscription?.cancellationScheduled)
  const primaryCurrency = useMemo(
    () => catalog.find((plan) => plan.currency)?.currency || 'GBP',
    [catalog],
  )

  const openCheckout = (plan: PlanCatalogItem) => {
    setError(null)
    setMessage(null)
    if (!squareReady || !cardReady) {
      Alert.alert(
        'Square not ready',
        squareStatus.missing.length
          ? `Replace placeholder values in check A review-backend/.env for:\n\n• ${squareStatus.missing.join(
              '\n• ',
            )}\n\nGet them from Square Developer Dashboard → Sandbox → Credentials, then restart the API (npm run dev).`
          : 'Square card payments are not ready yet. Check backend Square env keys and restart the API.',
      )
      return
    }
    setCheckout({
      mode: 'subscribe',
      key: plan.key,
      name: plan.name || plan.key,
      priceLabel: plan.priceLabel,
      amountCents: plan.monthlyAmountCents || 0,
      currency: plan.currency || primaryCurrency,
    })
  }

  const openUpdateCard = () => {
    if (!squareReady || !cardReady) {
      Alert.alert(
        'Square not ready',
        'Card payments need SQUARE_APPLICATION_ID and valid Square credentials on the API.',
      )
      return
    }
    const planMeta = catalog.find((item) => item.key === currentPlan)
    setError(null)
    setMessage(null)
    setCheckout({
      mode: 'update',
      key: currentPlan,
      name: planMeta?.name || currentPlan,
      priceLabel: planMeta?.priceLabel,
      amountCents: planMeta?.monthlyAmountCents || 0,
      currency: planMeta?.currency || primaryCurrency,
    })
  }

  const cancel = () => {
    if (!businessId) return
    Alert.alert(
      'Cancel subscription?',
      `You'll keep ${currentPlan} until ${formatPlanDate(cancelAccessUntil)}. You won't be charged again. This month's payment is not refunded.`,
      [
        { text: 'Keep plan', style: 'cancel' },
        {
          text: 'Cancel subscription',
          style: 'destructive',
          onPress: async () => {
            setWorking(true)
            setError(null)
            try {
              const updated = (await businessApi.cancelSubscription(businessId)) as SubscriptionData
              setSubscription((prev) => ({ ...(prev || {}), ...updated }))
              setMessage(
                `Subscription cancelled. You'll keep ${updated.plan || currentPlan} until ${formatPlanDate(
                  updated.cancelAtPeriodEnd || updated.current_period_end,
                )}.`,
              )
              await load()
            } catch (err) {
              setError(err instanceof ApiError ? err.message : 'Failed to cancel subscription')
            } finally {
              setWorking(false)
            }
          },
        },
      ],
    )
  }

  if (loading && !subscription) {
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} />
        <Subtitle>Loading subscription…</Subtitle>
      </Screen>
    )
  }

  return (
    <Screen style={{ paddingBottom: 0 }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={{ paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <Subtitle>Paid plans are priced and billed monthly in {primaryCurrency}.</Subtitle>

        <ErrorText>{error}</ErrorText>
        {message ? (
          <Card>
            <Text style={{ color: '#A7F3D0', lineHeight: 20 }}>{message}</Text>
          </Card>
        ) : null}

        {subscription?.featuresSuspended ? (
          <Card>
            <Text style={{ color: colors.danger, lineHeight: 20 }}>
              Your renewal is overdue and the grace period has ended. Paid features are paused until payment
              succeeds.
            </Text>
          </Card>
        ) : subscription?.paymentOverdue ? (
          <Card>
            <Text style={{ color: '#FCD34D', lineHeight: 20 }}>
              Renewal payment failed. You have {subscription.graceDaysRemaining || 0} day(s) left to retry
              payment
              {subscription.graceEndsAt ? ` (by ${formatPlanDate(subscription.graceEndsAt)})` : ''}.
            </Text>
          </Card>
        ) : null}

        {cancellationScheduled && currentPlan !== 'free' ? (
          <Card>
            <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 4 }}>
              Cancellation scheduled
            </Text>
            <Text style={{ color: colors.muted, lineHeight: 20 }}>
              You'll keep {currentPlan} until {formatPlanDate(cancelAccessUntil)}. No further charges after that.
            </Text>
          </Card>
        ) : null}

        {!squareReady || !cardReady ? (
          <Card>
            <Text style={{ color: '#FCD34D', fontWeight: '700', marginBottom: 6 }}>
              Square checkout needs setup
            </Text>
            <Text style={{ color: colors.muted, lineHeight: 20 }}>
              Your backend `.env` still has placeholder Square keys
              {squareStatus.missing.length ? ` (${squareStatus.missing.join(', ')})` : ''}. Replace them with real
              Sandbox credentials from the Square Developer Dashboard, then restart the API.
            </Text>
          </Card>
        ) : null}

        <Card>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Current plan</Text>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', marginTop: 4, textTransform: 'capitalize' }}>
            {currentPlan}
          </Text>
          <Text style={{ color: colors.muted, marginTop: 4, textTransform: 'capitalize' }}>
            Status: {cancellationScheduled ? 'Cancellation scheduled' : subscription?.status || 'active'}
          </Text>
          {subscription?.current_period_end && currentPlan !== 'free' ? (
            <Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>
              {cancellationScheduled
                ? `Access until ${formatPlanDate(cancelAccessUntil)}.`
                : `Auto-renews monthly on ${formatPlanDate(subscription.current_period_end)}.`}
            </Text>
          ) : null}

          {subscription?.paymentMethod?.last4 ? (
            <View
              style={{
                marginTop: 12,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 12,
                backgroundColor: colors.slate950,
              }}
            >
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700' }}>PAYMENT METHOD</Text>
              <Text style={{ color: colors.text, marginTop: 4, fontWeight: '600' }}>
                {String(subscription.paymentMethod.brand || 'Card')
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())}{' '}
                •••• {subscription.paymentMethod.last4}
                {subscription.paymentMethod.expMonth && subscription.paymentMethod.expYear
                  ? ` · Expires ${String(subscription.paymentMethod.expMonth).padStart(2, '0')}/${String(
                      subscription.paymentMethod.expYear,
                    ).slice(-2)}`
                  : ''}
              </Text>
            </View>
          ) : null}

          {subscription?.entitlements ? (
            <Text style={{ color: colors.muted, marginTop: 12, lineHeight: 20, fontSize: 13 }}>
              {Number(subscription.entitlements.limits?.invitationsPerMonth) > 0
                ? `${subscription.entitlements.usage?.invitationsThisMonth || 0}/${subscription.entitlements.limits?.invitationsPerMonthLabel || '—'} invitations · `
                : 'Invitations require a paid plan · '}
              {subscription.entitlements.usage?.users || 0}/
              {subscription.entitlements.limits?.usersLabel || '—'} users ·{' '}
              {subscription.entitlements.usage?.domains || 0}/
              {subscription.entitlements.limits?.domainsLabel || '—'} domains ·{' '}
              {subscription.entitlements.limits?.widgetsLabel || '—'} widgets
            </Text>
          ) : null}

          {currentPlan !== 'free' ? (
            <View style={{ marginTop: 14, gap: 10 }}>
              {cardReady && subscription?.square_subscription_id && !cancellationScheduled ? (
                <Button label="Change payment method" variant="ghost" onPress={openUpdateCard} disabled={working} />
              ) : null}
              {!cancellationScheduled ? (
                <Button
                  label={working ? 'Cancelling…' : 'Cancel subscription'}
                  variant="ghost"
                  onPress={cancel}
                  disabled={working}
                />
              ) : null}
            </View>
          ) : null}
        </Card>

        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18, marginTop: 8, marginBottom: 10 }}>
          Plans
        </Text>

        {catalog.map((plan) => {
          const isCurrent = currentPlan === plan.key
          const pastDue = subscription?.status === 'past_due' || subscription?.paymentOverdue
          const checkoutable = ['buy', 'trial', 'demo'].includes(String(plan.checkout || 'buy'))
          const canRetry = Boolean(pastDue && isCurrent)
          // Only hard-disable current plan (unless retry) or sales-only plans.
          // Square setup issues are handled on press with a clear alert.
          const disabled =
            working ||
            plan.checkout === 'sales' ||
            (!canRetry && isCurrent) ||
            (!checkoutable && plan.checkout === 'sales')

          const buttonLabel = canRetry
            ? 'Retry monthly payment'
            : isCurrent
              ? 'Current plan'
              : plan.checkout === 'trial'
                ? 'Try free for 14 days'
                : plan.ctaLabel || 'Buy now'

          return (
            <Card key={plan.key}>
              {isCurrent ? (
                <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 12, marginBottom: 6 }}>
                  CURRENT
                </Text>
              ) : plan.tagline ? (
                <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 12, marginBottom: 6 }}>
                  {String(plan.tagline).toUpperCase()}
                </Text>
              ) : null}
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{plan.name}</Text>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700', marginTop: 6 }}>
                {plan.priceLabel || '—'}
                {plan.monthlyAmountCents ? (
                  <Text style={{ color: colors.muted, fontSize: 14, fontWeight: '500' }}>
                    {' '}
                    {plan.periodLabel || '/month'}
                  </Text>
                ) : null}
              </Text>
              {(plan.features || []).map((feature) => (
                <Text key={feature} style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>
                  • {feature}
                </Text>
              ))}
              {(plan.notes || []).map((note) => (
                <Text key={note} style={{ color: colors.muted, marginTop: 8, fontSize: 12 }}>
                  {note}
                </Text>
              ))}
              <View style={{ marginTop: 14 }}>
                <Button
                  label={buttonLabel}
                  onPress={() => openCheckout(plan)}
                  disabled={disabled}
                />
              </View>
            </Card>
          )
        })}

        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18, marginTop: 8, marginBottom: 10 }}>
          Payment history
        </Text>
        <Card>
          {payments.length === 0 ? (
            <Text style={{ color: colors.muted }}>Square payments will appear here after checkout.</Text>
          ) : (
            payments.map((payment, index) => (
              <View
                key={String(payment.id || index)}
                style={{
                  paddingVertical: 10,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600', textTransform: 'capitalize' }}>
                  {payment.plan || 'Plan'} · {formatMoney(payment.amount, payment.currency)}
                </Text>
                <Text style={{ color: colors.muted, marginTop: 4, fontSize: 13 }}>
                  {String(payment.status || 'paid')}
                  {payment.created_at || payment.createdAt
                    ? ` · ${formatPlanDate(payment.created_at || payment.createdAt)}`
                    : ''}
                </Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      {checkout && businessId ? (
        <SquareCheckoutModal
          visible
          mode={checkout.mode}
          planKey={checkout.key}
          planName={checkout.name}
          priceLabel={checkout.priceLabel}
          amountCents={checkout.amountCents}
          currency={checkout.currency}
          businessId={businessId}
          buyerEmail={String(user?.email || '')}
          buyerName={String(user?.name || '')}
          onClose={() => setCheckout(null)}
          onSuccess={async (updated) => {
            setCheckout(null)
            setSubscription((prev) => ({ ...(prev || {}), ...updated }))
            setMessage(
              checkout.mode === 'update'
                ? 'Payment method updated. Future renewals will use the new card.'
                : `Payment successful. You are now on the ${String(updated.plan || checkout.key)} plan.`,
            )
            await load()
          }}
        />
      ) : null}
    </Screen>
  )
}
