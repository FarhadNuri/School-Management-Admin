import React, { useState } from 'react';
import {
  Tag as TagIcon,
  RotateCcw,
  Edit3,
  Trash2,
  Calendar,
  Users,
  Paperclip,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  X,
  UploadCloud
} from 'lucide-react';
import {
  SearchBar,
  Chips,
  ViewToggle,
  Tag,
  DateTile,
  EmptyState,
  Modal,
  FormField,
  OptionGroup,
  MultiSelectChips,
  FieldError,
  CardSkeleton,
  ConfirmModal,
  useToast,
} from '../../components/ui';
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';

const PRIORITY_COLOR = {
  High: 'a',
  Medium: 'b',
  Low: 'g',
};

const CATEGORIES = ['general', 'academic', 'disciplinary', 'other'];
const SEVERITIES = ['low', 'medium', 'high'];
const AUDIENCES = [
  { id: 'all', name: 'All' },
  { id: 'students', name: 'Students' },
  { id: 'teachers', name: 'Teachers' },
  { id: 'guardians', name: 'Guardians' },
];

export function AnnouncementsPage() {
  const { addToast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityChip, setPriorityChip] = useState('All');
  const [categoryChip, setCategoryChip] = useState('All categories');
  const [viewMode, setViewMode] = useState('grid');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [viewingNotice, setViewingNotice] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [noticeToDelete, setNoticeToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    severity: 'medium',
    targetAudience: ['all'],
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [errors, setErrors] = useState({});

  const debouncedSearch = useDebounce(searchInput, 400);
  const currentSearch = searchQuery !== '' ? searchQuery : debouncedSearch;

  const severityParam = priorityChip === 'All' ? undefined : priorityChip.toLowerCase();
  const categoryParam =
    categoryChip === 'All categories' || categoryChip === 'All'
      ? undefined
      : categoryChip.toLowerCase();

  const { data, isLoading, isError, error, refetch } = useAnnouncements({
    search: currentSearch,
    category: categoryParam,
    severity: severityParam,
  });

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const handleDeleteAnnouncement = async () => {
    if (!noticeToDelete) return;
    try {
      await deleteMutation.mutateAsync(noticeToDelete.id);
      addToast('Announcement deleted successfully.');
      setNoticeToDelete(null);
      if (viewingNotice?.id === noticeToDelete.id) {
        setViewingNotice(null);
      }
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to delete announcement', 'error');
    }
  };

  const rawList = data?.announcements || [];

  // Fallback client-side filter
  const announcements = rawList.filter((a) => {
    if (severityParam && a.rawSeverity !== severityParam) return false;
    if (categoryParam && a.rawCategory !== categoryParam) return false;
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const match =
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.details && a.details.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const count = data?.count ?? announcements.length;

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    refetch();
  };

  const openCreateModal = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      description: '',
      category: 'general',
      severity: 'medium',
      targetAudience: ['all'],
    });
    setUploadedFiles([]);
    setExistingAttachments([]);
    setErrors({});
    setIsFormModalOpen(true);
  };

  const openEditFromView = (notice) => {
    setViewingNotice(null);
    setEditingNotice(notice);
    setFormData({
      title: notice.title !== '—' ? notice.title : '',
      description: notice.description || (notice.details !== '—' ? notice.details : ''),
      category: notice.rawCategory || 'general',
      severity: notice.rawSeverity || 'medium',
      targetAudience: notice.targetAudience?.length ? notice.targetAudience : ['all'],
    });
    setUploadedFiles([]);
    setExistingAttachments(notice.attachments || []);
    setErrors({});
    setIsFormModalOpen(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadedFiles((prev) => [...prev, ...files]);
    if (e.target) e.target.value = '';
  };

  const removeUploadedFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (url) => {
    setExistingAttachments((prev) => prev.filter((u) => u !== url));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const formDataPayload = new FormData();
      formDataPayload.append('title', formData.title.trim());
      formDataPayload.append('description', formData.description.trim());
      formDataPayload.append('category', formData.category);
      formDataPayload.append('severity', formData.severity);
      (formData.targetAudience.length ? formData.targetAudience : ['all']).forEach((aud) => {
        formDataPayload.append('targetAudience', aud);
      });
      formDataPayload.append('existingAttachments', JSON.stringify(existingAttachments));

      uploadedFiles.forEach((file) => {
        formDataPayload.append('attachments', file);
      });

      if (editingNotice) {
        await updateMutation.mutateAsync({ id: editingNotice.id, data: formDataPayload });
        addToast('Announcement updated successfully.');
      } else {
        await createMutation.mutateAsync(formDataPayload);
        addToast('Announcement published successfully.');
      }
      setIsFormModalOpen(false);
    } catch (err) {
      addToast(err?.message || 'Failed to save announcement.', 'error');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="pt">
        <h2>Announcements</h2>
        <p>School notices relevant to your account</p>
      </div>

      <SearchBar
        placeholder="Search by title or details..."
        value={searchInput}
        onChange={(val) => {
          setSearchInput(val);
          setSearchQuery('');
        }}
        onSearch={handleSearchClick}
        actionText="New announcement"
        onAction={openCreateModal}
      />

      <Chips
        items={['All', 'High', 'Medium', 'Low']}
        activeItem={priorityChip}
        onSelect={setPriorityChip}
      />

      <Chips
        items={['All categories', 'General', 'Academic', 'Disciplinary', 'Other']}
        activeItem={categoryChip}
        onSelect={setCategoryChip}
      />

      <ViewToggle
        total={count}
        label="announcements"
        mode={viewMode}
        onChange={setViewMode}
      />

      {isLoading ? (
        <div className={'gr ' + (viewMode === 'list' ? 'ls' : '')}>
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px' }}>
          <b style={{ color: '#C23A52' }}>Failed to load announcements</b>
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
      ) : announcements.length === 0 ? (
        <EmptyState title="No announcements found" description="Try selecting another priority or category." />
      ) : (
        <div className={'gr ' + (viewMode === 'list' ? 'ls' : '')}>
          {announcements.map((a) => (
            <div key={a.id} className="cd">
              <div className="cd-top">
                <DateTile month={a.dateMonth || 'AUG'} day={a.dateDay || '1'} />
                <div className="cd-top-info">
                  <h3 className="cd-title" title={a.title}>{a.title}</h3>
                  <p className="cd-sub" title={a.audience}>
                    <Users size={13} strokeWidth={1.8} />
                    {a.audience || 'All Audiences'}
                  </p>
                </div>
                <Tag color={PRIORITY_COLOR[a.severity] || ''} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  {a.severity}
                </Tag>
              </div>

              <div className="cd-tags" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Tag icon={<TagIcon size={12} strokeWidth={1.8} style={{ marginRight: '4px' }} />}>
                  {a.category}
                </Tag>

                {a.attachments && a.attachments.length > 0 && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--p1)'
                    }}
                  >
                    <Paperclip size={12} />
                    {a.attachments.length} attachment{a.attachments.length === 1 ? '' : 's'}
                  </span>
                )}
              </div>

              <div className="cd-body" style={{ minHeight: '38px' }}>
                {a.details && a.details !== '—' ? (
                  a.details
                ) : (
                  <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No additional details provided.</span>
                )}
              </div>

              <div className="cd-footer">
                <span className="cd-meta">
                  <Calendar size={13} strokeWidth={1.8} />
                  <span>{a.postedDate}</span>
                </span>
                <div className="cd-actions">
                  <button
                    type="button"
                    className="cd-btn-delete"
                    onClick={() => setNoticeToDelete(a)}
                    title="Delete Announcement"
                    aria-label={`Delete ${a.title}`}
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    className="cd-btn-view"
                    onClick={() => setViewingNotice(a)}
                  >
                    View Notice
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Notice Modal */}
      {viewingNotice && (
        <Modal
          isOpen={Boolean(viewingNotice)}
          onClose={() => setViewingNotice(null)}
          title={viewingNotice.title}
          subtitle={`${viewingNotice.category} Notice · ${viewingNotice.postedDate}`}
          width={600}
        >
          <div style={{ display: 'grid', gap: '16px' }}>
            <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
              <Tag color={PRIORITY_COLOR[viewingNotice.severity] || ''}>
                {viewingNotice.severity} Priority
              </Tag>
              <Tag>{viewingNotice.category}</Tag>
              <Tag>Audience: {viewingNotice.audience}</Tag>
            </div>

            <div
              className="cd"
              style={{
                background: 'var(--bg)',
                padding: '16px',
                borderRadius: '16px',
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {viewingNotice.details}
            </div>

            {/* Attachments Section */}
            {viewingNotice.attachments && viewingNotice.attachments.length > 0 && (
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Paperclip size={13} />
                  Attachments ({viewingNotice.attachments.length})
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {viewingNotice.attachments.map((url, i) => {
                    const isImg = url.match(/\.(jpeg|jpg|png|webp|gif)($|\?)/i) || url.includes('/image/upload/');
                    let name = url.split('/').pop() || 'Attachment';
                    try { name = decodeURIComponent(name); } catch {}

                    return (
                      <div
                        key={i}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--line)',
                          background: 'var(--soft, rgba(0,0,0,0.03))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          {isImg ? <ImageIcon size={16} style={{ color: 'var(--p1)', flexShrink: 0 }} /> : <FileText size={16} style={{ color: 'var(--p1)', flexShrink: 0 }} />}
                          <span style={{ fontSize: '12.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {name}
                          </span>
                        </div>

                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'var(--p1)',
                            textDecoration: 'none',
                            flexShrink: 0
                          }}
                        >
                          <ExternalLink size={13} />
                          <span>Open</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="row" style={{ justifyContent: 'space-between', marginTop: '8px' }}>
              <button
                type="button"
                className="ghost"
                style={{ margin: 0, color: '#C23A52', borderColor: 'rgba(194, 58, 82, 0.3)' }}
                onClick={() => setNoticeToDelete(viewingNotice)}
              >
                <Trash2 size={15} strokeWidth={1.8} /> Delete Notice
              </button>
              <span style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="ghost"
                  style={{ margin: 0 }}
                  onClick={() => setViewingNotice(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="pb"
                  onClick={() => openEditFromView(viewingNotice)}
                >
                  <Edit3 size={15} strokeWidth={1.8} /> Edit Notice
                </button>
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Create / Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingNotice ? 'Edit Announcement' : 'New Announcement'}
        subtitle={editingNotice ? 'Update notice details.' : 'Publish a notice to the school community.'}
        width={580}
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: '14px' }}>
          <div>
            <FormField
              label="TITLE *"
              placeholder="Announcement title"
              value={formData.title}
              maxLength={50}
              onChange={(v) => {
                setFormData((p) => ({ ...p, title: v }));
                setErrors((e) => ({ ...e, title: undefined }));
              }}
            />
            <FieldError error={errors.title} />
          </div>

          <div className="row">
            <div style={{ flex: 1 }}>
              <FormField
                label="CATEGORY"
                as="select"
                options={CATEGORIES.map((c) => ({
                  value: c,
                  label: c.charAt(0).toUpperCase() + c.slice(1),
                }))}
                value={formData.category}
                onChange={(v) => setFormData((p) => ({ ...p, category: v }))}
              />
            </div>
            <div style={{ flex: 1 }}>
              <OptionGroup
                label="SEVERITY"
                options={['Low', 'Medium', 'High']}
                value={formData.severity.charAt(0).toUpperCase() + formData.severity.slice(1)}
                onChange={(v) => setFormData((p) => ({ ...p, severity: v.toLowerCase() }))}
              />
            </div>
          </div>

          <div>
            <MultiSelectChips
              label="TARGET AUDIENCE"
              options={AUDIENCES}
              selected={formData.targetAudience}
              onChange={(val) => setFormData((p) => ({ ...p, targetAudience: val }))}
            />
          </div>

          <FormField
            label="DETAILS"
            as="textarea"
            placeholder="Write the full notice details..."
            value={formData.description}
            maxLength={1000}
            onChange={(v) => setFormData((p) => ({ ...p, description: v }))}
          />

          {/* Attachments Section */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Attachments (Images, PDF, Documents)
            </label>

            {/* Existing attachments */}
            {existingAttachments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--mute)' }}>Existing Attachments:</span>
                {existingAttachments.map((url, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'var(--soft, rgba(0,0,0,0.03))',
                      border: '1px solid var(--line)',
                      fontSize: '12px'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>
                      {url.split('/').pop()}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExistingAttachment(url)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#C23A52', padding: '2px' }}
                      title="Remove attachment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded new files */}
            {uploadedFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--mute)' }}>New Files to Upload:</span>
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'rgba(30,111,120,.08)',
                      border: '1px solid var(--p1)',
                      fontSize: '12px'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeUploadedFile(idx)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#C23A52', padding: '2px' }}
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File input box */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'var(--soft, rgba(0,0,0,0.02))',
                border: '1px dashed var(--line)'
              }}
            >
              <UploadCloud size={20} style={{ color: 'var(--p1)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '12.5px', fontWeight: 600 }}>
                  Upload image or PDF attachments
                </span>
                <span style={{ fontSize: '11px', color: 'var(--mute)' }}>
                  PNG, JPG, PDF, Word, PowerPoint up to 10MB
                </span>
              </div>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp"
                onChange={handleFileSelect}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          <div className="row" style={{ justifyContent: 'space-between', marginTop: '10px' }}>
            <button
              type="button"
              className="ghost"
              style={{ margin: 0 }}
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="pb" disabled={isPending}>
              {isPending ? 'Publishing...' : editingNotice ? 'Save Changes' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(noticeToDelete)}
        onClose={() => setNoticeToDelete(null)}
        onConfirm={handleDeleteAnnouncement}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${noticeToDelete?.title}"? This notice will be removed for all audiences.`}
        confirmText="Delete Announcement"
        confirmColor="#C23A52"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
