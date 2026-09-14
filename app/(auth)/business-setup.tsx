import { useEffect, useMemo, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Link, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { authApi, businessApi, ApiError } from '../../src/services/api'
import { useAuth } from '../../src/context/AuthContext'
import {
  BrandLogo,
  Button,
  ErrorText,
  Field,
  PasswordField,
  Screen,
} from '../../src/components/ui'
import { SelectField } from '../../src/components/SelectField'
import { LogoUploadField } from '../../src/components/LogoUploadField'
import { colors } from '../../src/constants'
import { LegalAgreeLine } from '../../src/components/LegalLinks'
import { BUSINESS_LOCATIONS } from '../../src/utils/locations'
import { PHONE_COUNTRY_CODES } from '../../src/utils/phoneCountryCodes'
import { stashPendingBusinessLogo } from '../../src/storage/pendingLogo'
import type { LogoFile } from '../../src/utils/logoUpload'
import type { StoredUser } from '../../src/storage/authStorage'

const STEPS = ['Business', 'Additional', 'Personal', 'Activate'] as const
const STEP_LABELS_FULL = [
  'Business details',
  'Additional details',
  'Personal details',
  'Activate account',
] as const

const REVENUE_OPTIONS = [
  'Under £500K',
  '£500K - £4.99 million',
  '£5 million - £24.99 million',
  '£25 million+',
]

const EMPLOYEE_OPTIONS = ['1-9', '10-49', '50-249', '250-999', '1000+']

type CategoryMain = {
  id: string
  name: string
  subcategories?: { id: string; name: string }[]
}

function ProgressSteps({
  step,
  compact,
}: {
  step: number
  compact: boolean
}) {
  return (
    <View style={{ marginBottom: compact ? 12 : 16 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: compact ? 4 : 8,
        }}
      >
        {STEPS.map((label, index) => {
          const complete = index < step
          const current = index === step
          return (
            <View
              key={label}
              style={{
                flex: 1,
                minWidth: 0,
                alignItems: 'center',
                gap: 6,
              }}
            >
              <View
                style={{
                  width: compact ? 26 : 28,
                  height: compact ? 26 : 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1.5,
                  borderColor: complete || current ? colors.accent : colors.border,
                  backgroundColor: complete ? colors.accent : current ? '#fff1f5' : colors.card,
                }}
              >
                {complete ? (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                ) : (
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: current ? colors.accent : colors.muted,
                    }}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                numberOfLines={compact ? 1 : 2}
                style={{
                  fontSize: compact ? 10 : 11,
                  lineHeight: compact ? 12 : 14,
                  textAlign: 'center',
                  color: current ? colors.text : colors.muted,
                  fontWeight: current ? '700' : '500',
                  width: '100%',
                }}
              >
                {compact ? label : STEP_LABELS_FULL[index]}
              </Text>
            </View>
          )
        })}
      </View>
      <View
        style={{
          marginTop: 10,
          height: 3,
          borderRadius: 999,
          backgroundColor: colors.border,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${((step + 1) / STEPS.length) * 100}%`,
            height: '100%',
            backgroundColor: colors.accent,
          }}
        />
      </View>
    </View>
  )
}

function FieldLabel({ children, compact }: { children: string; compact?: boolean }) {
  return (
    <Text
      style={{
        color: colors.muted,
        fontSize: compact ? 12 : 13,
        fontWeight: '600',
        marginBottom: 6,
      }}
    >
      {children}
    </Text>
  )
}

function Hint({ children, compact }: { children: string; compact?: boolean }) {
  return (
    <Text
      style={{
        color: colors.muted,
        fontSize: compact ? 11 : 12,
        lineHeight: compact ? 15 : 17,
        marginTop: -4,
        marginBottom: 12,
      }}
    >
      {children}
    </Text>
  )
}

function ResponsiveRow({
  wide,
  children,
}: {
  wide: boolean
  children: React.ReactNode
}) {
  const items = Array.isArray(children) ? children : [children]
  return (
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 12 : 0, width: '100%' }}>
      {items.map((child, index) => (
        <View key={index} style={{ flex: wide ? 1 : undefined, minWidth: 0, width: wide ? undefined : '100%' }}>
          {child}
        </View>
      ))}
    </View>
  )
}

export default function BusinessSetupScreen() {
  const { setSession } = useAuth()
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const compact = width < 390 || height < 720
  const narrow = width < 360
  const wide = width >= 700
  const contentPad = narrow ? 4 : 0

  const [step, setStep] = useState(0)
  const [categories, setCategories] = useState<CategoryMain[]>([])
  const [logoFile, setLogoFile] = useState<LogoFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    location: 'United Kingdom',
    address: '',
    postalCode: '',
    businessName: '',
    website: '',
    mainCategoryId: '',
    category: '',
    jobTitle: '',
    annualRevenue: '',
    employeeCount: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneCode: '+44',
    phoneCountry: 'United Kingdom',
    phone: '',
    password: '',
  })

  useEffect(() => {
    businessApi
      .getCategories()
      .then((data) => setCategories(Array.isArray(data) ? (data as CategoryMain[]) : []))
      .catch(() => setCategories([]))
  }, [])

  const subcategories = useMemo(() => {
    const main = categories.find((item) => item.id === form.mainCategoryId)
    return main?.subcategories || []
  }, [categories, form.mainCategoryId])

  const locationOptions = useMemo(
    () => BUSINESS_LOCATIONS.map((name) => ({ label: name, value: name })),
    [],
  )
  const mainCategoryOptions = useMemo(
    () => categories.map((item) => ({ label: item.name, value: item.id })),
    [categories],
  )
  const subcategoryOptions = useMemo(
    () => subcategories.map((item) => ({ label: item.name, value: item.name })),
    [subcategories],
  )
  const phoneOptions = useMemo(
    () =>
      PHONE_COUNTRY_CODES.map((country) => ({
        label: `${country.name} (${country.code})`,
        value: `${country.code}|${country.name}`,
      })),
    [],
  )

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validateStep() {
    if (step === 0) {
      if (
        !form.location ||
        !form.address.trim() ||
        !form.businessName.trim() ||
        !form.website.trim() ||
        !form.mainCategoryId ||
        !form.category
      ) {
        return 'Please complete all business details fields.'
      }
    }
    if (step === 1) {
      if (!form.jobTitle.trim() || !form.annualRevenue || !form.employeeCount) {
        return 'Please complete the additional details before continuing.'
      }
    }
    if (step === 2) {
      if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
        return 'Please enter your personal details.'
      }
    }
    if (step === 3) {
      if (!form.email.trim() || !form.password) {
        return 'Please enter your email address and password.'
      }
      if (form.password.length < 8) {
        return 'Password must be at least 8 characters.'
      }
    }
    return ''
  }

  async function onNext() {
    setError(null)
    const validationError = validateStep()
    if (validationError) {
      setError(validationError)
      return
    }

    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
      return
    }

    setLoading(true)
    try {
      const websiteValue = form.website.trim()
      const website = websiteValue
        ? /^https?:\/\//i.test(websiteValue)
          ? websiteValue
          : `https://${websiteValue}`
        : null

      const result = await authApi.register({
        email: form.email.trim(),
        password: form.password,
        name: form.businessName.trim(),
        role: 'business',
        category: form.category,
        website,
        phone: `${form.phoneCode} ${form.phone}`.trim() || null,
        description: `Location: ${form.location}
Address: ${form.address.trim()}
ZIP / Postal code: ${form.postalCode.trim() || '—'}
Job title: ${form.jobTitle.trim()}
Annual revenue: ${form.annualRevenue}
Employees: ${form.employeeCount}
Contact: ${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      })

      if (result.requiresEmailVerification) {
        if (logoFile) {
          await stashPendingBusinessLogo(logoFile)
        }
        router.push({
          pathname: '/(auth)/verify-email',
          params: { email: form.email.trim(), role: 'business' },
        })
        return
      }

      if (result.token && result.user) {
        const user = {
          ...(result.user as object),
          id: (result.user as { id: string | number }).id,
          email: String((result.user as { email?: string }).email || form.email.trim()),
          name: String((result.user as { name?: string }).name || form.businessName.trim()),
          role: 'business' as const,
        } as StoredUser
        await setSession(user, result.token)

        if (logoFile) {
          try {
            const profile = (await businessApi.getMyProfile()) as { id?: string | number }
            if (profile?.id) {
              await businessApi.uploadLogo(profile.id, logoFile)
            }
          } catch {
            // Logo can be uploaded later from company profile
          }
        }

        router.replace('/(business)')
        return
      }

      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: form.email.trim(), role: 'business' },
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create business account')
    } finally {
      setLoading(false)
    }
  }

  const titles = [
    "First, let's add your business details",
    'More details can help us customize your experience',
    'Now, add your personal details so we know who you are',
    'We need to send you a code to activate your account',
  ]

  const nextLabel = loading ? 'Creating…' : step === STEPS.length - 1 ? 'Send code' : 'Next'

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} style={{ paddingHorizontal: narrow ? 12 : 16 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? Math.max(insets.top, 8) : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: compact ? 4 : 12,
            paddingBottom: Math.max(28, insets.bottom + 16),
            paddingHorizontal: contentPad,
          }}
        >
          <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: compact ? 8 : 12 }}>
              <BrandLogo height={compact ? 34 : 40} />
            </View>

            <ProgressSteps step={step} compact={compact || narrow} />

            <Text
              style={{
                color: colors.text,
                fontSize: narrow ? 20 : compact ? 22 : 24,
                fontWeight: '700',
                textAlign: 'center',
                lineHeight: narrow ? 26 : 30,
                marginBottom: 8,
              }}
            >
              {titles[step]}
            </Text>
            <Text
              style={{
                color: colors.muted,
                fontSize: compact ? 12 : 13,
                lineHeight: 18,
                textAlign: 'center',
                marginBottom: 14,
              }}
            >
              Already have a business account? Sign in. Reviewer accounts are separate.
            </Text>

            <ErrorText>{error}</ErrorText>

            {step === 0 ? (
              <View>
                <ResponsiveRow wide={wide}>
                  <SelectField
                    label="Country"
                    value={form.location}
                    options={locationOptions}
                    onChange={(value) => update('location', value)}
                    searchable
                  />
                  <View>
                    <FieldLabel compact={compact}>Business name</FieldLabel>
                    <Field
                      placeholder="Your company name"
                      autoCapitalize="words"
                      value={form.businessName}
                      onChangeText={(text) => update('businessName', text)}
                    />
                    <Hint compact={compact}>This helps customers find and trust your business.</Hint>
                  </View>
                </ResponsiveRow>

                <LogoUploadField
                  value={logoFile}
                  compact={compact}
                  disabled={loading}
                  onChange={setLogoFile}
                  onError={(message) => setError(message || null)}
                />

                <FieldLabel compact={compact}>Business website</FieldLabel>
                <Field
                  placeholder="yourbusiness.com"
                  keyboardType="url"
                  autoCapitalize="none"
                  value={form.website}
                  onChangeText={(text) => update('website', text)}
                />
                <Hint compact={compact}>
                  Enter a live website address. We check DNS before creating the account.
                </Hint>

                <ResponsiveRow wide={wide}>
                  <View>
                    <FieldLabel compact={compact}>Address</FieldLabel>
                    <Field
                      placeholder="Street address"
                      autoCapitalize="words"
                      value={form.address}
                      onChangeText={(text) => update('address', text)}
                    />
                  </View>
                  <View>
                    <FieldLabel compact={compact}>ZIP / Postal code</FieldLabel>
                    <Field
                      placeholder="Optional"
                      autoCapitalize="characters"
                      value={form.postalCode}
                      onChangeText={(text) => update('postalCode', text)}
                    />
                  </View>
                </ResponsiveRow>

                <SelectField
                  label="Main category"
                  value={form.mainCategoryId}
                  placeholder="Select main category"
                  options={mainCategoryOptions}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, mainCategoryId: value, category: '' }))
                  }
                  searchable
                />

                <SelectField
                  label="Subcategory"
                  value={form.category}
                  placeholder="Select subcategory"
                  options={subcategoryOptions}
                  onChange={(value) => update('category', value)}
                  disabled={!form.mainCategoryId}
                  searchable
                />
              </View>
            ) : null}

            {step === 1 ? (
              <View>
                <FieldLabel compact={compact}>Your job title</FieldLabel>
                <Field
                  placeholder="Marketing manager"
                  autoCapitalize="words"
                  value={form.jobTitle}
                  onChangeText={(text) => update('jobTitle', text)}
                />

                <ResponsiveRow wide={wide}>
                  <SelectField
                    label="Annual revenue"
                    value={form.annualRevenue}
                    placeholder="Select annual revenue"
                    options={REVENUE_OPTIONS.map((item) => ({ label: item, value: item }))}
                    onChange={(value) => update('annualRevenue', value)}
                  />
                  <SelectField
                    label="Number of employees"
                    value={form.employeeCount}
                    placeholder="Select team size"
                    options={EMPLOYEE_OPTIONS.map((item) => ({ label: item, value: item }))}
                    onChange={(value) => update('employeeCount', value)}
                  />
                </ResponsiveRow>
              </View>
            ) : null}

            {step === 2 ? (
              <View>
                <ResponsiveRow wide={wide}>
                  <View>
                    <FieldLabel compact={compact}>First name</FieldLabel>
                    <Field
                      placeholder="First name"
                      autoCapitalize="words"
                      value={form.firstName}
                      onChangeText={(text) => update('firstName', text)}
                    />
                  </View>
                  <View>
                    <FieldLabel compact={compact}>Last name</FieldLabel>
                    <Field
                      placeholder="Last name"
                      autoCapitalize="words"
                      value={form.lastName}
                      onChangeText={(text) => update('lastName', text)}
                    />
                  </View>
                </ResponsiveRow>

                <SelectField
                  label="Phone country"
                  value={`${form.phoneCode}|${form.phoneCountry}`}
                  options={phoneOptions}
                  onChange={(value) => {
                    const [code, ...nameParts] = value.split('|')
                    setForm((prev) => ({
                      ...prev,
                      phoneCode: code,
                      phoneCountry: nameParts.join('|'),
                    }))
                  }}
                  searchable
                />

                <FieldLabel compact={compact}>Phone number</FieldLabel>
                <Field
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(text) => update('phone', text)}
                />
              </View>
            ) : null}

            {step === 3 ? (
              <View>
                <FieldLabel compact={compact}>Email address</FieldLabel>
                <Field
                  placeholder="name@yourbusiness.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  value={form.email}
                  onChangeText={(text) => update('email', text)}
                />
                <Hint compact={compact}>Use an email that matches your website domain when possible.</Hint>

                <FieldLabel compact={compact}>Create password</FieldLabel>
                <PasswordField
                  placeholder="Password (min 8 characters)"
                  value={form.password}
                  onChangeText={(text) => update('password', text)}
                />

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#F59E0B',
                    backgroundColor: '#422006',
                    borderRadius: 14,
                    padding: compact ? 10 : 12,
                    marginTop: 4,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: '#FDE68A', fontSize: compact ? 12 : 13, lineHeight: 18 }}>
                    After you create your account, we will email you a 6-digit verification code.
                    Your listing is reviewed by an admin before it appears in public search.
                  </Text>
                </View>
              </View>
            ) : null}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                marginTop: 10,
              }}
            >
              <Pressable
                onPress={() => {
                  if (step > 0) {
                    setError(null)
                    setStep((s) => s - 1)
                    return
                  }
                  router.replace('/(auth)/register')
                }}
                disabled={loading}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={step > 0 ? 'Back' : 'Customer signup'}
                style={({ pressed }) => ({
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: loading ? 0.5 : pressed ? 0.75 : 1,
                  backgroundColor: colors.slate950,
                })}
              >
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Button label={nextLabel} onPress={onNext} loading={loading} />
              </View>
            </View>

            <Link
              href="/(auth)/login"
              style={{
                marginTop: 18,
                marginBottom: 4,
                textAlign: 'center',
                color: colors.accent,
                fontSize: compact ? 14 : 15,
                lineHeight: 22,
              }}
            >
              Already have an account? Sign in
            </Link>
            <LegalAgreeLine />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
