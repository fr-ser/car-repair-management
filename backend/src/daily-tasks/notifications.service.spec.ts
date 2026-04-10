import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '@/src/prisma/prisma.service';

import { EmailService } from './email.service';
import { NotificationsService } from './notifications.service';

const mockPrisma = {
  client: { findMany: vi.fn() },
  car: { findMany: vi.fn() },
};

const mockEmailService = { send: vi.fn() };

const mockConfigService = {
  get: vi.fn().mockReturnValue('notify@example.com'),
};

function makeService() {
  return new NotificationsService(
    mockPrisma as unknown as PrismaService,
    mockEmailService as unknown as EmailService,
    mockConfigService as unknown as ConfigService,
  );
}

describe('NotificationsService.sendBirthdayReminder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends email when a client has a birthday today', async () => {
    const today = dayjs('2024-03-15');
    mockPrisma.client.findMany.mockResolvedValue([
      {
        id: 1,
        firstName: 'Max',
        lastName: 'Smith',
        company: null,
        birthday: '1990-03-15',
      },
    ]);

    await makeService().sendBirthdayReminder(today);

    expect(mockEmailService.send).toHaveBeenCalledOnce();
    const [options] = mockEmailService.send.mock.calls[0] as [
      { subject: string },
    ];
    expect(options.subject).toContain('Geburtstag');
  });

  it('does not send email when no client has birthday today', async () => {
    const today = dayjs('2024-03-15');
    mockPrisma.client.findMany.mockResolvedValue([
      {
        id: 1,
        firstName: 'Anna',
        lastName: 'Jones',
        company: null,
        birthday: '1985-06-20',
      },
    ]);

    await makeService().sendBirthdayReminder(today);

    expect(mockEmailService.send).not.toHaveBeenCalled();
  });

  it('matches birthday by day and month regardless of year', async () => {
    const today = dayjs('2024-03-15');
    mockPrisma.client.findMany.mockResolvedValue([
      {
        id: 1,
        firstName: 'Old',
        lastName: 'Timer',
        company: null,
        birthday: '1950-03-15',
      },
    ]);

    await makeService().sendBirthdayReminder(today);

    expect(mockEmailService.send).toHaveBeenCalledOnce();
  });
});

describe('NotificationsService.sendTuevReminder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends email when cars have inspection due this month', async () => {
    const today = dayjs('2024-03-10');
    mockPrisma.car.findMany.mockResolvedValue([
      {
        id: 1,
        licensePlate: 'B-AB 123',
        manufacturer: 'VW',
        model: 'Golf',
        inspectionDate: '2024-03-20',
        client: { id: 1, firstName: 'Max', lastName: 'Smith', company: null },
      },
    ]);

    await makeService().sendTuevReminder(today);

    expect(mockEmailService.send).toHaveBeenCalledOnce();
    const [options] = mockEmailService.send.mock.calls[0] as [
      { subject: string },
    ];
    expect(options.subject).toContain('TÜV');
  });

  it('does not send email when no cars have inspection due this month', async () => {
    const today = dayjs('2024-03-10');
    mockPrisma.car.findMany.mockResolvedValue([
      {
        id: 1,
        licensePlate: 'B-AB 123',
        manufacturer: 'VW',
        model: 'Golf',
        inspectionDate: '2024-05-10',
        client: null,
      },
    ]);

    await makeService().sendTuevReminder(today);

    expect(mockEmailService.send).not.toHaveBeenCalled();
  });

  it('only matches cars in the exact year and month', async () => {
    const today = dayjs('2024-03-10');
    mockPrisma.car.findMany.mockResolvedValue([
      // same month but different year — should not match
      {
        id: 1,
        licensePlate: 'B-AB 123',
        manufacturer: 'VW',
        model: 'Golf',
        inspectionDate: '2023-03-15',
        client: null,
      },
    ]);

    await makeService().sendTuevReminder(today);

    expect(mockEmailService.send).not.toHaveBeenCalled();
  });
});
