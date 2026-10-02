import { generateSeedTransactions, type SeedTransaction } from './seed-transactions';
import { generateSeedActivityLogs, type SeedActivityLog } from './seed-activity';
import { generateSeedReconciliationRecords, type SeedReconciliationRecord } from './seed-reconciliation';
import { generateSeedWorkflows, type SeedWorkflow, type SeedWorkflowExecution } from './seed-workflows';
import { generateSeedNotifications, type SeedNotificationItem } from './seed-notifications';
import type { DashboardData } from '@/features/dashboard/types/dashboard.types';

export interface TransactionFilterParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  paymentMethod?: string;
  minAmountCents?: number;
  maxAmountCents?: number;
  from?: string;
  to?: string;
  sortBy?: 'createdAt' | 'amountCents' | 'status' | 'customerName';
  sortOrder?: 'asc' | 'desc';
}

export interface ActivityFilterParams {
  page?: number;
  pageSize?: number;
  q?: string;
  role?: string;
  action?: string;
  entityType?: string;
  result?: string;
  from?: string;
  to?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

class MockDataRepository {
  private transactions: SeedTransaction[] = [];
  private activityLogs: SeedActivityLog[] = [];
  private reconciliationRecords: SeedReconciliationRecord[] = [];
  private workflows: SeedWorkflow[] = [];
  private workflowExecutions: SeedWorkflowExecution[] = [];
  private notifications: SeedNotificationItem[] = [];
  private idempotencyKeys = new Set<string>();
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (!this.isInitialized) {
      this.transactions = generateSeedTransactions(250, 42);
      this.activityLogs = generateSeedActivityLogs();
      this.reconciliationRecords = generateSeedReconciliationRecords();
      const wfData = generateSeedWorkflows();
      this.workflows = wfData.workflows;
      this.workflowExecutions = wfData.executions;
      this.notifications = generateSeedNotifications();
      this.isInitialized = true;
    }
  }

  // --- Dashboard Metrics ---
  public getDashboardMetrics(timeRange: '24h' | '7d' | '30d' | '90d' = '7d'): DashboardData {
    this.init();
    const now = new Date('2026-11-01T14:00:00.000Z').getTime();

    const hoursMap = {
      '24h': 24,
      '7d': 7 * 24,
      '30d': 30 * 24,
      '90d': 90 * 24,
    };

    const windowHours = hoursMap[timeRange] || 7 * 24;
    const windowStartMs = now - windowHours * 3600 * 1000;

    const filtered = this.transactions.filter(
      (t) => new Date(t.createdAt).getTime() >= windowStartMs
    );

    const activeList = filtered.length > 0 ? filtered : this.transactions.slice(0, 50);

    let totalVolumeCents = 0;
    let successfulCount = 0;
    let failedCount = 0;
    let pendingCount = 0;
    let totalProcessingTime = 0;

    const statusCounts: Record<string, number> = {
      settled: 0,
      failed: 0,
      pending: 0,
      refunded: 0,
    };

    const dailyMap: Record<string, { settledCents: number; failedCents: number; pendingCents: number }> = {};

    activeList.forEach((txn) => {
      totalVolumeCents += txn.amountCents;
      totalProcessingTime += txn.processingTimeMs;

      if (txn.status === 'settled') {
        successfulCount++;
        statusCounts.settled = (statusCounts.settled || 0) + 1;
      } else if (txn.status === 'failed') {
        failedCount++;
        statusCounts.failed = (statusCounts.failed || 0) + 1;
      } else if (txn.status === 'pending') {
        pendingCount++;
        statusCounts.pending = (statusCounts.pending || 0) + 1;
      } else if (txn.status === 'refunded') {
        statusCounts.refunded = (statusCounts.refunded || 0) + 1;
      }

      const dayKey = txn.createdAt.split('T')[0] || '2026-11-01';
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { settledCents: 0, failedCents: 0, pendingCents: 0 };
      }
      if (txn.status === 'settled') dailyMap[dayKey].settledCents += txn.amountCents;
      if (txn.status === 'failed') dailyMap[dayKey].failedCents += txn.amountCents;
      if (txn.status === 'pending') dailyMap[dayKey].pendingCents += txn.amountCents;
    });

