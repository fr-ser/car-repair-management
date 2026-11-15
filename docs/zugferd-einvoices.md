# Plan: ZUGFeRD E-Invoice Generation (EN16931 Conformant)

## Background

Starting **1 January 2025**, German B2B invoices must be issued as structured **electronic invoices** under
§ 14 UStG (Wachstumschancengesetz).
The minimum-compliant format is **ZUGFeRD 2.x** at the **EN16931 (COMFORT)** profile:
a hybrid file that is both a PDF/A-3 document (human-readable) and an embedded
UN/CEFACT Cross Industry Invoice (CII) XML file (machine-readable, legally binding).

This document describes how to add ZUGFeRD e-invoice generation to `car-repair-management`.

---

## 1. What Changes — High-Level Overview

| Today | After this feature |
|---|---|
| Single invoice download (`GET /api/documents/:id/pdf`) returns a plain PDFKit buffer | Produces a ZUGFeRD-compliant PDF/A-3 buffer for single invoices (`type === 'invoice'`); offers (`type === 'offer'`) remain plain visual PDFs |
| Batch downloads (`POST /api/documents/bulk-pdf`) return combined plain PDFs | Batch downloads remain visual-only combined PDFs (with user guidance in UI) |
| Dropbox backups (`BackupService.backupDocuments`) upload plain PDFs | Invoices backed up to Dropbox are ZUGFeRD PDF/A-3 files |
| Download filename is `<id>.pdf` | Invoices downloaded as `Rechnung_<documentNumber>_ZUGFeRD.pdf` |

---

## 2. Library Decision

Three libraries were evaluated.

### 2.1 Candidates

| | `@cantoo/pdf-lib` | `@stackforge-eu/factur-x` | `@e-invoice-eu/core` |
|---|:---:|:---:|:---:|
| Weekly downloads | ~3,200,000 | ~60 | ~2,030 |
| GitHub stars | ~358 | ~3 | ~376 |
| Latest version | 2.11.1 | 1.4.3 | 3.4.2 |
| Actively maintained | ✅ | ⚠️ Young, low adoption | ✅ |
| Licence | MIT | **EUPL-1.2** (copyleft) | LGPL-3.0 |
| TypeScript | ✅ | ✅ | ✅ |
| Generates CII XML | ❌ | ✅ | ✅ |
| XSD validation | ❌ | ✅ (WASM / libxml2) | ✅ |
| Embeds into existing PDF | ✅ | ✅ | ✅ |
| EN16931 / COMFORT | embed only | ✅ | ✅ |
| UBL / Peppol output | ❌ | ❌ | ✅ |
| External runtime deps | None | Node ≥ 20, libxml2-wasm | Optional: LibreOffice |

#### `@cantoo/pdf-lib`

Community fork of `pdf-lib` with `convertToPDFA()` and `embedFacturX()` added.
**PDF layer only** — does not generate or validate CII XML in any way.
Useful only when combined with another library for XML generation.
Licence: MIT.

#### `@stackforge-eu/factur-x`

Purpose-built TypeScript e-invoicing library covering full-stack XML generation, XSD/Schematron
validation, and PDF/A-3b embedding in one package.
Technically a good API fit, but carries two serious risks:

- **EUPL-1.2 licence** (European Union Public Licence) — a copyleft licence more restrictive than
  MIT or Apache.
  Using this in a commercial closed-source product requires legal review.
- **Near-zero community adoption** — ~3 GitHub stars, ~60 weekly downloads, no known production
  deployments, no third-party compliance audits.
  Bugs or compliance gaps may be unknown and unfixed.

**Not recommended for production business-critical invoicing.**

#### `@e-invoice-eu/core` ✅ **Recommended**

The most mature dedicated e-invoicing library in the Node.js/TypeScript ecosystem (~376 GitHub stars,
~2 k weekly downloads, actively maintained with a documented changelog and responsive issue tracker).

