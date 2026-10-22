import React, { useState, useEffect } from 'react';
import {
  Modal,
  FormField,
  OptionGroup,
  MultiSelectChips,
  FieldError,
  useToast,
} from '../../components/ui';
import { useCreateCourse, useUpdateCourse, useClasses, useTeachers } from '../../hooks/queries';

export function CourseModal({ isOpen, onClose, initialData = null }) {
  const isEdit = Boolean(initialData?.id);
  const { addToast } = useToast();
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();

  const { data: classesData } = useClasses();
  const classesList = classesData?.classes || [];

  const { data: teachersData } = useTeachers();
  const teachersList = teachersData?.teachers || [];

  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    courseDescription: '',
    courseType: 'Core',
    courseStatus: 'Active',
    courseClass: '',
    courseTeachers: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        courseName: initialData.name !== '—' ? initialData.name : '',
        courseCode: initialData.code !== '—' ? initialData.code : '',
        courseDescription: initialData.description !== '—' ? initialData.description : '',
        courseType: initialData.type || 'Core',
        courseStatus: initialData.status || 'Active',
        courseClass: initialData.classId || (classesList[0]?.id || ''),
        courseTeachers: initialData.teacherIds || [],
      });
    } else {
      setFormData({
        courseName: '',
        courseCode: '',
        courseDescription: '',
        courseType: 'Core',
        courseStatus: 'Active',
        courseClass: classesList[0]?.id || '',
        courseTeachers: [],
      });
    }
    setErrors({});
  }, [initialData, isOpen, classesList.length]);

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
    if (!formData.courseName.trim()) errs.courseName = 'Course name is required';
    if (!formData.courseCode.trim()) errs.courseCode = 'Course code is required';
    if (!formData.courseClass) errs.courseClass = 'Please select a class cohort';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const payload = {
        courseName: formData.courseName.trim(),
        courseCode: formData.courseCode.trim(),
        courseDescription: formData.courseDescription.trim(),
        courseType: formData.courseType,
        courseStatus: formData.courseStatus,
        courseClass: formData.courseClass,
        courseTeachers: formData.courseTeachers,
      };

      if (isEdit) {
        await updateCourseMutation.mutateAsync({ id: initialData.id, data: payload });
        addToast('Course updated successfully.');
      } else {
        await createCourseMutation.mutateAsync(payload);
        addToast('Course created successfully.');
      }
      onClose();
    } catch (err) {
      addToast(err?.message || 'Failed to save course.', 'error');
    }
  };

  const isPending = createCourseMutation.isPending || updateCourseMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Course' : 'Add Course'}
      subtitle="Configure curriculum details, type, status, and assigned teachers."
      width={560}
    >
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
        <div className="row">
          <div style={{ flex: 2 }}>
            <FormField
              label="COURSE NAME *"
              placeholder="e.g. Integrated Science"
              value={formData.courseName}
              onChange={(v) => updateField('courseName', v)}
            />
            <FieldError error={errors.courseName} />
          </div>
          <div style={{ flex: 1 }}>
            <FormField
              label="CODE *"
              placeholder="e.g. SCI101"
              value={formData.courseCode}
              onChange={(v) => updateField('courseCode', v)}
            />
            <FieldError error={errors.courseCode} />
          </div>
        </div>

        <div className="row">
          <div style={{ flex: 1 }}>
            <OptionGroup
              label="COURSE TYPE"
              options={['Core', 'Elective']}
              value={formData.courseType}
              onChange={(v) => updateField('courseType', v)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <OptionGroup
              label="STATUS"
              options={['Active', 'Inactive']}
              value={formData.courseStatus}
              onChange={(v) => updateField('courseStatus', v)}
            />
          </div>
        </div>

        <div>
          <FormField
            label="CLASS SECTION *"
            as="select"
            options={classesList.map((c) => ({
              label: `${c.name || c.className} (${c.code || c.classCode || ''})`,
              value: c.id,
            }))}
            value={formData.courseClass}
            onChange={(v) => updateField('courseClass', v)}
          />
          <FieldError error={errors.courseClass} />
        </div>

        <div>
          <MultiSelectChips
            label="ASSIGN TEACHERS"
            options={teachersList.map((t) => ({
              id: t.id,
              name: t.name,
            }))}
            selected={formData.courseTeachers}
            onChange={(val) => updateField('courseTeachers', val)}
          />
        </div>

        <div>
          <FormField
            label="DESCRIPTION"
            as="textarea"
            placeholder="Course overview, syllabus objectives, and targets..."
            value={formData.courseDescription}
            onChange={(v) => updateField('courseDescription', v)}
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
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Course'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
