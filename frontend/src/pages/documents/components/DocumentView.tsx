import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import {
  DOC_BANK,
  DOC_BIC,
  DOC_COMPANY_SUB_TITLE,
  DOC_COMPANY_TITLE,
  DOC_EMAIL,
  DOC_IBAN,
  DOC_OWNER,
  DOC_PHONE_NUMBER,
  DOC_STREET_AND_NUMBER,
  DOC_TAX_ID,
  DOC_VAT_ID,
  DOC_ZIP_AND_CITY,
} from '@/src/config';
import { BackendDocumentWithPositions } from '@/src/types/backend-contracts';
import { DOCUMENT_TYPE } from '@/src/types/documents';
import { getVatRate } from '@/src/utils/helpers';
import { formatNumber } from '@/src/utils/numbers';

// Shared cell styles matching legacy invoice
const infoLabelSx = {
  fontWeight: 'bold',
  width: '40mm',
  paddingLeft: '5mm',
  paddingRight: '8px',
  whiteSpace: 'nowrap' as const,
  border: 'none',
  verticalAlign: 'bottom',
  fontSize: '14px',
  fontFamily: 'serif',
};
const infoLabelRightSx = {
  fontWeight: 'bold',
  width: '40mm',
  paddingLeft: '12px',
  paddingRight: '8px',
  whiteSpace: 'nowrap' as const,
  border: 'none',
  verticalAlign: 'bottom',
  fontSize: '14px',
  fontFamily: 'serif',
};
const infoValueSx = {
  width: '60mm',
  border: 'none',
  borderBottomStyle: 'solid' as const,
  borderBottomWidth: '1px',
  borderBottomColor: '#000',
  padding: '0',
  verticalAlign: 'bottom',
  fontSize: '14px',
  fontFamily: 'serif',
};

type Props = {
  document: BackendDocumentWithPositions;
};