| | |
|---|---|
| **Role** | CII XML generation + PDF/A-3 embedding (bring-your-own PDF path) |
| **XML generation** | ✅ Full EN16931; all profiles |
| **PDF/A-3 output** | ✅ Embeds into an existing PDF buffer — the LibreOffice dependency is only needed for the spreadsheet→PDF path, which we do **not** use |
| **Validation** | ✅ XSD + Schematron |
| **Formats** | Factur-X/ZUGFeRD, CII, UBL, XRechnung |
| **TypeScript** | ✅ First-class |
| **Licence** | LGPL-3.0 — standard dynamic linking (npm dependency) is fine for closed-source applications without source disclosure |
| **Integration effort** | Medium: a mapper function from `Document` to the `@e-invoice-eu/core` invoice model is required |

The "bring-your-own PDF" path (`InvoiceService.generate(data, { format: 'factur-x', pdf: existingBuffer })`)
accepts our existing PDFKit buffer directly and returns a ZUGFeRD-compliant PDF/A-3 buffer.
No LibreOffice installation is required.

### 2.2 Chosen Library

**`@e-invoice-eu/core`** with format `'factur-x'` and profile `'en16931'`.

The PDFKit buffer is generated first via `renderPDF(document)` (unchanged), then passed to `InvoiceService.generate()`
together with a mapped invoice data object to produce the final ZUGFeRD PDF/A-3 buffer.

---

## 3. Data Gaps & Required Changes

### 3.1 Company Data & Environment Variables

All seller-side data needed for EN16931 is configured in `backend/src/config.ts`:
`DOC_COMPANY_TITLE`, `DOC_COMPANY_SUB_TITLE`, `DOC_STREET_AND_NUMBER`, `DOC_PHONE_NUMBER`, `DOC_EMAIL`, `DOC_OWNER`, `DOC_BANK`, `DOC_BIC`, `DOC_IBAN`, `DOC_VAT_ID`, `DOC_TAX_ID`.

Postal code and city are currently combined in `DOC_ZIP_AND_CITY` (e.g. `"12345 Sampletown"`).
To satisfy EN16931 cleanly without fragile runtime string splitting, we split this into two explicit variables:
- `DOC_POSTAL_CODE` (e.g. `"12345"`)
- `DOC_CITY` (e.g. `"Sampletown"`)

In `backend/src/config.ts`:
- Export both `DOC_POSTAL_CODE` and `DOC_CITY`.
- Keep `DOC_ZIP_AND_CITY = `${DOC_POSTAL_CODE} ${DOC_CITY}`` for backwards compatibility with existing visual PDF templates.
- Update `.env.development`, `.env.test`, `.env.production` accordingly.

### 3.2 `Document` Fields Mapping to EN16931

| EN16931 Business Term | Source in `Document` / DB | Notes |
|---|---|---|
| Invoice number (BT-1) | `documentNumber` | e.g. `"26-05-001"` |
| Issue date (BT-2) | `documentDate` | ISO string `"YYYY-MM-DD"` |
| Due date (BT-9) | `paymentDueDate` | Fallback to `documentDate` if not set |
| Currency (BT-5) | `"EUR"` | Hardcoded (EUR-only) |
| Delivery / Service date (BT-72 / BT-73) | `documentDate` | Date repair/service was performed |
| Seller name (BT-27) | `DOC_COMPANY_TITLE` | Config |
| Seller address (BG-5) | `DOC_STREET_AND_NUMBER`, `DOC_POSTAL_CODE`, `DOC_CITY`, `"DE"` | Config |
| Seller VAT ID (BT-31) | `DOC_VAT_ID` | Config (e.g. `"DE000000000"`) |
| Seller tax number (BT-32) | `DOC_TAX_ID` | Config |
| Buyer name (BT-44) | `clientCompany` or `${clientFirstName} ${clientLastName}` | From snapshot fields on `Document` |
| Buyer address (BG-8) | `clientStreet`, `clientPostalCode`, `clientCity`, `"DE"` | From snapshot fields on `Document` |
| Buyer VAT ID (BT-48) | *(omitted)* | Optional in EN16931; not stored on client |
| Buyer reference (BT-10) | `clientNumber` or `orderId` | Identifies client or repair order |
| Vehicle info (BT-22 / Notes) | `carLicensePlate`, `carManufacturer`, `carModel`, `carVin`, `carMileage` | Mapped to invoice note (e.g. *"Fahrzeug: LEXUS RX400H, Kennzeichen: A-BC 123, FIN: ABCD12345, km: 12.345"*) |
| Line items (BG-25) | `positions.filter(p => p.type === 'item')` | Positions with `type === 'heading'` mapped to line/invoice notes |
| Line item description (BT-153) | `position.description` | Text description of work/parts |
| Net line price (BT-146) | `position.pricePerUnit` adjusted for `position.discount` | `pricePerUnit * (1 - (discount ?? 0) / 100)` |
| Line item quantity (BT-129) | `position.amount` | e.g. `1` or `1.5` |
| Line item unit code (BT-130) | `"C62"` (Piece) or `"HUR"` (Hour) | Standard UN/ECE Rec 20 unit codes |
| Tax category (BT-151) | `"S"` (Standard rate) | Default German standard VAT category |
| Tax rate (BT-152) | `getVatRate(document.documentDate) * 100` | Reuse existing `getVatRate()` helper (19%) |
| Payment means code (BT-81) | `"58"` (SEPA transfer) or `"10"` (Cash) | Mapped from `paymentMethod` (`bank_transfer` → `"58"`, `cash` → `"10"`) |
| Payment payee IBAN (BT-84) | `DOC_IBAN` | Config |
| Payment payee BIC (BT-86) | `DOC_BIC` | Config |

