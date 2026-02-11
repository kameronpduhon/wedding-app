import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface VendorResponseNotificationProps {
  brideName: string
  vendorName: string
  vendorCategory: string
  filesUploaded: string[]
  vendorNote?: string | null
  dashboardUrl: string
}

export default function VendorResponseNotification({
  brideName,
  vendorName,
  vendorCategory,
  filesUploaded,
  vendorNote,
  dashboardUrl,
}: VendorResponseNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>{vendorName} just responded to your request!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>💍</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={heading}>
              Great news, {brideName}!
            </Heading>
            
            <Text style={paragraph}>
              <strong>{vendorName}</strong> ({vendorCategory}) just responded to your request.
            </Text>

            {filesUploaded.length > 0 && (
              <Section style={filesSection}>
                <Text style={filesLabel}>They uploaded:</Text>
                {filesUploaded.map((file, index) => (
                  <Text key={index} style={fileItem}>
                    ✓ {file}
                  </Text>
                ))}
              </Section>
            )}

            {vendorNote && (
              <Section style={noteSection}>
                <Text style={noteLabel}>Their note:</Text>
                <Text style={noteText}>&ldquo;{vendorNote}&rdquo;</Text>
              </Section>
            )}

            <Section style={buttonSection}>
              <Link href={dashboardUrl} style={button}>
                View Response
              </Link>
            </Section>

            <Text style={footerText}>
              Log in to your dashboard to download files and see all the details.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerLink}>
              <Link href={dashboardUrl} style={link}>
                Go to Dashboard
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#FDFDFB',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const logoText = {
  fontSize: '48px',
  margin: '0',
}

const content = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '32px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
}

const heading = {
  color: '#2C3E2D',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 16px 0',
}

const paragraph = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px 0',
}

const filesSection = {
  backgroundColor: '#E8F0E9',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const filesLabel = {
  color: '#2C3E2D',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
}

const fileItem = {
  color: '#5C7C65',
  fontSize: '14px',
  margin: '4px 0',
}

const noteSection = {
  backgroundColor: '#F5E6E0',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const noteLabel = {
  color: '#96792A',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
}

const noteText = {
  color: '#4a5568',
  fontSize: '14px',
  fontStyle: 'italic',
  margin: '0',
}

const buttonSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const button = {
  backgroundColor: '#87A98F',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 28px',
  textDecoration: 'none',
}

const footerText = {
  color: '#718096',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '0',
}

const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
}

const footerLink = {
  margin: '0',
}

const link = {
  color: '#5C7C65',
  fontSize: '14px',
  textDecoration: 'underline',
}
