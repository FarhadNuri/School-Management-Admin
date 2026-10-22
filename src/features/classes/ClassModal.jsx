import React, { useState, useEffect } from 'react';
import {
  Modal,
  FormField,
  MultiSelectChips,
  FileInput,
  FieldError,
  useToast,
} from '../../components/ui';
import { useCreateClass, useUpdateClass, useTeachers, useCourses } from '../../hooks/queries';

export function ClassModal({ isOpen, onClose, initialData = null }) {
  const isEdit = Boolean(initialData?.id);
  const { addToast } = useToast();
  const createClassMutation = useCreateClass();
  const updateClassMutation = useUpdateClass();

  const { data: teachersData } = useTeachers();
  const teachersList = teachersData?.teachers || [];

  const { data: coursesData } = useCourses();
  const coursesList = coursesData?.courses || [];

  const [formData, setFormData] = useState({
    className: '',
    classCode: '',
    grade: '',
    academicYear: '2025/2026',
    capacity: '30',
    description: '',
    teachers: [],
    courses: [],
  });

  const [coverImage, setCoverImage] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const raw = initialData.rawClass || {};
      const teacherIds = (raw.teachers || []).map((t) => String(t._id || t.id || t));
      const courseIds = (raw.courses || []).map((c) => String(c._id || c.id || c));

      setFormData({
        className: initialData.className !== '—' ? initialData.className : '',
        classCode: initialData.classCode !== '—' ? initialData.classCode : '',
        grade: initialData.grade !== '—' ? initialData.grade : '',
        academicYear: initialData.rawAcademicYear || '2025/2026',
        capacity: initialData.capacity !== '—' ? String(initialData.capacity) : '30',
        description: initialData.description !== '—' ? initialData.description : '',
        teachers: teacherIds,
        courses: courseIds,
      });
    } else {
      setFormData({
        className: '',
        classCode: '',
        grade: '',
        academicYear: '2025/2026',
        capacity: '30',
        description: '',
        teachers: [],
        courses: [],
      });
    }
    setCoverImage(null);
    setErrors({});
  }, [initialData, isOpen]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.className.trim()) errs.className = 'Class name is required';
    if (!formData.classCode.trim()) errs.classCode = 'Class code is required';
    if (!formData.grade.toString().trim()) errs.grade = 'Grade is required';
    if (!formData.academicYear.trim()) errs.academicYear = 'Academic year is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const payload = {
        className: formData.className.trim(),
        classCode: formData.classCode.trim(),
        grade: Number(formData.grade),
        academicYear: formData.academicYear.trim(),
        capacity: formData.capacity ? Number(formData.capacity) : 30,
        description: formData.description.trim(),
        teachers: formData.teachers,
        courses: formData.courses,
      };

      if (coverImage) {
        payload.coverImage = coverImage;
      }

      if (isEdit) {
        await updateClassMutation.mutateAsync({ id: initialData.id, data: payload });
        addToast('Class updated successfully.');
      } else {
        await createClassMutation.mutateAsync(payload);
        addToast('Class created successfully.');
      }
      onClose();
    } catch (err) {
      addToast(err?.message || 'Failed to save class section.', 'error');
    }
  };

  const isPending = createClassMutation.isPending || updateClassMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Class' : 'Add Class'}
      subtitle="Configure class section details, assigned teachers, and courses."
      width={600}
    >
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
        <div>
          <FileInput
            label="COVER IMAGE"
            file={coverImage}
            existingUrl={initialData?.coverImage}
            onChange={setCoverImage}
            onClear={() => setCoverImage(null)}
          />
        </div>

        <div className="row">
          <div style={{ flex: 2 }}>
            <FormField
              label="CLASS NAME *"
              placeholder="e.g. Grade 7A"
              value={formData.className}
              onChange={(v) => updateField('className', v)}
            />
            <FieldError error={errors.className} />
          </div>
          <div style={{ flex: 1 }}>
            <FormField
              label="CODE *"
              placeholder="e.g. G7A"
              value={formData.classCode}
              onChange={(v) => updateField('classCode', v)}
            />
            <FieldError error={errors.classCode} />
          </div>
        </div>

        <div className="row">
          <div style={{ flex: 1 }}>
            <FormField
              label="GRADE (NUMBER) *"
              type="number"
              placeholder="e.g. 7"
              value={formData.grade}
              onChange={(v) => updateField('grade', v)}
            />
            <FieldError error={errors.grade} />
          </div>
          <div style={{ flex: 1 }}>
            <FormField
              label="ACADEMIC YEAR *"
              placeholder="e.g. 2025/2026"
              value={formData.academicYear}
              onChange={(v) => updateField('academicYear', v)}
            />
            <FieldError error={errors.academicYear} />
          </div>
          <div style={{ flex: 1 }}>
            <FormField
              label="CAPACITY"
              type="number"
              placeholder="e.g. 35"
              value={formData.capacity}
              onChange={(v) => updateField('capacity', v)}
            />
          </div>
        </div>

        <div>
          <FormField
            label="DESCRIPTION"
            as="textarea"
            placeholder="Class section overview..."
            value={formData.description}
            onChange={(v) => updateField('description', v)}
          />
        </div>

        <div>
          <MultiSelectChips
            label="ASSIGN TEACHERS"
            options={teachersList.map((t) => ({
              id: t.id,
              name: t.name,
            }))}
            selected={formData.teachers}
            onChange={(val) => updateField('teachers', val)}
          />
        </div>

        <div>
          <MultiSelectChips
            label="ASSIGN COURSES"
            options={coursesList.map((c) => ({
              id: c.id,
              name: `${c.name || c.courseName} (${c.code || c.courseCode})`,
            }))}
            selected={formData.courses}
            onChange={(val) => updateField('courses', val)}
          />
        </div>

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
            disabled={isPending}
          >
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Class'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