### 3.3 Scope: Invoice Documents Only

ZUGFeRD e-invoices apply **only to `Document` records with `type === 'invoice'`**.
Offers (`type === 'offer'`) are cost estimates, not legally binding invoices, and are therefore **out of scope** (they remain visual-only PDFKit documents).
Credit notes can be introduced in a future update under CII type code `381`.

---

## 4. Implementation Plan

### Phase 1 — ZUGFeRD XML Builder & Embedder

**4.1** Install the library:

```bash
cd backend && npm install @e-invoice-eu/core
```

**4.2** Create `backend/src/documents/zugferd.ts`.
This module exports the embedding function:

```ts
export async function embedZugferd(
  pdfBuffer: Buffer,
  document: DocumentWithPositions,
): Promise<Buffer>
```

Internally it:
1. Maps `Document` (and its items) → the `@e-invoice-eu/core` invoice data model (seller, buyer, vehicle notes, line items, VAT breakdown, payment details).
2. Sets payment means code based on `document.paymentMethod` (`bank_transfer` → `"58"`, `cash` → `"10"`).
3. Formats line items, calculating net line price after discount (`pricePerUnit * (1 - discount / 100)`).
4. Includes vehicle details (`carLicensePlate`, `carManufacturer`, `carModel`, `carVin`, `carMileage`) in invoice notes / reference fields.
5. Invokes `InvoiceService.generate(invoiceData, { format: 'factur-x', profile: 'en16931', pdf: pdfBuffer })`.
6. Returns the resulting PDF/A-3 buffer.

**4.3** Write unit tests in `backend/src/documents/zugferd.spec.ts`:
- Smoke test: Given `singleInvoice` test fixture, `embedZugferd` successfully creates a PDF/A-3 buffer with embedded `factur-x.xml`.
- Validation test: The generated XML satisfies EN16931 / Factur-X COMFORT requirements.
- Edge cases: Cash payment vs bank transfer, items with and without discount, missing optional vehicle fields (VIN, mileage).

---

### Phase 2 — Wire into Existing PDF Pipeline

**4.4** Update `backend/src/documents/documents.service.ts`:
- In `getPdf(id: number)`:
  ```ts
  const pdfBuffer = await renderPDF(document);
  if (document.type === DOCUMENT_TYPE.INVOICE) {
    return embedZugferd(pdfBuffer, document);
  }
  return pdfBuffer;
  ```
- In `getBulkPdf(ids: number[])`:
  Keep as visual-only combined PDF (see Section 6 for why batch PDFs cannot be ZUGFeRD-compliant).

**4.5** Update `backend/src/documents/documents.controller.ts`:
- Update download filename for single invoices:
  ```ts
  const filename =
    document.type === DOCUMENT_TYPE.INVOICE
      ? `Rechnung_${document.documentNumber ?? id}_ZUGFeRD.pdf`
      : `Kostenvoranschlag_${document.documentNumber ?? id}.pdf`;
  ```

**4.6** Update `backend/src/daily-tasks/backup.service.ts`:
- In `backupDocuments()`:
  Ensure `renderPDF(doc)` output is passed through `embedZugferd(pdf, doc)` when `doc.type === 'invoice'`, so Dropbox copies are valid e-invoices.

