export type BillingProduct = "opposition" | "legal" | "self"

export const BILLING_PRODUCTS: BillingProduct[] = ["opposition", "legal", "self"]

export const BILLING_PRODUCT_LABELS: Record<BillingProduct, string> = {
  opposition: "Opposition Report™",
  legal: "MY LEGAL REPORT™",
  self: "MY SELF REPORT™",
}

export const BILLING_PRODUCT_UNLOCK_VERBS: Record<BillingProduct, string> = {
  opposition: "Unlock Opposition Report",
  legal: "Unlock Legal Report",
  self: "Unlock Self Report",
}
