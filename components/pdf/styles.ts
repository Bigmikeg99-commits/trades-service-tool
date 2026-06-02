import { StyleSheet, Font } from "@react-pdf/renderer";

// Register a clean, professional font (Helvetica is built-in and reliable)
export const colors = {
  primary: "#1f2937",      // zinc-800
  secondary: "#374151",    // zinc-700
  accent: "#111827",       // zinc-900
  text: "#1f2937",
  lightText: "#6b7280",
  border: "#e5e7eb",
  background: "#f9fafb",
  white: "#ffffff",
};

export const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.text,
    backgroundColor: colors.white,
    lineHeight: 1.45,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    paddingBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },

  companyBlock: {
    flex: 1,
    paddingRight: 20,
  },

  companyName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },

  companyDetails: {
    fontSize: 9,
    color: colors.lightText,
    lineHeight: 1.35,
  },

  proposalTitleBlock: {
    alignItems: "flex-end",
  },

  proposalTitle: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: colors.accent,
    letterSpacing: -0.5,
  },

  proposalMeta: {
    fontSize: 9,
    color: colors.lightText,
    marginTop: 3,
  },

  // Sections
  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Customer / Job Info - two column style
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoColumn: {
    width: "48%",
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },

  infoLabel: {
    width: 85,
    fontSize: 9,
    color: colors.lightText,
  },

  infoValue: {
    flex: 1,
    fontSize: 10,
  },

  // Line Items Table - more traditional
  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },

  tableHeaderCell: {
    color: colors.white,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },

  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },

  // Column widths - better balanced for proposals
  colDesc: { flex: 4 },
  colQty: { flex: 0.9, textAlign: "center" },
  colPrice: { flex: 1.6, textAlign: "right" },
  colTotal: { flex: 1.6, textAlign: "right" },

  // Totals - traditional contractor style
  totalsContainer: {
    marginTop: 14,
    alignSelf: "flex-end",
    width: 240,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    backgroundColor: colors.background,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  totalLabel: {
    fontSize: 10,
    color: colors.text,
  },

  totalValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
  },

  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.primary,
  },

  grandTotalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },

  grandTotalValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },

  // Notes / Terms
  notesBox: {
    marginTop: 18,
    padding: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },

  notesTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 5,
    letterSpacing: 0.3,
  },

  notesText: {
    fontSize: 9,
    color: colors.lightText,
    lineHeight: 1.4,
  },

  // Signature Area - more traditional spacing
  signatureSection: {
    marginTop: 36,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  signatureBlock: {
    width: "46%",
  },

  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.text,
    marginTop: 28,
    paddingBottom: 2,
  },

  signatureLabel: {
    fontSize: 9,
    color: colors.lightText,
    marginTop: 5,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footerText: {
    fontSize: 8,
    color: colors.lightText,
  },
});