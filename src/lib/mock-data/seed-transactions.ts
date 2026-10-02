import type { CurrencyCode, PaymentMethodType, TransactionStatus } from '@/types';

export interface SeedCustomer {
  id: string;
  name: string;
  email: string;
  tier: 'standard' | 'premium' | 'enterprise';
  riskScore: number;
}

export interface TransactionTimelineEvent {
  id: string;
  event: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface SeedTransaction {
  id: string;
  referenceId: string;
  amountCents: number;
  currency: CurrencyCode;
  status: TransactionStatus;
  paymentMethod: PaymentMethodType;
  paymentMethodDetails: {
    brand?: string;
    last4?: string;
    expiry?: string;
    bankName?: string;
    accountLast4?: string;
  };
  customer: SeedCustomer;
  failureReason: string | null;
  processingTimeMs: number;
  retryCount: number;
  maxRetriesAllowed: number;
  idempotencyKey?: string | null;
  gatewayResponse?: {
    gateway: string;
    gatewayTransactionId: string;
    rawCode: string;
    rawMessage: string;
    declineCode?: string;
    networkLatencyMs: number;
    rawPayload: Record<string, unknown>;
  };
  timeline: TransactionTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

class PseudoRandom {
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed % 2147483647;
    if (this.state <= 0) this.state += 2147483646;
  }

  next(): number {
    this.state = (this.state * 16807) % 2147483647;
    return (this.state - 1) / 2147483646;
  }

  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: T[]): T {
    const idx = Math.floor(this.next() * array.length);
    return array[idx] as T;
  }
}

const CUSTOMERS: SeedCustomer[] = [
  { id: 'cust_001', name: 'Acme Global Corp', email: 'billing@acmeglobal.example', tier: 'enterprise', riskScore: 12 },
  { id: 'cust_002', name: 'Nexus Dynamics', email: 'ops@nexusdyn.example', tier: 'enterprise', riskScore: 8 },
  { id: 'cust_003', name: 'CloudScale Systems', email: 'payops@cloudscale.example', tier: 'enterprise', riskScore: 19 },
  { id: 'cust_004', name: 'Jane Cooper', email: 'jane.cooper@example.com', tier: 'premium', riskScore: 24 },
  { id: 'cust_005', name: 'Sarah Connor', email: 's.connor@cyberdyne.example', tier: 'standard', riskScore: 35 },
  { id: 'cust_006', name: 'Wade Wilson', email: 'wade@mercenary.example', tier: 'standard', riskScore: 78 },
  { id: 'cust_007', name: 'Vanguard Retail', email: 'finance@vanguard.example', tier: 'enterprise', riskScore: 14 },
  { id: 'cust_008', name: 'Marcus Brody', email: 'm.brody@museum.example', tier: 'premium', riskScore: 5 },
  { id: 'cust_009', name: 'Elena Vance', email: 'elena@payops.example', tier: 'enterprise', riskScore: 9 },
  { id: 'cust_010', name: 'Hyperion Analytics', email: 'accounts@hyperion.example', tier: 'enterprise', riskScore: 16 },
];

const FAILURE_REASONS = [
  'insufficient_funds',
  'do_not_honor',
  'network_timeout',
  'card_velocity_exceeded',
  'gateway_unavailable',
  'expired_card',
];

