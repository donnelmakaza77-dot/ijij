/**
 * Apple Wallet Pass Generation via passkit-generator
 *
 * SETUP REQUIRED (manual steps before deploying):
 * 1. Log into developer.apple.com → Certificates, Identifiers & Profiles
 * 2. Create a Pass Type ID: e.g. pass.com.yourcompany.brewloop
 * 3. Generate and download the Pass Type ID certificate (.cer), import it into Keychain
 * 4. Export as .p12 (with passphrase), then run:
 *      openssl pkcs12 -in cert.p12 -clcerts -nokeys -out certs/signerCert.pem -legacy
 *      openssl pkcs12 -in cert.p12 -nocerts -out certs/signerKey.pem -legacy
 *      echo "your-passphrase" > certs/passphrase.txt
 * 5. Download WWDR G4 cert from Apple:
 *    https://www.apple.com/certificateauthority/
 *    → "Apple Worldwide Developer Relations Certification Authority (G4)"
 *    Save as certs/wwdr.pem
 * 6. Set APPLE_PASS_TEAM_ID and APPLE_PASS_TYPE_ID in .env.local
 * 7. Add NEXT_PUBLIC_BASE_URL pointing to your production domain
 */

import { PKPass } from 'passkit-generator'
import path from 'path'
import fs from 'fs'

interface PassData {
  serialNumber: string
  customerName: string
  shopName: string
  shopLogoUrl?: string
  stampCount: number
  stampsRequired: number
  shopSlug: string
  customerId: string
  primaryColor: string
}

function hexToRGB(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

export async function generatePass(data: PassData): Promise<Buffer> {
  const certPath = process.env.APPLE_PASS_CERT_PATH || './certs'
  const teamId = process.env.APPLE_PASS_TEAM_ID || ''
  const passTypeId = process.env.APPLE_PASS_TYPE_ID || ''
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000'

  // Read certificate files — must be provisioned manually (see instructions above)
  const signerCert = fs.readFileSync(path.join(certPath, 'signerCert.pem'))
  const signerKey = fs.readFileSync(path.join(certPath, 'signerKey.pem'))
  const wwdr = fs.readFileSync(path.join(certPath, 'wwdr.pem'))
  const signerKeyPassphrase = fs.readFileSync(
    path.join(certPath, 'passphrase.txt'),
    'utf-8'
  ).trim()

  const stampUrl = `${baseUrl}/${data.shopSlug}/stamp?customer_id=${data.customerId}`

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: passTypeId,
    serialNumber: data.serialNumber,
    teamIdentifier: teamId,
    organizationName: data.shopName,
    description: `${data.shopName} Loyalty Card`,
    logoText: data.shopName,
    backgroundColor: hexToRGB(data.primaryColor),
    foregroundColor: 'rgb(255, 255, 255)',
    labelColor: 'rgb(255, 255, 255)',
    storeCard: {
      primaryFields: [
        {
          key: 'stamps',
          label: 'STAMPS',
          value: `${data.stampCount} / ${data.stampsRequired}`,
        },
      ],
      secondaryFields: [
        {
          key: 'customer',
          label: 'NAME',
          value: data.customerName,
        },
      ],
      auxiliaryFields: [
        {
          key: 'reward',
          label: 'REWARD',
          value:
            data.stampCount >= data.stampsRequired
              ? 'Free drink ready! 🎉'
              : `${data.stampsRequired - data.stampCount} more to go`,
        },
      ],
      backFields: [
        {
          key: 'qr_info',
          label: 'Scan at the counter',
          value: stampUrl,
        },
        {
          key: 'terms',
          label: 'Terms',
          value:
            'One stamp per visit. Reward must be redeemed in one visit. Cannot be exchanged for cash.',
        },
      ],
    },
    barcodes: [
      {
        message: stampUrl,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
      },
    ],
    webServiceURL: `${baseUrl}/api/passes`,
    authenticationToken: data.serialNumber,
  }

  const pass = new PKPass(
    {
      'pass.json': Buffer.from(JSON.stringify(passJson)),
    },
    {
      wwdr,
      signerCert,
      signerKey,
      signerKeyPassphrase,
    }
  )

  return pass.getAsBuffer()
}

// Returns true if all four cert files are present
export function certsAvailable(): boolean {
  const certPath = process.env.APPLE_PASS_CERT_PATH || './certs'
  const required = ['signerCert.pem', 'signerKey.pem', 'wwdr.pem', 'passphrase.txt']
  return required.every((f) => fs.existsSync(path.join(certPath, f)))
}
