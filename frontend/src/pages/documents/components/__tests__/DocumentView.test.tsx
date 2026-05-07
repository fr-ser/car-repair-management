import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BackendDocumentWithPositions } from '@/src/types/backend-contracts';

import { DocumentView } from '../DocumentView';

vi.mock('@/src/config', () => ({
  DOC_COMPANY_TITLE: '',
  DOC_COMPANY_SUB_TITLE: '',
  DOC_STREET_AND_NUMBER: '',
  DOC_ZIP_AND_CITY: '',
  DOC_PHONE_NUMBER: '',
  DOC_EMAIL: '',
  DOC_OWNER: '',
  DOC_BANK: '',
  DOC_BIC: '',
  DOC_IBAN: '',
  DOC_VAT_ID: '',
  DOC_TAX_ID: '',
}));

type Position = BackendDocumentWithPositions['positions'][number];

function makeDocument(positions: Position[]): BackendDocumentWithPositions {
  return {
    id: 1,
    documentNumber: 'DOC-001',
    type: 'invoice',
    documentDate: '2024-01-01',
    orderId: 1,
    paymentMethod: null,
    paymentDueDate: null,
    clientNumber: null,
    clientCompany: null,
    clientFirstName: null,
    clientLastName: null,
    clientStreet: null,
    clientPostalCode: null,
    clientCity: null,
    carLicensePlate: 'AB-CD 1234',
    carManufacturer: 'BMW',
    carModel: '3er',
    carVin: null,
    carMileage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    positions,
  } as BackendDocumentWithPositions;
}

function makeItem(id: number, sortOrder: number): Position {
  return {
    id,
    documentId: 1,
    type: 'item',
    sortOrder,
    text: null,
    articleId: `ART-${id}`,
    description: `Item ${id}`,
    pricePerUnit: '10.00',
    amount: '1.00',
    discount: '0.00',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Position;
}

function makeHeading(id: number, sortOrder: number): Position {
  return {
    id,
    documentId: 1,
    type: 'heading',
    sortOrder,
    text: 'Section heading',
    articleId: null,
    description: null,
    pricePerUnit: null,
    amount: null,
    discount: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Position;
}

describe('DocumentView', () => {
  it('numbers items sequentially without resetting after a heading', () => {
    // positions: item, item, heading, item — third item should be Pos. 3, not 1
    const positions = [
      makeItem(1, 0),
      makeItem(2, 1),
      makeHeading(3, 2),
      makeItem(4, 3),
    ];

    render(<DocumentView document={makeDocument(positions)} />);

    // Position number cells contain bare integers; price/amount cells use comma
    // decimals (e.g. "10,00") so filtering by /^\d+$/ isolates exactly the Pos. column
    const posCells = screen
      .getAllByRole('cell')
      .filter((cell) => /^\d+$/.test(cell.textContent ?? ''));

    expect(posCells.map((c) => c.textContent)).toEqual(['1', '2', '3']);
  });

  it('numbers items sequentially with no headings', () => {
    const positions = [makeItem(1, 0), makeItem(2, 1), makeItem(3, 2)];

    render(<DocumentView document={makeDocument(positions)} />);

    const posCells = screen
      .getAllByRole('cell')
      .filter((cell) => /^\d+$/.test(cell.textContent ?? ''));

    expect(posCells.map((c) => c.textContent)).toEqual(['1', '2', '3']);
  });

  it('renders headings with no position number', () => {
    const positions = [makeHeading(1, 0), makeItem(2, 1)];

    render(<DocumentView document={makeDocument(positions)} />);

    const posCells = screen
      .getAllByRole('cell')
      .filter((cell) => /^\d+$/.test(cell.textContent ?? ''));

    expect(posCells.map((c) => c.textContent)).toEqual(['1']);
  });
});