export function generateSeedTransactions(count: number = 200, seedValue: number = 42): SeedTransaction[] {
  const prng = new PseudoRandom(seedValue);
  const transactions: SeedTransaction[] = [];
  const baseTime = new Date('2026-11-01T14:00:00.000Z').getTime();

  for (let i = 0; i < count; i++) {
    const id = `txn_${(i + 1).toString().padStart(4, '0')}`;
    const referenceId = `ref_order_${prng.range(10000, 99999)}`;
    const customer = prng.choice(CUSTOMERS);
    const paymentMethod: PaymentMethodType = prng.choice(['card', 'card', 'card', 'bank_transfer', 'virtual_account', 'ach', 'wire']);
    
    // Status distribution: ~85% settled, ~8% failed, ~5% pending, ~2% refunded
    const roll = prng.next();
    let status: TransactionStatus = 'settled';
    let failureReason: string | null = null;
    let retryCount = 0;

    if (roll < 0.08) {
      status = 'failed';
      failureReason = prng.choice(FAILURE_REASONS);
      retryCount = prng.range(0, 2);
    } else if (roll < 0.13) {
      status = 'pending';
    } else if (roll < 0.15) {
      status = 'refunded';
    }

    const amountCents = prng.range(1500, 750000);
    const processingTimeMs = prng.range(85, 420);

    const hoursAgo = prng.range(1, 30 * 24);
    const createdAtDate = new Date(baseTime - hoursAgo * 3600 * 1000);
    const createdAt = createdAtDate.toISOString();
    const updatedAt = new Date(createdAtDate.getTime() + processingTimeMs).toISOString();

    const paymentMethodDetails = paymentMethod === 'card'
      ? {
          brand: prng.choice(['Visa', 'Mastercard', 'Amex']),
          last4: prng.range(1000, 9999).toString(),
          expiry: `${prng.range(1, 12).toString().padStart(2, '0')}/${prng.range(26, 30)}`,
        }
      : {
          bankName: prng.choice(['JPMorgan Chase', 'Bank of America', 'Wells Fargo', 'Citigroup']),
          accountLast4: prng.range(1000, 9999).toString(),
        };

    const gatewayName = prng.choice(['StripeSim', 'AdyenMock', 'ChaseGateway']);
    const gatewayResponse = {
      gateway: gatewayName,
      gatewayTransactionId: `gw_${prng.range(10000000, 99999999)}`,
      rawCode: status === 'failed' ? (failureReason || 'generic_decline') : 'approved_00',
      rawMessage: status === 'failed' ? `Transaction rejected: ${failureReason}` : 'Transaction approved by issuing bank',
      declineCode: status === 'failed' ? failureReason || undefined : undefined,
      networkLatencyMs: processingTimeMs,
      rawPayload: {
        gateway_version: 'v2.4.1',
        merchant_id: 'merch_finflow_ops',
        clearing_network: paymentMethod === 'card' ? 'VisaNet' : 'FedACH',
        settlement_currency: 'USD',
      },
    };

    const timeline: TransactionTimelineEvent[] = [
      {
        id: `evt_${id}_1`,
        event: 'created',
        description: `Transaction created for ${customer.name} via ${paymentMethod}.`,
        actor: 'Client API',
        timestamp: createdAt,
      },
    ];

    if (status === 'settled') {
      timeline.push({
        id: `evt_${id}_2`,
        event: 'authorized',
        description: 'Payment authorized and settled successfully.',
        actor: gatewayName,
        timestamp: updatedAt,
      });
    } else if (status === 'failed') {
      timeline.push({
        id: `evt_${id}_2`,
        event: 'capture_failed',
        description: `Payment declined: ${failureReason}.`,
        actor: gatewayName,
        timestamp: updatedAt,
      });
      if (retryCount > 0) {
        timeline.push({
          id: `evt_${id}_3`,
          event: 'retry_scheduled',
          description: `Automatic retry attempt #1 executed.`,
          actor: 'Automation Engine',
          timestamp: new Date(new Date(updatedAt).getTime() + 15000).toISOString(),
        });
      }
    }

    transactions.push({
      id,
      referenceId,
      amountCents,
      currency: 'USD',
      status,
      paymentMethod,
      paymentMethodDetails,
      customer,
      failureReason,
      processingTimeMs,
      retryCount,
      maxRetriesAllowed: 3,
      idempotencyKey: `idem_${id}_init`,
      gatewayResponse,
      timeline,
      createdAt,
      updatedAt,
    });
  }

  return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
