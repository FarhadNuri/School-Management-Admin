import React, { useState } from 'react';
import { RotateCcw, Send, XCircle } from 'lucide-react';
import {
  SearchBar,
  FilterDropdown,
  Chips,
  StatCard,
  ViewToggle,
  Tag,
  DateTile,
  EmptyState,
  Modal,
  ConfirmModal,
  CardSkeleton,
  useToast,
} from '../../components/ui';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import {
  usePayments,
  usePayment,
  useResendInvoice,
  useCancelInvoice,
} from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';

const FEE_TYPE_OPTIONS = [
  'All fee types',
  'Tuition',
  'Exam fee',
  'Uniform',
  'Transport',
  'Books',
  'Other',
];

export function PaymentsPage() {
  const { addToast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [feeType, setFeeType] = useState('All fee types');
  const [statusChip, setStatusChip] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingPaymentId, setViewingPaymentId] = useState(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);
  const currentSearch = searchQuery !== '' ? searchQuery : debouncedSearch;

  // Status mapping:
  // Paid -> paid, Pending -> unpaid, Overdue -> overdue
  // Partial and Cancelled are handled on client
  const apiStatusParam =
    statusChip === 'Paid'
      ? 'Paid'
      : statusChip === 'Pending'
      ? 'Pending'
      : statusChip === 'Overdue'
      ? 'Overdue'
      : undefined;

  const apiPurposeParam = feeType === 'All fee types' ? undefined : feeType;

  const { data, isLoading, isError, error, refetch } = usePayments({
    search: currentSearch,
    status: apiStatusParam,
    purpose: apiPurposeParam,
  });

  const resendMutation = useResendInvoice();
  const cancelMutation = useCancelInvoice();

  const { data: detailPayment, isLoading: isLoadingDetail } = usePayment(viewingPaymentId);

  const rawPayments = data?.payments || [];

  // Client-side filtering guarantee
  const filtered = rawPayments.filter((p) => {
    if (statusChip === 'Partial' && p.status !== 'Partial') return false;
    if (statusChip === 'Cancelled' && !p.isCancelled) return false;
    if (statusChip === 'Paid' && !p.isPaid) return false;
    if (statusChip === 'Pending' && p.isPaid) return false;
    if (statusChip === 'Overdue' && !p.isOverdue) return false;

    if (feeType !== 'All fee types' && p.feeType.toLowerCase() !== feeType.toLowerCase()) {
      return false;
    }

    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const match =
        (p.student && p.student.toLowerCase().includes(q)) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.amount && p.amount.toLowerCase().includes(q)) ||
        (p.guardian && p.guardian.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Dynamic stat tiles calculated on client from loaded payment records
  let totalCollected = 0;
  let outstanding = 0;
  let overdueCount = 0;
  let paidCount = 0;

  rawPayments.forEach((p) => {
    totalCollected += p.amountPaid || 0;
    outstanding += p.balance || 0;
    if (p.isOverdue) overdueCount += 1;
    if (p.isPaid) paidCount += 1;
  });

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    refetch();
  };

  const handleResend = async (paymentId) => {
    try {
      await resendMutation.mutateAsync(paymentId);
      addToast('Invoice notification resent to guardian.');
    } catch (err) {
      addToast(err?.message || 'Failed to resend invoice.', 'error');
    }
  };

  const handleCancel = async () => {
    if (!viewingPaymentId) return;
    try {
      await cancelMutation.mutateAsync(viewingPaymentId);
      addToast('Invoice has been cancelled.');
      setIsCancelConfirmOpen(false);
      setViewingPaymentId(null);
    } catch (err) {
      addToast(err?.message || 'Failed to cancel invoice.', 'error');
    }
  };

  return (
    <div>
      <div className="pt">
        <h2>Fees & Payments</h2>
        <p>Track tuition, fees, and payment status across the school</p>
      </div>

      <SearchBar
        placeholder="Search by student, ID, receipt, or guardian..."
        value={searchInput}
        onChange={(val) => {
          setSearchInput(val);
          setSearchQuery('');
        }}
        onSearch={handleSearchClick}
        actionText="Create invoice"
        onAction={() => setIsCreateModalOpen(true)}
        filterElement={
          <FilterDropdown
            label="FEE TYPE"
            value={feeType}
            options={FEE_TYPE_OPTIONS}
            onChange={setFeeType}
          />
        }
      />

      <Chips
        items={['All', 'Paid', 'Partial', 'Pending', 'Overdue', 'Cancelled']}
        activeItem={statusChip}
        onSelect={setStatusChip}
      />

      <div className="st4">
        <StatCard label="Total collected" value={`USD ${totalCollected.toLocaleString()}`} />
        <StatCard label="Outstanding" value={`USD ${outstanding.toLocaleString()}`} tint="ta" />
        <StatCard label="Overdue" value={String(overdueCount)} tint="tr" />
        <StatCard label="Paid in full" value={String(paidCount)} tint="tg2" />
      </div>

      <ViewToggle
        total={filtered.length}
        label="payments"
        mode={viewMode}
        onChange={setViewMode}
      />

      {isLoading ? (
        <div className={`gr ${viewMode === 'list' ? 'ls' : ''}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px' }}>
          <b style={{ color: '#C23A52' }}>Failed to load payments</b>
          <p style={{ color: 'var(--mute)' }}>{error?.message || 'Server error'}</p>
          <div>
            <button
              type="button"
              className="pb"
              style={{ width: 'fit-content', margin: '0 auto' }}
              onClick={() => refetch()}
            >
              <RotateCcw size={15} strokeWidth={1.8} /> Retry
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No payments found" description="Try selecting another status or fee type filter." />
      ) : (
        <div className={`gr ${viewMode === 'list' ? 'ls' : ''}`}>
          {filtered.map((p) => (
            <div key={p.id} className="cd">
              <div className="row">
                <DateTile month={p.month} day={p.day} />
                <div>
                  <h3>{p.student}</h3>
                  <p>
                    {p.title} · {p.due}
                  </p>
                </div>
                <Tag
                  color={p.isPaid ? 'g' : p.isOverdue ? 'a' : p.status === 'Partial' ? 'b' : ''}
                  style={{ marginLeft: 'auto' }}
                >
                  {p.status}
                </Tag>
              </div>

              <div className="row">
                <div>
                  <small style={{ color: 'var(--mute)' }}>{p.balanceType}</small>
                  <b
                    className="hd"
                    style={{
                      display: 'block',
                      fontSize: '20px',
                      color: p.balanceType === 'BALANCE' && !p.isCancelled ? '#C23A52' : 'inherit',
                    }}
                  >
                    {p.amount}
                  </b>
                </div>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="ghost"
                    style={{ margin: 0 }}
                    onClick={() => setViewingPaymentId(p.id)}
                  >
                    View
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {viewingPaymentId && (
        <Modal
          isOpen={Boolean(viewingPaymentId)}
          onClose={() => setViewingPaymentId(null)}
          title={detailPayment?.title || 'Invoice Details'}
          subtitle={`Invoice #${detailPayment?.id?.slice(-8) || viewingPaymentId?.slice(-8)}`}
          width={560}
        >
          {isLoadingDetail || !detailPayment ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--mute)' }}>
              Loading invoice details...
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div className="row" style={{ alignItems: 'center' }}>
                <Tag
                  color={
                    detailPayment.isPaid
                      ? 'g'
                      : detailPayment.isOverdue
                      ? 'a'
                      : detailPayment.status === 'Partial'
                      ? 'b'
                      : ''
                  }
                >
                  {detailPayment.status}
                </Tag>
                <Tag>{detailPayment.feeType}</Tag>
                <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--mute)' }}>
                  {detailPayment.due}
                </span>
              </div>

              <div
                className="cd"
                style={{
                  background: 'var(--bg)',
                  padding: '16px',
                  borderRadius: '16px',
                  display: 'grid',
                  gap: '8px',
                }}
              >
                <div className="row">
                  <span style={{ color: 'var(--mute)', fontSize: '13px' }}>Billed student:</span>
                  <b style={{ marginLeft: 'auto' }}>{detailPayment.student}</b>
                </div>
                <div className="row">
                  <span style={{ color: 'var(--mute)', fontSize: '13px' }}>Guardian contact:</span>
                  <span style={{ marginLeft: 'auto' }}>
                    {detailPayment.guardian} {detailPayment.guardianEmail ? `(${detailPayment.guardianEmail})` : ''}
                  </span>
                </div>
                <div className="row">
                  <span style={{ color: 'var(--mute)', fontSize: '13px' }}>Issued date:</span>
                  <span style={{ marginLeft: 'auto' }}>{detailPayment.createdAt}</span>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div
                className="cd"
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  display: 'grid',
                  gap: '10px',
                }}
              >
                <div className="row">
                  <span>Total Amount</span>
                  <b style={{ marginLeft: 'auto' }}>USD {detailPayment.rawAmount?.toLocaleString()}</b>
                </div>
                <div className="row">
                  <span style={{ color: 'var(--mute)' }}>Amount Paid</span>
                  <span style={{ marginLeft: 'auto', color: '#23895B' }}>
                    USD {detailPayment.amountPaid?.toLocaleString()}
                  </span>
                </div>
                <div className="row" style={{ borderTop: '1px solid var(--line)', paddingTop: '8px' }}>
                  <b>Outstanding Balance</b>
                  <b
                    style={{
                      marginLeft: 'auto',
                      color: detailPayment.balance > 0 ? '#C23A52' : '#23895B',
                    }}
                  >
                    USD {detailPayment.balance?.toLocaleString()}
                  </b>
                </div>
              </div>


              {detailPayment.notes && detailPayment.notes !== '—' && (
                <div style={{ fontSize: '13px', color: 'var(--mute)' }}>
                  <b>Notes:</b> {detailPayment.notes}
                </div>
              )}

              {/* Action Buttons: hide when already paid or cancelled */}
              {!detailPayment.isPaid && !detailPayment.isCancelled && (
                <div className="row" style={{ gap: '8px', marginTop: '8px' }}>
                  <button
                    type="button"
                    className="ghost"
                    style={{ margin: 0, color: '#C23A52' }}
                    onClick={() => setIsCancelConfirmOpen(true)}
                  >
                    <XCircle size={15} strokeWidth={1.8} /> Cancel invoice
                  </button>
                  <button
                    type="button"
                    className="pb"
                    style={{ marginLeft: 'auto', height: '40px' }}
                    disabled={resendMutation.isPending}
                    onClick={() => handleResend(detailPayment.id)}
                  >
                    <Send size={15} strokeWidth={1.8} />{' '}
                    {resendMutation.isPending ? 'Resending...' : 'Resend invoice'}
                  </button>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Invoice"
        message="Are you sure you want to cancel this invoice? The Stripe checkout session will be invalidated."
        confirmText="Cancel Invoice"
        confirmColor="#C23A52"
        isLoading={cancelMutation.isPending}
      />

      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
