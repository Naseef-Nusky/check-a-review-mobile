import { CONTACT_EMAIL } from '../constants'
import {
  LegalH2,
  LegalLead,
  LegalP,
  LegalRows,
  LegalScreen,
  LegalStrong,
  LegalUl,
} from './LegalDocument'

export function PrivacyPolicyContent() {
  return (
    <LegalScreen>
      <LegalLead>CheckAReview Privacy Policy</LegalLead>
      <LegalP>
        CheckAReview (“we”, “our”) operates an open review platform. This policy explains how we
        collect, use, and protect your personal data when you use CheckAReview.com and related
        services (“our platform”).
      </LegalP>

      <LegalH2>Terms We Use</LegalH2>
      <LegalUl
        items={[
          '“CheckAReview”: CheckAReview.com, the data controller',
          '“Platform”: All CheckAReview websites, apps, and services',
          '“Public personal data”: Information visible to all platform visitors',
          '“Private personal data”: Non-public information we process',
        ]}
      />

      <LegalH2>Third-Party Websites</LegalH2>
      <LegalP>
        Our platform may link to external sites. We don’t control their privacy practices. Always
        review their policies separately.
      </LegalP>

      <LegalH2>We’re an Open Platform</LegalH2>
      <LegalP>When you participate:</LegalP>
      <LegalUl
        items={[
          'Reviews/profile details are publicly visible',
          'Businesses may publicly reply to reviews',
          'You control profile information visibility',
        ]}
      />

      <LegalH2>Personal Data We Collect</LegalH2>
      <LegalStrong>Public Personal Data</LegalStrong>
      <LegalUl
        items={[
          'Profile identifiers (username, photo)',
          'Country location',
          'Review content (text, ratings, media)',
          'Business/product names reviewed',
          'Dates of experiences/reviews',
          'Social connections (if linked)',
        ]}
      />
      <LegalStrong>Private Personal Data</LegalStrong>
      <LegalUl
        items={[
          'Contact details (email, name)',
          'Account credentials',
          'Device/IP information',
          'Usage analytics',
          'Verification documents',
          'Communication records',
        ]}
      />
      <LegalStrong>Business-Specific Data</LegalStrong>
      <LegalUl
        items={[
          'Company registration details',
          'Employee contact information',
          'Payment/banking data (paid services)',
        ]}
      />

      <LegalH2>How We Collect Personal Data</LegalH2>
      <LegalStrong>Directly From You:</LegalStrong>
      <LegalUl
        items={['Account registration', 'Review submissions', 'Customer support inquiries']}
      />
      <LegalStrong>From Third Parties:</LegalStrong>
      <LegalUl
        items={[
          'Business partners (review invitations)',
          'Social media platforms',
          'Fraud detection services',
        ]}
      />
      <LegalStrong>Automatically:</LegalStrong>
      <LegalUl items={['Cookies and tracking technologies', 'Server logs', 'Device/browser data']} />

      <LegalH2>Data Controllers & Processors</LegalH2>
      <LegalUl
        items={[
          'Primary Controller: CheckAReview.com for platform operations',
          'Joint Controllers: Businesses for invitation data',
          'Processors: Vendors with strict contractual obligations',
        ]}
      />

      <LegalH2>Why We Process Your Data</LegalH2>
      <LegalRows
        rows={[
          { label: 'Account management', value: 'Contract fulfilment' },
          { label: 'Review publication', value: 'Legitimate interest' },
          { label: 'Fraud prevention', value: 'Legal obligation' },
          { label: 'Service improvements', value: 'Legitimate interest' },
          { label: 'Marketing*', value: 'Consent' },
        ]}
      />
      <LegalP>*Where required by law</LegalP>

      <LegalH2>Data Sharing</LegalH2>
      <LegalStrong>Public Data Recipients:</LegalStrong>
      <LegalUl items={['Search engines', 'Business partners', 'Licensed third parties']} />
      <LegalStrong>Private Data Recipients:</LegalStrong>
      <LegalUl
        items={[
          'Payment processors',
          'Cloud service providers',
          'Legal authorities (when required)',
        ]}
      />

      <LegalH2>International Transfers</LegalH2>
      <LegalP>
        We use EU SCCs, UK IDTAs, and equivalent safeguards for cross-border data transfers.
      </LegalP>

      <LegalH2>Data Retention</LegalH2>
      <LegalUl
        items={[
          'Active accounts: Until deletion request',
          'Legal requirements: Per applicable laws',
          'Financial records: 7 years',
        ]}
      />

      <LegalH2>Your Rights</LegalH2>
      <LegalP>You may:</LegalP>
      <LegalUl
        items={[
          'Access your data',
          'Request corrections',
          'Delete your account*',
          'Restrict processing',
          'Object to processing',
          'Data portability',
        ]}
      />
      <LegalP>*Subject to legal retention requirements</LegalP>

      <LegalH2>Security Measures</LegalH2>
      <LegalP>We implement:</LegalP>
      <LegalUl
        items={[
          'Encryption',
          'Access controls',
          'Regular security audits',
          'Staff training programs',
        ]}
      />

      <LegalH2>Cookies & Tracking</LegalH2>
      <LegalP>We use:</LegalP>
      <LegalUl
        items={[
          'Essential cookies (non-optional)',
          'Analytics cookies (opt-out available)',
          'Marketing cookies (consent-based)',
        ]}
      />

      <LegalH2>Children’s Privacy</LegalH2>
      <LegalP>
        Our platform is not designed for users under 18. We do not knowingly collect their data.
      </LegalP>

      <LegalH2>Policy Changes</LegalH2>
      <LegalP>Material updates will be communicated via:</LegalP>
      <LegalUl
        items={[
          'Platform notifications',
          'Email (for account holders)',
          'Revised effective dates',
        ]}
      />

      <LegalH2>Contact Us</LegalH2>
      <LegalP>Data Protection Officer</LegalP>
      <LegalP>CheckAReview.</LegalP>
      <LegalP>125 Deansgate, Greater Manchester, M3 2BY</LegalP>
      <LegalP>Email: {CONTACT_EMAIL}</LegalP>
    </LegalScreen>
  )
}
