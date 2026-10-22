import React, { useState } from 'react';
import { User, Check } from 'lucide-react';
import { Modal, FormField, FieldError, useToast } from '../../components/ui';
import { useCreateInvoice, useStudents } from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';

const PURPOSES = [
  { value: 'tuition', label: 'Tuition' },
  { value: 'exam_fee', label: 'Exam fee' },
  { value: 'uniform', label: 'Uniform' },
  { value: 'transport', label: 'Transport' },
  { value: 'books', label: 'Books' },
  { value: 'other', label: 'Other' },
];

export function CreateInvoiceModal({ isOpen, onClose }) {
  const { addToast } = useToast();
  const createInvoiceMutation = useCreateInvoice();

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const debouncedStudentSearch = useDebounce(studentSearch, 400);

  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
    search: debouncedStudentSearch,
  });
  const studentsList = studentsData?.students || [];

  const [formData, setFormData] = useState({
    title: '',
    purpose: 'tuition',
    amount: '',
    dueDate: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  const updateField = (field, val) => {
    setFormData((p) => ({ ...p, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSelectStudent = (st) => {
    setSelectedStudent(st);
    setStudentSearch('');
    if (errors.student) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.student;
        return copy;
      });
    }
  };

  const handleClearStudent = () => {
    setSelectedStudent(null);
    setStudentSearch('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!selectedStudent) errs.student = 'Please select a student';
    if (!formData.title.trim()) errs.title = 'Invoice title is required';
    if (!formData.amount || Number(formData.amount) <= 0) {
      errs.amount = 'Valid amount is required';
    }
    if (!formData.dueDate) errs.dueDate = 'Due date is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      await createInvoiceMutation.mutateAsync({
        studentId: selectedStudent.id,
        title: formData.title.trim(),
        purpose: formData.purpose,
        amount: Number(formData.amount),
        dueDate: formData.dueDate,
        description: formData.description.trim(),
      });
      addToast('Invoice created and issued successfully.');
      onClose();
      // Reset
      setSelectedStudent(null);
      setFormData({
        title: '',
        purpose: 'tuition',
        amount: '',
        dueDate: '',
        description: '',
      });
      setErrors({});
    } catch (err) {
      addToast(err?.message || 'Failed to create invoice.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Invoice"
      subtitle="Issue a Stripe invoice for a student. Their guardian receives the payment link."
      width={540}
    >
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
        <div>
          <b>Bill to</b>
          <div style={{ color: 'var(--mute)', fontSize: '12px' }}>
            Search for the student. The invoice is emailed to their guardian for payment.
          </div>
        </div>

        <div>
          <label style={{ fontSize: '11px', letterSpacing: '.08em', color: 'var(--mute)', display: 'block', marginBottom: '6px' }}>
            STUDENT *
          </label>
          {selectedStudent ? (
            <div
              className="row"
              style={{
                padding: '10px 14px',
                background: 'rgba(48,160,110,.1)',
                borderRadius: '12px',
                border: '1px solid #23895B',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#23895B" />
                <div>
                  <b style={{ fontSize: '14px' }}>{selectedStudent.name}</b>
                  <div style={{ fontSize: '12px', color: 'var(--mute)' }}>
                    {selectedStudent.class} · Guardian: {selectedStudent.guardian}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="ghost"
                style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: '12px', margin: 0 }}
                onClick={handleClearStudent}
              >
                Change
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <FormField
                placeholder="Type student name to search..."
                value={studentSearch}
                onChange={setStudentSearch}
              />
              {studentSearch && (
                <div
                  className="cd"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    maxHeight: '180px',
                    overflowY: 'auto',
                    padding: '8px',
                    marginTop: '4px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  }}
                >
                  {isLoadingStudents ? (
                    <div style={{ padding: '8px', color: 'var(--mute)', fontSize: '13px' }}>
                      Searching students...
                    </div>
                  ) : studentsList.length === 0 ? (
                    <div style={{ padding: '8px', color: 'var(--mute)', fontSize: '13px' }}>
                      No matching students found
                    </div>
                  ) : (
                    studentsList.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => handleSelectStudent(st)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--soft)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <User size={14} />
                        <div>
                          <b>{st.name}</b>
                          <div style={{ fontSize: '11px', color: 'var(--mute)' }}>
                            {st.class} · {st.email}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          <FieldError error={errors.student} />
        </div>

        <div>
          <b>Invoice details</b>
          <div style={{ color: 'var(--mute)', fontSize: '12px' }}>
            Describe what this charge covers.
          </div>
        </div>

        <div className="row">
          <div style={{ flex: 1 }}>
            <FormField
              label="FEE TYPE *"
              as="select"
              options={PURPOSES}
              value={formData.purpose}
              onChange={(v) => updateField('purpose', v)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormField
              label="TITLE *"
              placeholder="e.g. Term 1 tuition"
              value={formData.title}
              onChange={(v) => updateField('title', v)}
            />
            <FieldError error={errors.title} />
          </div>
        </div>

        <div>
          <b>Billing</b>
        </div>

        <div className="row">
          <div style={{ flex: 1 }}>
            <FormField
              label="AMOUNT (USD) *"
              type="number"
              placeholder="e.g. 1500"
              value={formData.amount}
              onChange={(v) => updateField('amount', v)}
            />
            <FieldError error={errors.amount} />
          </div>
          <div style={{ flex: 1 }}>
            <FormField
              label="DUE DATE *"
              type="date"
              value={formData.dueDate}
              onChange={(v) => updateField('dueDate', v)}
            />
            <FieldError error={errors.dueDate} />
          </div>
        </div>

        <FormField
          label="NOTES"
          as="textarea"
          placeholder="Optional notes for the guardian or finance office..."
          value={formData.description}
          onChange={(v) => updateField('description', v)}
        />

        <div className="row" style={{ justifyContent: 'space-between', marginTop: '10px' }}>
          <button
            type="button"
            className="ghost"
            style={{ margin: 0 }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="pb"
            disabled={createInvoiceMutation.isPending}
          >
            {createInvoiceMutation.isPending ? 'Issuing Invoice...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