export function DocumentView({ document }: Props) {
  const isOffer = document.type === DOCUMENT_TYPE.OFFER;
  const title = isOffer ? 'Kostenvoranschlag' : 'Rechnung';

  const itemPositions = document.positions.filter((p) => p.type === 'item');
  const netTotal = itemPositions.reduce((sum, p) => {
    const price = p.pricePerUnit != null ? Number(p.pricePerUnit) : 0;
    const amount = p.amount != null ? Number(p.amount) : 0;
    const discount = p.discount != null ? Number(p.discount) : 0;
    return sum + price * amount * (1 - discount / 100);
  }, 0);

  const vatRate = getVatRate(document.documentDate);
  const vatAmount = netTotal * vatRate;
  const grossTotal = netTotal + vatAmount;

  const paymentMethodLabel =
    document.paymentMethod === 'cash'
      ? 'Bar'
      : document.paymentMethod === 'bank_transfer'
        ? 'Überweisung'
        : (document.paymentMethod ?? '');

  // Running item index (headings don't count)
  let itemIndex = 0;

  return (
    <div
      style={{
        fontFamily: 'serif',
        fontSize: '14px',
        lineHeight: 'initial',
        boxSizing: 'border-box',
        padding: '15mm',
        minHeight: '292mm',
        maxWidth: '210mm',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
      }}
    >
      {/* ── Company header ── */}
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{ fontSize: '2.5em' }}>{DOC_COMPANY_TITLE}</div>
        <div style={{ fontSize: '1.4em' }}>{DOC_COMPANY_SUB_TITLE}</div>
      </div>

      {/* ── Address / date rule ── */}
      <div
        style={{
          borderTop: '1px solid #000',
          fontSize: '0.7em',
          marginBottom: '5px',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>
          {DOC_STREET_AND_NUMBER} / {DOC_ZIP_AND_CITY} / E-Mail: {DOC_EMAIL}
        </span>
        <span>{document.documentDate.split('-').reverse().join('.')}</span>
      </div>

      {/* ── Document type ── */}
      <div
        style={{
          fontWeight: 'bold',
          fontSize: '2em',
          textAlign: 'center',
          marginBottom: '5mm',
          marginTop: '2mm',
        }}
      >
        {title}
      </div>

      {/* ── Info table (4-column: label | value | label | value) ── */}
      <table
        style={{
          marginBottom: '4mm',
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: '14px',
          fontFamily: 'serif',
        }}
      >
        <tbody>
          <tr>
            <td style={infoLabelSx}>Firma:</td>
            <td style={infoValueSx}>{document.clientCompany ?? ''}</td>
            <td style={infoLabelRightSx}>Zahlungsart:</td>
            <td style={infoValueSx}>{paymentMethodLabel}</td>
          </tr>
          <tr>
            <td style={infoLabelSx}>Nachname:</td>
            <td style={infoValueSx}>{document.clientLastName ?? ''}</td>
            <td style={infoLabelRightSx}>Kundennummer:</td>
            <td style={infoValueSx}>{document.clientNumber ?? ''}</td>
          </tr>
          <tr>
            <td style={infoLabelSx}>Vorname:</td>
            <td style={infoValueSx}>{document.clientFirstName ?? ''}</td>
            <td style={infoLabelRightSx}>Kennzeichen:</td>
            <td style={infoValueSx}>{document.carLicensePlate}</td>
          </tr>
          <tr>
            <td style={infoLabelSx}>Straße:</td>
            <td style={infoValueSx}>{document.clientStreet ?? ''}</td>
            <td style={infoLabelRightSx}>Hersteller:</td>
            <td style={infoValueSx}>{document.carManufacturer}</td>
          </tr>
          <tr>
            <td style={infoLabelSx}>PLZ:</td>
            <td style={infoValueSx}>{document.clientPostalCode ?? ''}</td>
            <td style={infoLabelRightSx}>Modell:</td>
            <td style={infoValueSx}>{document.carModel}</td>
          </tr>
          <tr>
            <td style={infoLabelSx}>Stadt:</td>
            <td style={infoValueSx}>{document.clientCity ?? ''}</td>
            <td style={infoLabelRightSx}>Fahrzeug-Ident-Nr:</td>
            <td style={infoValueSx}>{document.carVin ?? ''}</td>
          </tr>
          <tr>
            <td style={infoLabelSx}>Dokumenten-Nr:</td>
            <td style={infoValueSx}>{document.documentNumber ?? ''}</td>
            <td style={infoLabelRightSx}>KM-Stand:</td>
            <td style={infoValueSx}>
              {document.carMileage != null
                ? formatNumber(Number(document.carMileage))
                : ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Positions table ── */}
      <Table
        size="small"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          mb: 'auto',
          fontFamily: 'serif',
          fontSize: '14px',
        }}
      >
        <TableHead>
          <TableRow>
            {[
              { label: 'Pos.', width: '10mm' },
              { label: 'Art.-Nr.', width: '25mm' },
              { label: 'Bezeichnung', width: '67mm' },
              { label: 'Preis / Einheit', width: '23mm' },
              { label: 'Rabatt', width: '25mm' },
              { label: 'Menge', width: '25mm' },
              { label: 'Preis (Netto)', width: '25mm' },
            ].map(({ label, width }) => (
              <TableCell
                key={label}
                sx={{
                  width,
                  borderBottom: '1px solid #000',
                  fontWeight: 'normal',
                  textAlign: 'center',
                  fontFamily: 'serif',
                  fontSize: '14px',
                  padding: '2px 4px',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {document.positions.map((pos) => {
            if (pos.type === 'heading') {
              const headingCellSx = {
                border: '1px solid #bdbdbd',
                fontFamily: 'serif',
                fontSize: '14px',
                padding: '2px 4px',
                textAlign: 'center' as const,
              };
              return (
                <TableRow key={pos.id}>
                  <TableCell sx={headingCellSx} />
                  <TableCell sx={headingCellSx} />
                  <TableCell sx={{ ...headingCellSx, fontWeight: 'bold' }}>
                    {pos.text}
                  </TableCell>
                  <TableCell sx={headingCellSx} />
                  <TableCell sx={headingCellSx} />
                  <TableCell sx={headingCellSx} />
                  <TableCell sx={headingCellSx} />
                </TableRow>
              );
            }

            itemIndex += 1;
            const price =
              pos.pricePerUnit != null ? Number(pos.pricePerUnit) : 0;
            const amount = pos.amount != null ? Number(pos.amount) : 0;
            const discount = pos.discount != null ? Number(pos.discount) : 0;
            const net = price * amount * (1 - discount / 100);
            const cellSx = {
              border: '1px solid #bdbdbd',
              textAlign: 'center' as const,
              fontFamily: 'serif',
              fontSize: '14px',
              padding: '2px 4px',
            };

            return (
              <TableRow key={pos.id}>
                <TableCell sx={cellSx}>{itemIndex}</TableCell>
                <TableCell sx={cellSx}>{pos.articleId ?? ''}</TableCell>
                <TableCell sx={cellSx}>{pos.description ?? ''}</TableCell>
                <TableCell sx={cellSx}>
                  {formatNumber(price, { minDecimals: 2, maxDecimals: 2 })}
                </TableCell>
                <TableCell sx={cellSx}>{`${formatNumber(discount, { minDecimals: 2, maxDecimals: 2 })} %`}</TableCell>
                <TableCell sx={cellSx}>
                  {formatNumber(amount, { minDecimals: 2, maxDecimals: 2 })}
                </TableCell>
                <TableCell sx={cellSx}>
                  {formatNumber(net, { minDecimals: 2, maxDecimals: 2 })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* ── Sum table ── */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          margin: '15px 0',
          fontFamily: 'serif',
          fontSize: '14px',
        }}
      >
        <thead>
          <tr>
            {[
              'Netto',
              `${Math.round(vatRate * 100)} % MwSt`,
              'Rechnungsbetrag',
            ].map((h) => (
              <th
                key={h}
                style={{
                  width: '33%',
                  fontWeight: 'bold',
                  border: '1px solid #000',
                  textAlign: 'center',
                  height: '5mm',
                  padding: '2px 4px',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {[
              formatNumber(netTotal, { currency: true }),
              formatNumber(vatAmount, { currency: true }),
              formatNumber(grossTotal, { currency: true }),
            ].map((v, i) => (
              <td
                key={i}
                style={{
                  width: '33%',
                  border: '1px solid #000',
                  textAlign: 'center',
                  padding: '2px 4px',
                }}
              >
                {v}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* ── General remark ── */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '15px',
          fontSize: '14px',
          fontFamily: 'serif',
        }}
      >
        <div>
          {DOC_PHONE_NUMBER && (
            <>
              Unsere Servicenummer ist {DOC_PHONE_NUMBER}
              <br />
            </>
          )}
        </div>
        {document.paymentDueDate && (
          <div style={{ marginBottom: '6px' }}>
            Zahlungsziel: {document.paymentDueDate}
          </div>
        )}
        <div>
          Rechnungsdatum entspricht Leistungs- bzw. Ausführungsdatum.
          <br />
          Dieser Beleg wurde maschinell erstellt und ist auch ohne Unterschrift
          gültig.
        </div>
      </div>

      {/* ── Footnote ── */}
      <div
        style={{
          textAlign: 'center',
          lineHeight: '20px',
          fontSize: '14px',
          fontFamily: 'serif',
        }}
      >
        <div style={{ textDecoration: 'underline', marginBottom: '4px' }}>
          Bank: {DOC_BANK} (<strong>BIC:</strong> {DOC_BIC}){' '}
          <strong>IBAN:</strong> {DOC_IBAN}
        </div>
        <div>
          {DOC_OWNER} · {DOC_STREET_AND_NUMBER} · {DOC_ZIP_AND_CITY}
          <br />
          {DOC_PHONE_NUMBER && <>Mobil: {DOC_PHONE_NUMBER} · </>}
          E-Mail: {DOC_EMAIL}
          <br />
          Ust.-IdNr.: {DOC_VAT_ID} · St.Nr.: {DOC_TAX_ID}
        </div>
      </div>
    </div>
  );
}
