import React, { useState } from 'react';
import { Tag as TagIcon, RotateCcw, Edit3 } from 'lucide-react';
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
  useToast,
} from '../../components/ui';
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    severity: 'medium',
    targetAudience: ['all'],
  });
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
    setErrors({});
    setIsFormModalOpen(true);
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
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        severity: formData.severity,
        targetAudience: formData.targetAudience.length ? formData.targetAudience : ['all'],
      };

      if (editingNotice) {
        await updateMutation.mutateAsync({ id: editingNotice.id, data: payload });
        addToast('Announcement updated successfully.');
      } else {
        await createMutation.mutateAsync(payload);
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
        <div className={`gr ${viewMode === 'list' ? 'ls' : ''}`}>
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
        <div className={`gr ${viewMode === 'list' ? 'ls' : ''}`}>
          {announcements.map((a) => (
            <div key={a.id} className="cd">
              <div className="row">
                <DateTile month={a.dateMonth || 'AUG'} day={a.dateDay || '1'} />
                <div>
                  <h3>{a.title}</h3>
                  <p>{a.audience}</p>
                </div>
              </div>

              <div className="row" style={{ flexWrap: 'wrap' }}>
                <Tag color={PRIORITY_COLOR[a.severity] || ''}>{a.severity}</Tag>
                <Tag icon={<TagIcon size={12} strokeWidth={1.8} style={{ marginRight: '4px' }} />}>
                  {a.category}
                </Tag>
              </div>

              <p>{a.details}</p>

              <div className="row">
                <span style={{ color: 'var(--mute)', fontSize: '12px' }}>
                  {a.postedDate}
                </span>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="ghost"
                    style={{ margin: 0 }}
                    onClick={() => setViewingNotice(a)}
                  >
                    View Notice
                  </button>
                </span>
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
          width={560}
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
              }}
            >
              {viewingNotice.details}
            </div>

            <div className="row" style={{ justifyContent: 'space-between', marginTop: '8px' }}>
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
        width={560}
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: '14px' }}>
          <div>
            <FormField
              label="TITLE *"
              placeholder="Announcement title"
              value={formData.title}
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
            onChange={(v) => setFormData((p) => ({ ...p, description: v }))}
          />

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
    </div>
  );
}
