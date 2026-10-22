import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  WizardModal,
  FormField,
  OptionGroup,
  MultiSelectChips,
  FileInput,
  FieldError,
  useToast,
} from '../../components/ui';
import { useCreateTeacher, useUpdateTeacher, useClasses } from '../../hooks/queries';

const STEPS = ['IDENTITY', 'CREDENTIALS', 'ID DOCS', 'CONTACT', 'CLASSES', 'ADDRESS'];

const ID_TYPES = [
  'Passport',
  'National ID Card',
  'Driver License',
  'Social Security',
  'Voter ID',
];

export function EnrollTeacherWizard({ isOpen, onClose, initialData = null }) {
  const isEdit = Boolean(initialData?.id);
  const { addToast } = useToast();
  const createTeacherMutation = useCreateTeacher();
  const updateTeacherMutation = useUpdateTeacher();

  const { data: classesData } = useClasses();
  const classesList = classesData?.classes || [];

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: 'female',
    status: 'Active',
    identificationType: 'Passport',
    phone: '',
    altPhone: '',
    whatsapp: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    website: '',
    classes: [],
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'Ghana',
  });

  const [qualificationTitles, setQualificationTitles] = useState(['']);

  const [files, setFiles] = useState({
    picture: null,
    qualification0: null,
    qualification1: null,
    qualification2: null,
    idFront: null,
    idBack: null,
  });

  useEffect(() => {
    if (initialData) {
      const raw = initialData.rawTeacher || {};
      const u = raw.user || {};

      setForm({
        firstName: u.firstName || initialData.firstName || '',
        lastName: u.lastName || initialData.lastName || '',
        email: u.email || initialData.email || '',
        dateOfBirth: initialData.dateOfBirth || '',
        gender: initialData.rawGender || 'female',
        status: initialData.status || 'Active',
        identificationType: initialData.idType !== '—' ? initialData.idType : 'Passport',
        phone: initialData.phone !== '—' ? initialData.phone : '',
        altPhone: initialData.altPhone !== '—' ? initialData.altPhone : '',
        whatsapp: initialData.whatsapp !== '—' ? initialData.whatsapp : '',
        linkedin: initialData.socialMedia?.linkedin || '',
        twitter: initialData.socialMedia?.twitter || '',
        facebook: initialData.socialMedia?.facebook || '',
        website: initialData.socialMedia?.website || '',
        classes: initialData.assignedClassIds || [],
        street: initialData.street !== '—' ? initialData.street : '',
        city: u.address?.city || '',
        region: initialData.state !== '—' ? initialData.state : '',
        postalCode: u.address?.zip || '',
        country: initialData.country !== '—' ? initialData.country : 'Ghana',
      });

      const titles = (initialData.qualificationTitles && initialData.qualificationTitles.length > 0)
        ? initialData.qualificationTitles
        : [initialData.qualification !== '—' ? initialData.qualification : ''];
      setQualificationTitles(titles.slice(0, 3));
    } else {
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        gender: 'female',
        status: 'Active',
        identificationType: 'Passport',
        phone: '',
        altPhone: '',
        whatsapp: '',
        linkedin: '',
        twitter: '',
        facebook: '',
        website: '',
        classes: [],
        street: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'Ghana',
      });
      setQualificationTitles(['']);
    }

    setFiles({
      picture: null,
      qualification0: null,
      qualification1: null,
      qualification2: null,
      idFront: null,
      idBack: null,
    });
    setErrors({});
    setCurrentStep(0);
  }, [initialData, isOpen]);

  const updateField = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const updateFile = (field, file) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleTitleChange = (index, value) => {
    const updated = [...qualificationTitles];
    updated[index] = value;
    setQualificationTitles(updated);
    if (errors[`qualificationTitle_${index}`]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[`qualificationTitle_${index}`];
        return copy;
      });
    }
  };

  const addQualification = () => {
    if (qualificationTitles.length < 3) {
      setQualificationTitles([...qualificationTitles, '']);
    }
  };

  const removeQualification = (index) => {
    if (qualificationTitles.length > 1) {
      const updatedTitles = qualificationTitles.filter((_, i) => i !== index);
      setQualificationTitles(updatedTitles);
      // clean up associated file
      const updatedFiles = { ...files };
      delete updatedFiles[`qualification${index}`];
      setFiles(updatedFiles);
    }
  };

  const validateStep = (step) => {
    const errs = {};

    if (step === 0) {
      if (!isEdit && !files.picture) errs.picture = 'Profile photo is required';
      if (!form.firstName.trim()) errs.firstName = 'First name is required';
      if (!form.lastName.trim()) errs.lastName = 'Last name is required';
      if (!form.email.trim()) {
        errs.email = 'Email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        errs.email = 'Valid email is required';
      }
      if (!form.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    } else if (step === 1) {
      qualificationTitles.forEach((title, idx) => {
        if (!title.trim()) {
          errs[`qualificationTitle_${idx}`] = 'Qualification title is required';
        }
      });
    } else if (step === 2) {
      if (!form.identificationType) errs.identificationType = 'ID type is required';
      if (!isEdit && !files.idFront) {
        errs.idFront = 'ID document front/scan is required';
      }
      if (!isEdit && form.identificationType !== 'Passport' && !files.idBack) {
        errs.idBack = 'ID back document is required';
      }
    } else if (step === 3) {
      if (!form.phone.trim()) {
        errs.phone = 'Phone number is required';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Submit payload
    try {
      const cleanedTitles = qualificationTitles.filter(Boolean);
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender.toLowerCase(),
        status: form.status,
        identificationType: form.identificationType,
        qualificationTitles: cleanedTitles,
        classes: form.classes,
        contactInfo: {
          phone: form.phone.trim(),
          altPhone: form.altPhone.trim(),
          whatsapp: form.whatsapp.trim(),
        },
        socialMedia: {
          linkedin: form.linkedin.trim(),
          twitter: form.twitter.trim(),
          facebook: form.facebook.trim(),
          website: form.website.trim(),
        },
        address: {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.region.trim(),
          zip: form.postalCode.trim(),
          country: form.country.trim(),
        },
      };

      if (files.picture) payload.picture = files.picture;
      if (files.idFront) payload.idFront = files.idFront;
      if (files.idBack) payload.idBack = files.idBack;
      if (files.qualification0) payload.qualification0 = files.qualification0;
      if (files.qualification1) payload.qualification1 = files.qualification1;
      if (files.qualification2) payload.qualification2 = files.qualification2;

      if (isEdit) {
        await updateTeacherMutation.mutateAsync({ id: initialData.id, data: payload });
        addToast('Teacher record updated successfully.');
      } else {
        await createTeacherMutation.mutateAsync(payload);
        addToast('Teacher enrolled successfully.');
      }

      onClose();
      setCurrentStep(0);
    } catch (err) {
      console.error('Enroll teacher failed:', err);
      const msg = err?.message || err?.error || 'Failed to save teacher record';
      addToast(msg, 'error');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const isPending = createTeacherMutation.isPending || updateTeacherMutation.isPending;

  return (
    <WizardModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setCurrentStep(0);
      }}
      title={isEdit ? 'Edit Teacher' : 'Enroll Teacher'}
      subtitle="A guided enrollment flow for a polished new staff record."
      steps={STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={handleBack}
      submitLabel={isPending ? (isEdit ? 'Saving...' : 'Enrolling...') : isEdit ? 'Save Changes' : 'Enroll Teacher'}
      isLastStep={currentStep === STEPS.length - 1}
      isSubmitDisabled={isPending}
    >
      {/* STEP 0: IDENTITY */}
      {currentStep === 0 && (
        <>
          <div>
            <FileInput
              label="PROFILE PHOTO *"
              file={files.picture}
              existingUrl={initialData?.photo}
              onChange={(f) => updateFile('picture', f)}
              onClear={() => updateFile('picture', null)}
            />
            <FieldError error={errors.picture} />
          </div>

          <div className="row">
            <div style={{ flex: 1 }}>
              <FormField
                label="FIRST NAME *"
                placeholder="e.g. Daniel"
                value={form.firstName}
                onChange={(v) => updateField('firstName', v)}
              />
              <FieldError error={errors.firstName} />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                label="LAST NAME *"
                placeholder="e.g. Mutebi"
                value={form.lastName}
                onChange={(v) => updateField('lastName', v)}
              />
              <FieldError error={errors.lastName} />
            </div>
          </div>

          <div>
            <FormField
              label="EMAIL *"
              type="email"
              placeholder="teacher@school.edu"
              value={form.email}
              onChange={(v) => updateField('email', v)}
            />
            <FieldError error={errors.email} />
          </div>

          <div className="row">
            <div style={{ flex: 1 }}>
              <FormField
                label="DATE OF BIRTH *"
                type="date"
                value={form.dateOfBirth}
                onChange={(v) => updateField('dateOfBirth', v)}
              />
              <FieldError error={errors.dateOfBirth} />
            </div>
            <div style={{ flex: 1 }}>
              <OptionGroup
                label="GENDER *"
                options={['Female', 'Male', 'Other']}
                value={form.gender.charAt(0).toUpperCase() + form.gender.slice(1)}
                onChange={(v) => updateField('gender', v.toLowerCase())}
              />
            </div>
          </div>

          {!isEdit && (
            <OptionGroup
              label="STATUS"
              options={['Active', 'Inactive']}
              value={form.status}
              onChange={(v) => updateField('status', v)}
            />
          )}
        </>
      )}

      {/* STEP 1: CREDENTIALS */}
      {currentStep === 1 && (
        <div style={{ display: 'grid', gap: '14px' }}>
          <p style={{ fontSize: '13px', color: 'var(--mute)', margin: 0 }}>
            Add up to 3 qualification titles and upload certificates for each title.
          </p>

          {qualificationTitles.map((title, idx) => (
            <div
              key={idx}
              className="cd"
              style={{ padding: '16px', background: 'var(--bg)', borderRadius: '16px', gap: '10px' }}
            >
              <div className="row" style={{ alignItems: 'center' }}>
                <b style={{ fontSize: '13px' }}>Qualification #{idx + 1}</b>
                {qualificationTitles.length > 1 && (
                  <button
                    type="button"
                    className="ghost"
                    style={{ margin: '0 0 0 auto', padding: '4px 8px', color: '#C23A52' }}
                    onClick={() => removeQualification(idx)}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>

              <div>
                <FormField
                  label={`QUALIFICATION TITLE #${idx + 1} *`}
                  placeholder="e.g. B.Sc Biology or M.Ed Curriculum"
                  value={title}
                  onChange={(v) => handleTitleChange(idx, v)}
                />
                <FieldError error={errors[`qualificationTitle_${idx}`]} />
              </div>

              <div>
                <FileInput
                  label={`CERTIFICATE #${idx + 1} (PDF or Image)`}
                  file={files[`qualification${idx}`]}
                  existingUrl={initialData?.qualifications?.[idx]}
                  onChange={(f) => updateFile(`qualification${idx}`, f)}
                  onClear={() => updateFile(`qualification${idx}`, null)}
                />
              </div>
            </div>
          ))}

          {qualificationTitles.length < 3 && (
            <button
              type="button"
              className="ghost"
              style={{ width: 'fit-content' }}
              onClick={addQualification}
            >
              <Plus size={15} strokeWidth={1.8} /> Add another qualification
            </button>
          )}
        </div>
      )}

      {/* STEP 2: ID DOCS */}
      {currentStep === 2 && (
        <>
          <div>
            <FormField
              label="IDENTIFICATION TYPE *"
              as="select"
              options={ID_TYPES}
              value={form.identificationType}
              onChange={(v) => updateField('identificationType', v)}
            />
            <FieldError error={errors.identificationType} />
          </div>

          <div className="row" style={{ gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <FileInput
                label={form.identificationType === 'Passport' ? 'PASSPORT PAGE *' : 'ID FRONT *'}
                file={files.idFront}
                existingUrl={initialData?.idFront}
                onChange={(f) => updateFile('idFront', f)}
                onClear={() => updateFile('idFront', null)}
              />
              <FieldError error={errors.idFront} />
            </div>

            {form.identificationType !== 'Passport' && (
              <div style={{ flex: 1 }}>
                <FileInput
                  label="ID BACK *"
                  file={files.idBack}
                  existingUrl={initialData?.idBack}
                  onChange={(f) => updateFile('idBack', f)}
                  onClear={() => updateFile('idBack', null)}
                />
                <FieldError error={errors.idBack} />
              </div>
            )}
          </div>
        </>
      )}

      {/* STEP 3: CONTACT */}
      {currentStep === 3 && (
        <>
          <div className="row">
            <div style={{ flex: 1 }}>
              <FormField
                label="PHONE *"
                placeholder="+233 ..."
                value={form.phone}
                onChange={(v) => updateField('phone', v)}
              />
              <FieldError error={errors.phone} />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                label="ALT. PHONE"
                placeholder="+233 ..."
                value={form.altPhone}
                onChange={(v) => updateField('altPhone', v)}
              />
            </div>
          </div>

          <FormField
            label="WHATSAPP"
            placeholder="+233 ..."
            value={form.whatsapp}
            onChange={(v) => updateField('whatsapp', v)}
          />

          <div style={{ marginTop: '8px' }}>
            <small style={{ color: 'var(--mute)', fontWeight: 600 }}>SOCIAL MEDIA (OPTIONAL)</small>
          </div>

          <div className="row">
            <FormField
              label="LINKEDIN"
              placeholder="https://linkedin.com/in/..."
              value={form.linkedin}
              onChange={(v) => updateField('linkedin', v)}
              style={{ flex: 1 }}
            />
            <FormField
              label="TWITTER / X"
              placeholder="https://x.com/..."
              value={form.twitter}
              onChange={(v) => updateField('twitter', v)}
              style={{ flex: 1 }}
            />
          </div>

          <div className="row">
            <FormField
              label="FACEBOOK"
              placeholder="https://facebook.com/..."
              value={form.facebook}
              onChange={(v) => updateField('facebook', v)}
              style={{ flex: 1 }}
            />
            <FormField
              label="WEBSITE"
              placeholder="https://..."
              value={form.website}
              onChange={(v) => updateField('website', v)}
              style={{ flex: 1 }}
            />
          </div>
        </>
      )}

      {/* STEP 4: CLASSES */}
      {currentStep === 4 && (
        <div>
          <MultiSelectChips
            label="ASSIGN CLASSES (CHOOSE ALL THAT APPLY)"
            options={classesList.map((c) => ({
              id: c.id,
              name: `${c.name || c.className} (${c.code || c.classCode || 'Class'})`,
            }))}
            selected={form.classes}
            onChange={(val) => updateField('classes', val)}
          />
        </div>
      )}

      {/* STEP 5: ADDRESS */}
      {currentStep === 5 && (
        <>
          <FormField
            label="STREET ADDRESS"
            placeholder="e.g. 14 Independence Ave"
            value={form.street}
            onChange={(v) => updateField('street', v)}
          />
          <div className="row">
            <FormField
              label="CITY"
              placeholder="e.g. Accra"
              value={form.city}
              onChange={(v) => updateField('city', v)}
              style={{ flex: 1 }}
            />
            <FormField
              label="REGION / STATE"
              placeholder="e.g. Greater Accra"
              value={form.region}
              onChange={(v) => updateField('region', v)}
              style={{ flex: 1 }}
            />
          </div>
          <div className="row">
            <FormField
              label="POSTAL CODE"
              placeholder="e.g. GA-183-9322"
              value={form.postalCode}
              onChange={(v) => updateField('postalCode', v)}
              style={{ flex: 1 }}
            />
            <FormField
              label="COUNTRY"
              placeholder="e.g. Ghana"
              value={form.country}
              onChange={(v) => updateField('country', v)}
              style={{ flex: 1 }}
            />
          </div>
        </>
      )}
    </WizardModal>
  );
}
