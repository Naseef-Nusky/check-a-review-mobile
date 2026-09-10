import { useCallback, useMemo, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { businessApi, ApiError } from '../../src/services/api'
import { Button, Card, ErrorText, Field, Screen, Subtitle, Title } from '../../src/components/ui'
import { LogoUploadField } from '../../src/components/LogoUploadField'
import { SelectField } from '../../src/components/SelectField'
import { colors, resolveMediaUrl } from '../../src/constants'
import { BUSINESS_LOCATIONS } from '../../src/utils/locations'
import type { LogoFile } from '../../src/utils/logoUpload'

type CategoryMain = {
  id: string
  name: string
  subcategories?: { id: string; name: string }[]
}

const REVENUE_OPTIONS = [
  'Under £500K',
  '£500K - £4.99 million',
  '£5 million - £24.99 million',
  '£25 million+',
]

const EMPLOYEE_OPTIONS = ['1-9', '10-49', '50-249', '250-999', '1000+']

const BRAND_SWATCHES = [
  '#FF4081',
  '#E11D48',
  '#0F172A',
  '#1D4ED8',
  '#2563EB',
  '#0891B2',
  '#059669',
  '#16A34A',
  '#D97706',
  '#EA580C',
  '#7C3AED',
  '#9333EA',
]

function Label({ children }: { children: string }) {
  return (
    <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
      {children}
    </Text>
  )
}

function Hint({ children }: { children: string }) {
  return (
    <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 16, marginTop: -4, marginBottom: 12 }}>
      {children}
    </Text>
  )
}

function parseFieldFromDescription(description = '', label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = String(description).match(new RegExp(`${escaped}:\\s*(.+)`, 'i'))
  const value = match?.[1]?.split('\n')[0]?.trim() || ''
  return value === '—' ? '' : value
}

function buildDescription(parts: {
  location: string
  address: string
  postalCode: string
  jobTitle: string
  annualRevenue: string
  employeeCount: string
  contactName: string
}) {
  const lines = []
  if (parts.location.trim()) lines.push(`Location: ${parts.location.trim()}`)
  if (parts.address.trim()) lines.push(`Address: ${parts.address.trim()}`)
  lines.push(`ZIP / Postal code: ${parts.postalCode.trim() || '—'}`)
  if (parts.jobTitle.trim()) lines.push(`Job title: ${parts.jobTitle.trim()}`)
  if (parts.annualRevenue.trim()) lines.push(`Annual revenue: ${parts.annualRevenue.trim()}`)
  if (parts.employeeCount.trim()) lines.push(`Employees: ${parts.employeeCount.trim()}`)
  if (parts.contactName.trim()) lines.push(`Contact: ${parts.contactName.trim()}`)
  return lines.join('\n')
}

function withCustomOption(options: string[], current: string) {
  const list = options.map((item) => ({ label: item, value: item }))
  if (current && !options.includes(current)) {
    return [{ label: current, value: current }, ...list]
  }
  return list
}

function FieldGroup({
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

function BrandColorField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const color = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value) ? value : '#FF4081'

  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <View
          style={{
            width: 80,
            height: 40,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: color,
          }}
        />
        <TextInput
          value={value}
          onChangeText={onChange}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="#FF4081"
          placeholderTextColor={colors.muted}
          style={{
            flex: 1,
            minWidth: 120,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: colors.text,
            fontSize: 16,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {BRAND_SWATCHES.map((swatch) => {
          const selected = color.toLowerCase() === swatch.toLowerCase()
          return (
            <Pressable
              key={swatch}
              onPress={() => onChange(swatch)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: swatch,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? colors.white : colors.border,
              }}
            />
          )
        })}
      </View>
    </View>
  )
}