    const totalDecided = successfulCount + failedCount;
    const authorizationRate = totalDecided > 0 ? (successfulCount / totalDecided) * 100 : 96.5;
    const averageProcessingTimeMs = activeList.length > 0 ? Math.round(totalProcessingTime / activeList.length) : 185;

    const volumeOverTime = Object.keys(dailyMap)
      .sort()
      .map((date) => ({
        date,
        settledCents: dailyMap[date]?.settledCents || 0,
        failedCents: dailyMap[date]?.failedCents || 0,
        pendingCents: dailyMap[date]?.pendingCents || 0,
      }));

    const totalTransactions = activeList.length;
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: totalTransactions > 0 ? Math.round((count / totalTransactions) * 1000) / 10 : 0,
    }));

    return {
      timeRange,
      summary: {
        totalVolumeCents,
        successfulTransactionsCount: successfulCount,
        failedTransactionsCount: failedCount,
        pendingTransactionsCount: pendingCount,
        authorizationRate: Math.round(authorizationRate * 100) / 100,
        averageProcessingTimeMs,
        volumeDeltaPercent: timeRange === '24h' ? 8.4 : timeRange === '7d' ? 12.1 : 5.8,
        unreconciledDiscrepancyCents: 184500,
      },
      volumeOverTime,
      statusDistribution,
      recentTransactions: activeList.slice(0, 7),
      recentActivity: this.activityLogs.slice(0, 5),
    };
  }

  // --- Transactions ---
  public getTransactions(params: TransactionFilterParams = {}): PaginatedResult<SeedTransaction> {
    this.init();
    const {
      page = 1,
      pageSize = 25,
      q,
      status,
      paymentMethod,
      minAmountCents,
      maxAmountCents,
      from,
      to,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    let result = [...this.transactions];

    // Filter by search query (ID, Customer Name, Email)
    if (q) {
      const query = q.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(query) ||
          t.referenceId.toLowerCase().includes(query) ||
          t.customer.name.toLowerCase().includes(query) ||
          t.customer.email.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (status && status !== 'all') {
      result = result.filter((t) => t.status === status);
    }

    // Filter by payment method
    if (paymentMethod && paymentMethod !== 'all') {
      result = result.filter((t) => t.paymentMethod === paymentMethod);
    }

    // Filter by amount range
    if (minAmountCents !== undefined) {
      result = result.filter((t) => t.amountCents >= minAmountCents);
    }
    if (maxAmountCents !== undefined) {
      result = result.filter((t) => t.amountCents <= maxAmountCents);
    }

    // Filter by date range
    if (from) {
      const fromTime = new Date(from).getTime();
      result = result.filter((t) => new Date(t.createdAt).getTime() >= fromTime);
    }
    if (to) {
      const toTime = new Date(to).getTime();
      result = result.filter((t) => new Date(t.createdAt).getTime() <= toTime);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'amountCents') {
        comparison = a.amountCents - b.amountCents;
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortBy === 'customerName') {
        comparison = a.customer.name.localeCompare(b.customer.name);
      } else {
        // Default to createdAt
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedData = result.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedData,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  public getTransactionById(id: string): SeedTransaction | null {
    this.init();
    return this.transactions.find((t) => t.id === id) || null;
  }

  public retryTransaction(
    id: string,
    idempotencyKey: string,
    notes?: string
  ): {
    transaction: SeedTransaction;
    executionId: string;
    status: 'processing' | 'succeeded';
    gatewayMessage: string;
  } {
    this.init();
    const txn = this.getTransactionById(id);
    if (!txn) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }

    if (this.idempotencyKeys.has(idempotencyKey)) {
      throw new Error('DUPLICATE_IDEMPOTENCY_KEY');
    }

    if (txn.status === 'settled' || txn.status === 'processing') {
      throw new Error('TRANSACTION_ALREADY_RESOLVED');
    }

    if (txn.retryCount >= txn.maxRetriesAllowed) {
      throw new Error('MAX_RETRIES_EXCEEDED');
    }

    this.idempotencyKeys.add(idempotencyKey);

    // Increment retry count & update status
    txn.retryCount += 1;
    txn.status = 'processing';
    txn.updatedAt = new Date().toISOString();

    const executionId = `exec_${Date.now()}`;
    const timestamp = new Date().toISOString();

    txn.timeline.push({
      id: `evt_retry_${executionId}`,
      event: 'retry_scheduled',
      description: `Manual retry simulation executed. Notes: ${notes || 'None'}. Idempotency: ${idempotencyKey}`,
      actor: 'Elena Vance (Ops Lead)',
      timestamp,
    });

    // Record activity log
    this.activityLogs.unshift({
      id: `act_${Date.now()}`,
      actorId: 'usr_lead',
      actorName: 'Elena Vance',
      actorRole: 'operations_lead',
      action: 'TRANSACTION_RETRY',
      entityType: 'transaction',
      entityId: txn.id,
      description: `Dispatched manual smart retry simulation for ${txn.id} ($${(txn.amountCents / 100).toFixed(2)}).`,
      timestamp,
    });

    return {
      transaction: txn,
      executionId,
      status: 'processing',
      gatewayMessage: 'Retry payload accepted by mock acquiring network.',
    };
  }

  // --- Reconciliation ---
  public getReconciliationRecords(
    status?: string,
    page: number = 1,
    pageSize: number = 25,
    search?: string
  ): PaginatedResult<SeedReconciliationRecord> {
    this.init();
    let records = [...this.reconciliationRecords];

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.batchId.toLowerCase().includes(q) ||
          (r.internalTransactionId && r.internalTransactionId.toLowerCase().includes(q)) ||
          r.externalGatewayReference.toLowerCase().includes(q) ||
          r.gatewayName.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all') {
      if (status === 'missing_provider') {
        records = records.filter(
          (r) => r.matchStatus === 'missing_provider' || r.matchStatus === 'missing_external'
        );
      } else {
        records = records.filter((r) => r.matchStatus === status);
      }
    }

    const totalItems = records.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginated = records.slice(startIndex, startIndex + pageSize);

    return {
      data: paginated,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  public getReconciliationSummary(): {
    totalRecords: number;
    matchedCount: number;
    mismatchedCount: number;
    duplicateCount: number;
    missingProviderCount: number;
    missingInternalCount: number;
    resolvedCount: number;
    discrepancyTotalCents: number;
    netSettledTotalCents: number;
    matchRatePercentage: number;
  } {
    this.init();
    const records = this.reconciliationRecords;
    const totalRecords = records.length;
    const matchedCount = records.filter((r) => r.matchStatus === 'matched').length;
    const mismatchedCount = records.filter((r) => r.matchStatus === 'mismatched_amount').length;
    const duplicateCount = records.filter((r) => r.matchStatus === 'duplicate_record').length;
    const missingProviderCount = records.filter(
      (r) => r.matchStatus === 'missing_provider' || r.matchStatus === 'missing_external'
    ).length;
    const missingInternalCount = records.filter((r) => r.matchStatus === 'missing_internal').length;
    const resolvedCount = records.filter((r) => r.matchStatus === 'resolved').length;

    const discrepancyTotalCents = records
      .filter((r) => r.matchStatus !== 'matched' && r.matchStatus !== 'resolved')
      .reduce((sum, r) => sum + r.discrepancyDeltaCents, 0);

    const netSettledTotalCents = records.reduce((sum, r) => sum + r.netSettledCents, 0);
    const matchRatePercentage = totalRecords > 0 ? Number(((matchedCount / totalRecords) * 100).toFixed(1)) : 100;

    return {
      totalRecords,
      matchedCount,
      mismatchedCount,
      duplicateCount,
      missingProviderCount,
      missingInternalCount,
      resolvedCount,
      discrepancyTotalCents,
      netSettledTotalCents,
      matchRatePercentage,
    };
  }

  public getReconciliationRecordById(id: string): SeedReconciliationRecord | null {
    this.init();
    return this.reconciliationRecords.find((r) => r.id === id) || null;
  }

  public resolveReconciliationRecord(
    id: string,
    notes: string,
    action: string = 'force_match'
  ): SeedReconciliationRecord {
    this.init();
    const record = this.reconciliationRecords.find((r) => r.id === id);
    if (!record) throw new Error('RECORD_NOT_FOUND');

    record.matchStatus = 'resolved';
    record.resolvedAt = new Date().toISOString();
    record.resolutionNotes = notes;
    record.resolvedBy = 'Elena Vance (Ops Lead)';

    if (!record.history) {
      record.history = [];
    }
    record.history.push({
      timestamp: record.resolvedAt,
      action: `MANUAL_RESOLUTION (${action.toUpperCase()})`,
      actor: record.resolvedBy,
      notes,
    });

    this.activityLogs.unshift({
      id: `act_${Date.now()}`,
      actorId: 'usr_lead',
      actorName: 'Elena Vance',
      actorRole: 'operations_lead',
      action: 'RECONCILIATION_RESOLVE',
      entityType: 'reconciliation',
      entityId: record.id,
      description: `Resolved discrepancy for batch ${record.batchId} via ${action}. Notes: ${notes}`,
      timestamp: new Date().toISOString(),
    });

    return record;
  }

  // --- Workflows ---
  public getWorkflows(): SeedWorkflow[] {
    this.init();
    return this.workflows;
  }

  public getWorkflowById(id: string): SeedWorkflow | undefined {
    this.init();
    return this.workflows.find((w) => w.id === id);
  }

  public createWorkflow(data: Omit<SeedWorkflow, 'id' | 'executionCount' | 'createdAt' | 'updatedAt'>): SeedWorkflow {
    this.init();
    const newWorkflow: SeedWorkflow = {
      ...data,
      id: `wf_${Date.now()}`,
      executionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.workflows.unshift(newWorkflow);
    return newWorkflow;
  }

  public updateWorkflow(id: string, partial: Partial<SeedWorkflow>): SeedWorkflow {
    this.init();
    const wf = this.workflows.find((w) => w.id === id);
    if (!wf) throw new Error('WORKFLOW_NOT_FOUND');

    Object.assign(wf, partial, { updatedAt: new Date().toISOString() });
    return wf;
  }

  public deleteWorkflow(id: string): boolean {
    this.init();
    const idx = this.workflows.findIndex((w) => w.id === id);
    if (idx === -1) throw new Error('WORKFLOW_NOT_FOUND');
    this.workflows.splice(idx, 1);
    return true;
  }

  public simulateWorkflowRun(workflowId: string, triggerEntityId?: string): SeedWorkflowExecution {
    this.init();
    const wf = this.workflows.find((w) => w.id === workflowId);
    if (!wf) throw new Error('WORKFLOW_NOT_FOUND');

    let entityId = triggerEntityId;
    let entityType: 'transaction' | 'reconciliation_record' = 'transaction';
    let entityData: Record<string, unknown> = {};

    if (wf.trigger.eventType === 'reconciliation_mismatch') {
      entityType = 'reconciliation_record';
      const sampleRec = this.reconciliationRecords.find((r) => r.matchStatus !== 'matched') || this.reconciliationRecords[0];
      entityId = entityId || (sampleRec ? sampleRec.id : 'rec_sim_001');
      entityData = {
        discrepancyDeltaCents: sampleRec?.discrepancyDeltaCents ?? 125000,
        gatewayName: sampleRec?.gatewayName ?? 'StripeSim',
        matchStatus: sampleRec?.matchStatus ?? 'mismatched_amount',
        currency: sampleRec?.currency ?? 'USD',
      };
    } else {
      entityType = 'transaction';
      const sampleTxn = this.transactions.find((t) => t.status === 'failed') || this.transactions[0];
      entityId = entityId || (sampleTxn ? sampleTxn.id : 'txn_sim_0042');
      entityData = {
        failureReason: sampleTxn?.failureReason ?? 'network_timeout',
        retryCount: sampleTxn?.retryCount ?? 1,
        amountCents: sampleTxn?.amountCents ?? 24900,
        'customer.tier': sampleTxn?.customer?.tier ?? 'enterprise',
        'customer.riskScore': sampleTxn?.customer?.riskScore ?? 35,
        paymentMethod: sampleTxn?.paymentMethod ?? 'card',
      };
    }

    const stepLogs: Array<{
      stepNumber: number;
      stepName: string;
      status: 'success' | 'failed' | 'skipped';
      outputMessage: string;
    }> = [];

    let conditionsMet = true;
    let stepIndex = 1;

    for (const cond of wf.conditions) {
      const val = entityData[cond.field];
      let matched = false;

      if (cond.operator === 'eq') {
        matched = String(val).toLowerCase() === String(cond.value).toLowerCase();
      } else if (cond.operator === 'neq') {
        matched = String(val).toLowerCase() !== String(cond.value).toLowerCase();
      } else if (cond.operator === 'gt') {
        matched = Number(val) > Number(cond.value);
      } else if (cond.operator === 'lt') {
        matched = Number(val) < Number(cond.value);
      } else if (cond.operator === 'contains') {
        matched = String(val).toLowerCase().includes(String(cond.value).toLowerCase());
      } else if (cond.operator === 'in') {
        const arr = Array.isArray(cond.value) ? cond.value : String(cond.value).split(',').map((s) => s.trim());
        matched = arr.map(String).includes(String(val));
      }

      if (matched) {
        stepLogs.push({
          stepNumber: stepIndex++,
          stepName: `Evaluate Condition: ${cond.field} ${cond.operator} ${cond.value}`,
          status: 'success',
          outputMessage: `Rule condition satisfied. Observed payload value: "${val ?? 'undefined'}".`,
        });
      } else {
        conditionsMet = false;
        stepLogs.push({
          stepNumber: stepIndex++,
          stepName: `Evaluate Condition: ${cond.field} ${cond.operator} ${cond.value}`,
          status: 'failed',
          outputMessage: `Condition not met. Expected: ${cond.operator} ${cond.value}, Actual: "${val ?? 'undefined'}".`,
        });
        break;
      }
    }

    let overallStatus: 'success' | 'skipped' | 'failed' = 'success';

    if (conditionsMet) {
      for (const action of wf.actions) {
        let msg = '';
        if (action.type === 'auto_retry') {
          const maxAttempts = (action.params.maxAttempts as number) || 2;
          msg = `Dispatched smart retry simulation payload (max attempts: ${maxAttempts}). Status: queued.`;
        } else if (action.type === 'notify_slack') {
          const ch = (action.params.channel as string) || '#ops-alerts';
          msg = `Delivered alert notification payload to webhook channel ${ch}. HTTP 200 OK.`;
        } else if (action.type === 'create_ticket') {
          const queue = (action.params.queue as string) || 'Ops-Triage';
          const priority = (action.params.priority as string) || 'high';
          msg = `Generated incident ticket INC-${Math.floor(1000 + Math.random() * 9000)} in queue "${queue}" with priority "${priority}".`;
        } else if (action.type === 'freeze_account') {
          const dur = (action.params.durationMinutes as number) || 60;
          msg = `Placed simulated safety hold for ${dur} minutes on associated customer account.`;
        } else {
          msg = `Executed action "${action.type}".`;
        }

        stepLogs.push({
          stepNumber: stepIndex++,
          stepName: `Execute Action: ${action.type.replace(/_/g, ' ').toUpperCase()}`,
          status: 'success',
          outputMessage: msg,
        });
      }
    } else {
      overallStatus = 'skipped';
      stepLogs.push({
        stepNumber: stepIndex++,
        stepName: 'Execute Actions',
        status: 'skipped',
        outputMessage: 'Rule conditions evaluation returned false. Action execution sequence aborted.',
      });
    }

    const durationMs = Math.floor(45 + Math.random() * 120);
    const execution: SeedWorkflowExecution = {
      id: `wfe_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      workflowId: wf.id,
      workflowName: wf.name,
      triggerEntityId: entityId || 'ent_mock_001',
      triggerEntityType: entityType,
      status: overallStatus,
      durationMs,
      stepLogs,
      executedAt: new Date().toISOString(),
    };

    this.workflowExecutions.unshift(execution);
    wf.executionCount += 1;
    wf.lastExecutedAt = execution.executedAt;
    wf.updatedAt = execution.executedAt;

    this.activityLogs.unshift({
      id: `act_${Date.now()}`,
      actorId: 'sys_workflow_engine',
      actorName: 'Automation Engine (Simulated)',
      actorRole: 'operations_lead',
      action: 'WORKFLOW_TRIGGERED',
      entityType: 'workflow',
      entityId: wf.id,
      description: `Simulated execution of rule "${wf.name}" on ${entityId} resulting in status "${overallStatus}".`,
      timestamp: execution.executedAt,
    });

    return execution;
  }

  public getWorkflowExecutions(workflowId?: string, page: number = 1, pageSize: number = 25): PaginatedResult<SeedWorkflowExecution> {
    this.init();
    let list = [...this.workflowExecutions];
    if (workflowId) {
      list = list.filter((e) => e.workflowId === workflowId);
    }

    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;

    return {
      data: list.slice(startIndex, startIndex + pageSize),
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  // --- Notifications ---
  public getNotifications(unreadOnly: boolean = false, severity?: string): SeedNotificationItem[] {
    this.init();
    let list = this.notifications;
    if (unreadOnly) {
      list = list.filter((n) => !n.read);
    }
    if (severity && severity !== 'all') {
      list = list.filter((n) => n.severity === severity);
    }
    return list;
  }

  public markNotificationAsRead(id: string): SeedNotificationItem | null {
    this.init();
    const notif = this.notifications.find((n) => n.id === id);
    if (!notif) return null;
    notif.read = true;
    return notif;
  }

  public markAllNotificationsAsRead(): number {
    this.init();
    let count = 0;
    this.notifications.forEach((n) => {
      if (!n.read) {
        n.read = true;
        count++;
      }
    });
    return count;
  }

  // --- Activity Logs ---
  public getActivityLogs(params: ActivityFilterParams = {}): PaginatedResult<SeedActivityLog> {
    this.init();
    const {
      page = 1,
      pageSize = 10,
      q,
      role,
      action,
      entityType,
      result,
      from,
      to,
    } = params;

    let list = [...this.activityLogs];

    // Filter by query (Actor name, entity ID, description)
    if (q) {
      const query = q.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.actorName.toLowerCase().includes(query) ||
          item.entityId.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    // Filter by actor role
    if (role && role !== 'all') {
      list = list.filter((item) => item.actorRole === role);
    }

    // Filter by action
    if (action && action !== 'all') {
      list = list.filter((item) => item.action === action);
    }

    // Filter by entity type
    if (entityType && entityType !== 'all') {
      list = list.filter((item) => item.entityType === entityType);
    }

    // Filter by result
    if (result && result !== 'all') {
      list = list.filter((item) => (item.result || 'success') === result);
    }

    // Filter by date range
    if (from) {
      const fromTime = new Date(from).getTime();
      list = list.filter((item) => new Date(item.timestamp).getTime() >= fromTime);
    }
    if (to) {
      const toTime = new Date(to).getTime();
      list = list.filter((item) => new Date(item.timestamp).getTime() <= toTime);
    }

    // Sort descending by timestamp
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;

    return {
      data: list.slice(startIndex, startIndex + pageSize),
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  public addActivityLog(log: Omit<SeedActivityLog, 'id' | 'timestamp'>): SeedActivityLog {
    this.init();
    const entry: SeedActivityLog = {
      ...log,
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.activityLogs.unshift(entry);
    return entry;
  }
}

export const mockRepository = new MockDataRepository();