---

### Phase 3 — Frontend (UX & Batch Warning)

**4.7** Update `frontend/src/pages/documents/components/DocumentsTable.tsx`:
- Add a "ZUGFeRD" badge / chip next to invoice rows or type label.
- Add an alert / warning notice when multiple documents are selected for bulk download:
  *"Hinweis: Sammel-PDFs sind reine Druckansichten und keine gültigen E-Rechnungen. Für den steuerrechtlichen Vorsteuerabzug laden Sie Rechnungen bitte einzeln herunter."*

**4.8** Update `frontend/src/pages/documents/DocumentDetailPage.tsx`:
- Update the download button label or add a badge indicating "PDF / E-Rechnung (ZUGFeRD)" for invoices.

---

### Phase 4 — Validation & Testing

**4.9** Validate generated invoices against official validators:
- [Mustang Validator](https://www.mustangproject.org/validator/) (validates PDF/A-3 compliance and embedded CII XML).
- [EU e-invoicing validator](https://www.itb.ec.europa.eu/invoice/upload).

**4.10** Update snapshot and rendering tests:
- Ensure existing visual PDF snapshot tests (`backend/src/documents/renderPDF.spec.ts`) continue to verify the base layout.
- Add snapshot / integration tests for the ZUGFeRD output.

---

## 5. File Map

```
backend/
  src/
    config.ts                               ← split DOC_ZIP_AND_CITY into DOC_POSTAL_CODE & DOC_CITY
    common/
      helpers.ts                            ← getVatRate() reused
    documents/
      zugferd.ts                            ← new: ZUGFeRD CII builder & PDF/A-3 embedder
      zugferd.spec.ts                       ← new: unit & validation tests for embedder
      documents.service.ts                  ← wire embedZugferd for invoices in getPdf()
      documents.controller.ts               ← update Content-Disposition filename
      renderPDF.ts                          ← existing PDFKit renderer (unchanged)
      renderPDF.fixtures.ts                 ← reuse fixtures for ZUGFeRD tests
    daily-tasks/
      backup.service.ts                     ← embed ZUGFeRD on Dropbox document backup
  .env.development / .env.test / ...        ← add DOC_POSTAL_CODE and DOC_CITY

frontend/
  src/
    pages/
      documents/
        components/
          DocumentsTable.tsx                ← add ZUGFeRD badge & bulk-download warning
        DocumentDetailPage.tsx              ← ZUGFeRD indicator on download action
```

---

## 6. Open Decisions & Notes

1. **Buyer VAT ID (BT-48)**:
   Omitted to keep database schema changes minimal.
   BT-48 is optional in EN16931; invoices remain fully valid and compliant without it. If B2B clients require buyer VAT IDs in the future, `vatId` can be added to the `Client` and `Document` models.

2. **Postal code / city split**:
   `DOC_ZIP_AND_CITY` is split into `DOC_POSTAL_CODE` and `DOC_CITY` in environment configuration.
   `backend/src/config.ts` exports both, while keeping `DOC_ZIP_AND_CITY` derived for backwards compatibility with existing visual PDF templates.

3. **Batch downloads are visual-only (with warning)**:
   Under ISO 19005-3 (PDF/A-3) and the Factur-X / ZUGFeRD standard, a compliant file represents exactly **one** invoice.
   The XML payload is attached at the Document Catalog level (`/Root /AF`) under the fixed name `factur-x.xml`.
   Merging multiple invoices into one PDF breaks this structure because multiple XML attachments collide, and automated accounting systems (e.g. DATEV, Lexoffice, SAP) only parse that single attachment.
   Decision: Keep batch downloads as visual concatenated PDFs for printing / internal review, but display an explicit warning in the UI advising users to download invoices individually for tax purposes.

4. **Offers (Kostenvoranschläge) out of scope**:
   Offers (`DOCUMENT_TYPE.OFFER`) are estimates without legal invoice status and remain visual PDFKit documents.

5. **Payment Method Codes (BT-81)**:
   Mapped from existing `paymentMethod` values:
   - `bank_transfer` → UN/CEFACT code `"58"` (SEPA credit transfer)
   - `cash` → UN/CEFACT code `"10"` (Cash)