export default function BusinessProfileScreen() {
  const { width } = useWindowDimensions()
  const isNarrow = width < 400
  const isWide = width >= 700
  const { logout } = useAuth()
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [categories, setCategories] = useState<CategoryMain[]>([])
  const [form, setForm] = useState({
    name: '',
    location: '',
    mainCategoryId: '',
    category: '',
    jobTitle: '',
    annualRevenue: '',
    employeeCount: '',
    contactName: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    brandColor: '#FF4081',
  })
  const [logoFile, setLogoFile] = useState<LogoFile | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [canBrandMatch, setCanBrandMatch] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [biz, tree] = await Promise.all([
        businessApi.getMyProfile(),
        businessApi.getCategories().catch(() => []),
      ])
      const cats = (Array.isArray(tree) ? tree : []) as CategoryMain[]
      setCategories(cats)
      setProfile(biz)
      const matchingMain = cats.find((main) =>
        (main.subcategories || []).some(
          (sub) => sub.name.toLowerCase() === String(biz?.category || '').toLowerCase(),
        ),
      )
      const description = String(biz?.description || '')
      const brandColor = String(biz?.brand_color || biz?.brandColor || '#FF4081')
      const addressFromDesc = parseFieldFromDescription(description, 'Address')
      setForm({
        name: String(biz?.name || ''),
        location: parseFieldFromDescription(description, 'Location') || '',
        mainCategoryId: matchingMain?.id || '',
        category: String(biz?.category || ''),
        jobTitle: parseFieldFromDescription(description, 'Job title'),
        annualRevenue: parseFieldFromDescription(description, 'Annual revenue'),
        employeeCount: parseFieldFromDescription(description, 'Employees'),
        contactName: parseFieldFromDescription(description, 'Contact'),
        website: String(biz?.website || ''),
        email: String(biz?.email || ''),
        phone: String(biz?.phone || ''),
        address: addressFromDesc || String(biz?.address || ''),
        postalCode: parseFieldFromDescription(description, 'ZIP / Postal code'),
        brandColor,
      })
      setLogoFile(null)
      setLogoPreview(biz?.logo_url || biz?.logoUrl ? resolveMediaUrl(String(biz.logo_url || biz.logoUrl)) : '')

      if (biz?.id) {
        const sub = (await businessApi.getSubscription(biz.id as string | number).catch(() => null)) as {
          entitlements?: { flags?: { brandMatch?: boolean } }
        } | null
        setCanBrandMatch(Boolean(sub?.entitlements?.flags?.brandMatch))
      } else {
        setCanBrandMatch(false)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  const subcategories = useMemo(() => {
    const main = categories.find((item) => item.id === form.mainCategoryId)
    return main?.subcategories || []
  }, [categories, form.mainCategoryId])

  const mainCategoryOptions = useMemo(
    () => categories.map((item) => ({ label: item.name, value: item.id })),
    [categories],
  )

  const subcategoryOptions = useMemo(() => {
    const options = subcategories.map((item) => ({ label: item.name, value: item.name }))
    if (
      form.category &&
      !options.some((item) => item.value.toLowerCase() === form.category.toLowerCase())
    ) {
      return [{ label: form.category, value: form.category }, ...options]
    }
    return options
  }, [subcategories, form.category])

  const locationOptions = useMemo(() => {
    const options = BUSINESS_LOCATIONS.map((item) => ({ label: item, value: item }))
    if (form.location && !BUSINESS_LOCATIONS.includes(form.location)) {
      return [{ label: form.location, value: form.location }, ...options]
    }
    return options
  }, [form.location])

  function update(field: keyof typeof form, value: string) {
    setSuccess(null)
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function onSave() {
    if (!profile?.id) {
      setError('Business profile not loaded. Please refresh and try again.')
      return
    }
    if (!form.name.trim()) {
      setError('Business name is required')
      return
    }
    if (!form.category.trim()) {
      setError('Please select a category')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const address = form.address.trim()
      const description = buildDescription({
        location: form.location,
        address,
        postalCode: form.postalCode,
        jobTitle: form.jobTitle,
        annualRevenue: form.annualRevenue,
        employeeCount: form.employeeCount,
        contactName: form.contactName,
      })
      await businessApi.updateBusiness(profile.id as string | number, {
        name: form.name.trim(),
        category: form.category,
        description,
        website: form.website.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: address || form.location.trim(),
        ...(canBrandMatch ? { brandColor: form.brandColor } : {}),
      })
      await load()
      setSuccess('Company details saved. Your public profile is updated.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update company details')
    } finally {
      setSaving(false)
    }
  }

  async function onLogoChange(file: LogoFile | null) {
    if (!profile?.id) return

    if (!file) {
      setUploadingLogo(true)
      setError(null)
      setSuccess(null)
      try {
        await businessApi.updateBusiness(profile.id as string | number, { logo_url: '' })
        await load()
        setSuccess('Logo removed')
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to remove logo')
      } finally {
        setUploadingLogo(false)
      }
      return
    }

    setUploadingLogo(true)
    setError(null)
    setSuccess(null)
    try {
      await businessApi.uploadLogo(profile.id as string | number, file)
      await load()
      setSuccess('Logo updated')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  async function onLogout() {
    await logout()
    router.replace('/(auth)/login')
  }

  if (loading) {
    return (
      <Screen>
        <Title>Company profile</Title>
        <Subtitle>Loading company details…</Subtitle>
      </Screen>
    )
  }

  return (
    <Screen style={{ paddingBottom: 0, paddingHorizontal: isNarrow ? 12 : 16 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        >
          <Title>Company profile</Title>
          <Subtitle>
            All fields below are editable. Save anytime — changes appear on your public Check A Review
            page.
          </Subtitle>

          <ErrorText>{error}</ErrorText>
          {success ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: '#6EE7B7',
                backgroundColor: '#064E3B',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#A7F3D0', fontSize: 13, lineHeight: 18 }}>{success}</Text>
            </View>
          ) : null}

          <Card>
            {/* Same editable sections as business website ProfilePage */}
            <Label>Business logo</Label>
            <LogoUploadField
              hideLabel
              value={
                logoFile ||
                (logoPreview
                  ? { uri: logoPreview, name: 'logo.jpg', type: 'image/jpeg' }
                  : null)
              }
              compact={isNarrow}
              disabled={uploadingLogo || saving}
              onChange={async (file) => {
                setLogoFile(file)
                if (file) setLogoPreview(file.uri)
                await onLogoChange(file)
              }}
              onError={(message) => setError(message || null)}
            />
            {uploadingLogo ? <Hint>Uploading logo…</Hint> : null}

            <Label>Brand color</Label>
            {canBrandMatch ? (
              <BrandColorField value={form.brandColor} onChange={(value) => update('brandColor', value)} />
            ) : (
              <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 18, marginBottom: 12 }}>
                Matching your public profile to your brand is included from Plus. Upgrade in the
                Upgrade on the Plans tab to unlock brand color.
              </Text>
            )}

            <Label>Business name</Label>
            <Field
              value={form.name}
              onChangeText={(v) => update('name', v)}
              autoCapitalize="words"
              placeholder="Your company name"
            />

            <SelectField
              label="Location / country"
              value={form.location}
              placeholder="Select location"
              options={locationOptions}
              onChange={(value) => update('location', value)}
              searchable
            />

            <FieldGroup wide={isWide}>
              <SelectField
                label="Main category"
                value={form.mainCategoryId}
                placeholder="Select main category"
                options={mainCategoryOptions}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, mainCategoryId: value, category: '' }))
                }
                searchable
                disabled={categories.length === 0}
              />
              <SelectField
                label="Subcategory"
                value={form.category}
                placeholder="Select subcategory"
                options={subcategoryOptions}
                onChange={(value) => update('category', value)}
                searchable
              />
            </FieldGroup>

            <FieldGroup wide={isWide}>
              <View>
                <Label>Job title</Label>
                <Field
                  value={form.jobTitle}
                  onChangeText={(v) => update('jobTitle', v)}
                  placeholder="Owner, Founder, Manager"
                />
              </View>
              <View>
                <Label>Contact name</Label>
                <Field
                  value={form.contactName}
                  onChangeText={(v) => update('contactName', v)}
                  placeholder="Primary contact person"
                />
              </View>
            </FieldGroup>

            <FieldGroup wide={isWide}>
              <SelectField
                label="Annual revenue"
                value={form.annualRevenue}
                placeholder="Select annual revenue"
                options={withCustomOption(REVENUE_OPTIONS, form.annualRevenue)}
                onChange={(value) => update('annualRevenue', value)}
              />
              <SelectField
                label="Employees"
                value={form.employeeCount}
                placeholder="Select employee range"
                options={withCustomOption(EMPLOYEE_OPTIONS, form.employeeCount)}
                onChange={(value) => update('employeeCount', value)}
              />
            </FieldGroup>

            <FieldGroup wide={isWide}>
              <View>
                <Label>Website</Label>
                <Field
                  value={form.website}
                  onChangeText={(v) => update('website', v)}
                  autoCapitalize="none"
                  placeholder="https://yourbusiness.com"
                  keyboardType="url"
                />
                <Hint>Must be a live domain that resolves in DNS.</Hint>
              </View>
              <View>
                <Label>Public email</Label>
                <Field
                  value={form.email}
                  onChangeText={(v) => update('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="hello@yourbusiness.com"
                />
              </View>
            </FieldGroup>

            <FieldGroup wide={isWide}>
              <View>
                <Label>Phone</Label>
                <Field
                  value={form.phone}
                  onChangeText={(v) => update('phone', v)}
                  keyboardType="phone-pad"
                  placeholder="+1 555 000 0000"
                />
              </View>
              <View>
                <Label>Address</Label>
                <Field
                  value={form.address}
                  onChangeText={(v) => update('address', v)}
                  placeholder="Street address"
                  autoCapitalize="words"
                />
              </View>
            </FieldGroup>

            <FieldGroup wide={isWide}>
              <View>
                <Label>ZIP / Postal code</Label>
                <Field
                  value={form.postalCode}
                  onChangeText={(v) => update('postalCode', v)}
                  placeholder="Optional"
                  autoCapitalize="characters"
                />
              </View>
              <View style={{ flex: 1 }} />
            </FieldGroup>

            <Button
              label={saving ? 'Saving…' : 'Save company details'}
              onPress={onSave}
              loading={saving}
              disabled={uploadingLogo}
            />
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>
              You can update these details whenever you need.
            </Text>
          </Card>

          <Button label="Sign out" variant="danger" onPress={onLogout} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}
