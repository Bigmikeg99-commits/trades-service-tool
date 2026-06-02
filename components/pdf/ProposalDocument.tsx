import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles, colors } from "./styles";
import { format } from "date-fns";

interface ProposalData {
  company: {
    name: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    email?: string;
    licenseHvac?: string;
    licensePlumbing?: string;
    licenseElectrical?: string;
  };
  customer: {
    name: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    email?: string;
  };
  job: {
    title: string;
    serviceType: string;
    address?: string;
    scheduledStart?: Date | string;
    estimatedLaborHours?: number;
    travelTimeMin?: number;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    category?: string;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  validUntil?: Date;
  terms?: string;
  jobId: string;
}

export function ProposalDocument({ data }: { data: ProposalData }) {
  const today = new Date();
  const validUntil = data.validUntil || new Date(today.getTime() + 1000 * 60 * 60 * 24 * 30);

  const groupedItems = data.lineItems.reduce((acc, item) => {
    const cat = item.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof data.lineItems>);

  return (
    <Document
      title={`Proposal - ${data.job.title}`}
      author={data.company.name}
      subject={`Service Proposal for ${data.customer.name}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>{data.company.name}</Text>
            <Text style={styles.companyDetails}>
              {data.company.addressLine1}
              {data.company.city && `, ${data.company.city}`}
              {data.company.state && `, ${data.company.state} ${data.company.zip}`}
              {"\n"}
              {data.company.phone && `Phone: ${data.company.phone}  •  `}
              {data.company.email}
            </Text>
            {(data.company.licenseHvac || data.company.licensePlumbing || data.company.licenseElectrical) && (
              <Text style={{ ...styles.companyDetails, marginTop: 4, fontSize: 8 }}>
                {data.company.licenseHvac && `HVAC Lic. #${data.company.licenseHvac}  `}
                {data.company.licensePlumbing && `Plumbing Lic. #${data.company.licensePlumbing}  `}
                {data.company.licenseElectrical && `Electrical Lic. #${data.company.licenseElectrical}`}
              </Text>
            )}
          </View>

          <View>
            <Text style={styles.proposalTitle}>PROPOSAL</Text>
            <Text style={styles.proposalMeta}>#{data.jobId.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.proposalMeta}>Date: {format(today, "MMM dd, yyyy")}</Text>
            <Text style={styles.proposalMeta}>Valid until: {format(validUntil, "MMM dd, yyyy")}</Text>
          </View>
        </View>

        {/* Customer & Job Info - Traditional two-column layout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prepared For</Text>
          <View style={styles.infoGrid}>
            {/* Left column - Customer */}
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Customer</Text>
                <Text style={styles.infoValue}>{data.customer.name}</Text>
              </View>
              {data.customer.addressLine1 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>
                    {data.customer.addressLine1}
                    {data.customer.city && `, ${data.customer.city}`}
                    {data.customer.state && `, ${data.customer.state} ${data.customer.zip}`}
                  </Text>
                </View>
              )}
              {(data.customer.phone || data.customer.email) && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Contact</Text>
                  <Text style={styles.infoValue}>
                    {[data.customer.phone, data.customer.email].filter(Boolean).join("  •  ")}
                  </Text>
                </View>
              )}
            </View>

            {/* Right column - Project */}
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Project</Text>
                <Text style={styles.infoValue}>{data.job.title}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>{data.job.serviceType.toUpperCase()}</Text>
              </View>
              {data.job.address && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{data.job.address}</Text>
                </View>
              )}
              {(data.job.estimatedLaborHours || data.job.travelTimeMin) && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Time Est.</Text>
                  <Text style={styles.infoValue}>
                    {data.job.estimatedLaborHours ? `${data.job.estimatedLaborHours} hrs` : ""}
                    {data.job.travelTimeMin ? ` + ${data.job.travelTimeMin} min travel` : ""}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proposed Work & Materials</Text>

          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit Price</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
            </View>

            {data.lineItems.map((item, index) => (
              <View
                key={index}
                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={styles.colDesc}>{item.description}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>${item.unitPrice.toFixed(2)}</Text>
                <Text style={[styles.colTotal, { fontFamily: "Helvetica-Bold" }]}>
                  ${item.lineTotal.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals - More traditional contractor totals block */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${data.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sales Tax ({data.taxRate}%)</Text>
              <Text style={styles.totalValue}>${data.tax.toFixed(2)}</Text>
            </View>
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>Total Amount Due</Text>
              <Text style={styles.grandTotalValue}>${data.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Notes / Terms */}
        <View style={styles.notesBox}>
          <Text style={styles.notesTitle}>Notes & Terms</Text>
          <Text style={styles.notesText}>
            {data.terms ||
              "This proposal is valid for 30 days from the date above. Work will be scheduled upon receipt of a signed copy and any required deposit. Payment is due upon completion unless prior arrangements have been made."}
          </Text>
        </View>

        {/* Signature Area */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Authorized Signature &amp; Date</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Customer Acceptance &amp; Date</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {data.company.name} • {data.company.phone || data.company.email}
          </Text>
          <Text style={styles.footerText}>
            Proposal #{data.jobId.slice(0, 8).toUpperCase()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}