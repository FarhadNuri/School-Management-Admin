import React, { useState, useEffect } from 'react';
import {
  WizardModal,
  FormField,
  OptionGroup,
  CheckboxCard,
  FileInput,
  FieldError,
  useToast,
} from '../../components/ui';
import { useCreateStudent, useUpdateStudent, useClasses, useGuardians } from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';

const STEPS = ['IDENTITY', 'SCHOOL', 'CONTACT', 'FAMILY', 'ADDRESS'];

const ID_TYPES_LIST = [
  'National ID Card',
  'Passport',
  'Birth Certificate',
  'Student ID',
  'Driver License',
  'Voter ID',
];

export function EnrollStudentWizard({ isOpen, onClose, initialData = null }) {
  const isEdit = Boolean(initialData?.id);
  const { addToast } = useToast();
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();

  const { data: classesData } = useClasses();
  const classesList = classesData?.classes || [];

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});

  // Guardian search state
  const [guardianSearch, setGuardianSearch] = useState('');
  const debouncedGuardianSearch = useDebounce(guardianSearch, 400);
  const { data: guardianSearchResults } = useGuardians({ search: debouncedGuardianSearch });
  const [isGuardianSelected, setIsGuardianSelected] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: 'female',
    emergencyContact: '',
    classId: '',
    idType: 'Passport',
    phone: '',
    altPhone: '',
    whatsapp: '',
    guardianFullName: '',
    guardianEmail: '',
    guardianPhone: '',
    guardianIdType: 'Passport',
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'Ghana',
    sameAsStudentAddress: true,
    guardianStreet: '',
    guardianCity: '',
    guardianRegion: '',
    guardianPostalCode: '',
    guardianCountry: 'Ghana',
  });

  const [files, setFiles] = useState({
    photo: null,
    idFront: null,
    idBack: null,
    guardianPhoto: null,
    guardianIdFront: null,
    guardianIdBack: null,
  });

  useEffect(() => {
    if (initialData) {
      const raw = initialData.rawStudent || {};
      const u = raw.user || {};
      const g = raw.guardian || {};
      const gu = g.user || {};

      setForm({
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.email || '',
        dateOfBirth: u.dateOfBirth ? String(u.dateOfBirth).slice(0, 10) : '',
        gender: u.gender || 'female',
        emergencyContact: raw.emergencyContact || '',
        classId: raw.class?._id || raw.class || '',
        idType: raw.idType || 'Passport',
        phone: u.contactInfo?.phone || '',
        altPhone: u.contactInfo?.altPhone || '',
        whatsapp: u.contactInfo?.whatsapp || '',
        guardianFullName: `${gu.firstName || ''} ${gu.lastName || ''}`.trim(),
        guardianEmail: gu.email || '',
        guardianPhone: gu.contactInfo?.phone || '',
        guardianIdType: g.idType || 'Passport',
        street: u.address?.street || '',
        city: u.address?.city || '',
        region: u.address?.state || '',
        postalCode: u.address?.zip || '',
        country: u.address?.country || 'Ghana',
        sameAsStudentAddress: true,
        guardianStreet: gu.address?.street || '',
        guardianCity: gu.address?.city || '',
        guardianRegion: gu.address?.state || '',
        guardianPostalCode: gu.address?.zip || '',
        guardianCountry: gu.address?.country || 'Ghana',
      });
      setIsGuardianSelected(true);
    } else {
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        gender: 'female',
        emergencyContact: '',
        classId: '',
        idType: 'Passport',
        phone: '',
        altPhone: '',
        whatsapp: '',
        guardianFullName: '',
        guardianEmail: '',
        guardianPhone: '',
        guardianIdType: 'Passport',
        street: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'Ghana',
        sameAsStudentAddress: true,
        guardianStreet: '',
        guardianCity: '',
        guardianRegion: '',
        guardianPostalCode: '',
        guardianCountry: 'Ghana',
      });
      setIsGuardianSelected(false);
    }
    setFiles({
      photo: null,
      idFront: null,
      idBack: null,
      guardianPhoto: null,
      guardianIdFront: null,
      guardianIdBack: null,
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

  const selectExistingGuardian = (g) => {
    setForm((prev) => ({
      ...prev,
      guardianFullName: g.name,
      guardianEmail: g.email !== '—' ? g.email : '',
      guardianPhone: g.phone !== '—' ? g.phone : '',
      guardianIdType: g.idType !== '—' ? g.idType : 'Passport',
      guardianStreet: g.street !== '—' ? g.street : '',
      guardianCity: g.city !== '—' ? g.city.split(',')[0].trim() : '',
      guardianCountry: g.country !== '—' ? g.country : 'Ghana',
    }));
    setIsGuardianSelected(true);
    setGuardianSearch('');
  };

  const validateStep = (step) => {
    const errs = {};

    if (step === 0) {
      if (!isEdit && !files.photo) errs.photo = 'Profile photo is required';
      if (!form.firstName.trim()) errs.firstName = 'First name is required';
      if (!form.lastName.trim()) errs.lastName = 'Last name is required';
      if (!form.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
      if (!form.emergencyContact.trim()) errs.emergencyContact = 'Emergency contact is required';
    } else if (step === 1) {
      if (!form.classId) errs.classId = 'Class / Grade selection is required';
      if (!form.idType) errs.idType = 'ID type is required';
      if (!isEdit) {
        if (!files.idFront) errs.idFront = 'ID front document is required';
        if (form.idType !== 'Passport' && !files.idBack) {
          errs.idBack = 'ID back document is required';
        }
      }
    } else if (step === 2) {
      if (!form.email.trim()) {
        errs.email = 'Email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        errs.email = 'Please enter a valid email address';
      }
    } else if (step === 3) {
      const parts = form.guardianFullName.trim().split(' ');
      if (!form.guardianFullName.trim()) {
        errs.guardianFullName = 'Guardian full name is required';
      } else if (parts.length < 2 || !parts[parts.length - 1].trim()) {
        errs.guardianFullName = 'Last name is required (enter first and last name separated by a space)';
      }

      if (!form.guardianEmail.trim()) {
        errs.guardianEmail = 'Guardian email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(form.guardianEmail)) {
        errs.guardianEmail = 'Valid guardian email is required';
      }

      if (!form.guardianPhone.trim()) {
        errs.guardianPhone = 'Guardian phone is required';
      }

      if (!isEdit && !files.guardianPhoto && !initialData?.guardianPhoto) {
        errs.guardianPhoto = 'Guardian photo is required';
      }

      if (!isEdit) {
        if (!files.guardianIdFront && !initialData?.guardianIdFront) {
          errs.guardianIdFront = 'Guardian ID front document is required';
        }
        if (form.guardianIdType !== 'Passport' && !files.guardianIdBack && !initialData?.guardianIdBack) {
          errs.guardianIdBack = 'Guardian ID back document is required';
        }
      }
    } else if (step === 4) {
      if (!form.street.trim()) errs.street = 'Street address is required';
      if (!form.city.trim()) errs.city = 'City is required';
      if (!form.region.trim()) errs.region = 'Region/State is required';
      if (!form.postalCode.trim()) errs.postalCode = 'Postal code/Zip is required';
      if (!form.country.trim()) errs.country = 'Country is required';

      if (!form.sameAsStudentAddress) {
        if (!form.guardianStreet.trim()) errs.guardianStreet = 'Guardian street is required';
        if (!form.guardianCity.trim()) errs.guardianCity = 'Guardian city is required';
        if (!form.guardianRegion.trim()) errs.guardianRegion = 'Guardian region is required';
        if (!form.guardianPostalCode.trim()) errs.guardianPostalCode = 'Guardian postal code is required';
        if (!form.guardianCountry.trim()) errs.guardianCountry = 'Guardian country is required';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((p) => p + 1);
      return;
    }

    // Submit form
    const [gFirstName, ...gRest] = form.guardianFullName.trim().split(' ');
    const gLastName = gRest.join(' ').trim() || gFirstName;

    const studentAddress = {
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.region.trim(),
      zip: form.postalCode.trim(),
      country: form.country.trim(),
    };

    const guardianAddress = form.sameAsStudentAddress
      ? studentAddress
      : {
          street: form.guardianStreet.trim(),
          city: form.guardianCity.trim(),
          state: form.guardianRegion.trim(),
          zip: form.guardianPostalCode.trim(),
          country: form.guardianCountry.trim(),
        };

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender.toLowerCase(),
      emergencyContact: form.emergencyContact.trim(),
      classId: form.classId,
      idType: form.idType,
      contactInfo: {
        phone: form.phone.trim(),
        altPhone: form.altPhone.trim(),
        whatsapp: form.whatsapp.trim(),
      },
      address: studentAddress,
      sameAsStudentAddress: String(form.sameAsStudentAddress),
      guardian: {
        firstName: gFirstName,
        lastName: gLastName,
        email: form.guardianEmail.trim(),
        idType: form.guardianIdType,
        contactInfo: {
          phone: form.guardianPhone.trim(),
        },
        address: guardianAddress,
      },
      ...files,
    };

    try {
      if (isEdit) {
        await updateStudentMutation.mutateAsync({ id: initialData.id, data: payload });
        addToast('Student record updated successfully.');
      } else {
        await createStudentMutation.mutateAsync(payload);
        addToast('Student enrolled successfully.');
      }
      onClose();
    } catch (err) {
      addToast(err?.message || 'Operation failed. Please review the inputs.', 'error');
    }
  };

  const isSubmitting = createStudentMutation.isPending || updateStudentMutation.isPending;

  return (
    <WizardModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Student' : 'Enroll Student'}
      subtitle={
        isEdit
          ? 'Update the student and guardian record details.'
          : 'A guided enrollment flow for a polished new student record.'
      }
      steps={STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={() => setCurrentStep((p) => p - 1)}
      submitLabel={isSubmitting ? 'Enrolling...' : isEdit ? 'Save Changes' : 'Enroll Student'}
      isLastStep={currentStep === STEPS.length - 1}
    >
      {currentStep === 0 && (
        <>
          <FileInput
            label="PROFILE PHOTO *"
            file={files.photo}
            existingUrl={initialData?.photo}
            onChange={(f) => updateFile('photo', f)}
            title="Tap to upload profile photo"
            error={errors.photo}
          />

          <div className="row">
            <div style={{ flex: 1 }}>
              <FormField
                label="FIRST NAME *"
                placeholder="First name"
                value={form.firstName}
                onChange={(v) => updateField('firstName', v)}
              />
              <FieldError error={errors.firstName} />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                label="LAST NAME *"
                placeholder="Last name"
                value={form.lastName}
                onChange={(v) => updateField('lastName', v)}
              />
              <FieldError error={errors.lastName} />
            </div>
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
              <FormField
                label="EMERGENCY CONTACT *"
                placeholder="+233 ..."
                value={form.emergencyContact}
                onChange={(v) => updateField('emergencyContact', v)}
              />
              <FieldError error={errors.emergencyContact} />
            </div>
          </div>

          <OptionGroup
            label="GENDER"
            options={['Female', 'Male', 'Other']}
            value={form.gender.charAt(0).toUpperCase() + form.gender.slice(1)}
            onChange={(v) => updateField('gender', v.toLowerCase())}
          />
        </>
      )}

      {currentStep === 1 && (
        <>
          <div className="row">
            <div style={{ flex: 1 }}>
              <FormField
                label="CLASS / GRADE *"
                as="select"
                placeholder="Select class"
                value={form.classId}
                onChange={(v) => updateField('classId', v)}
                options={classesList.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.code})`,
                }))}
              />
              <FieldError error={errors.classId} />
            </div>

            <div style={{ flex: 1 }}>
              <FormField
                label="ID TYPE *"
                as="select"
                value={form.idType}
                onChange={(v) => updateField('idType', v)}
                options={ID_TYPES_LIST}
              />
              <FieldError error={errors.idType} />
            </div>
          </div>

          {form.idType === 'Passport' ? (
            <FileInput
              label="PASSPORT PAGE (ID FRONT) *"
              file={files.idFront}
              existingUrl={initialData?.idFront}
              onChange={(f) => updateFile('idFront', f)}
              title="Passport page"
              hint="Clear scan preferred"
              error={errors.idFront}
            />
          ) : (
            <div className="row">
              <div style={{ flex: 1 }}>
                <FileInput
                  label="ID FRONT DOCUMENT *"
                  file={files.idFront}
                  existingUrl={initialData?.idFront}
                  onChange={(f) => updateFile('idFront', f)}
                  title="Upload ID Front"
                  hint="Clear scan preferred"
                  error={errors.idFront}
                />
              </div>
              <div style={{ flex: 1 }}>
                <FileInput
                  label="ID BACK DOCUMENT *"
                  file={files.idBack}
                  existingUrl={initialData?.idBack}
                  onChange={(f) => updateFile('idBack', f)}
                  title="Upload ID Back"
                  hint="Clear scan preferred"
                  error={errors.idBack}
                />
              </div>
            </div>
          )}
        </>
      )}

      {currentStep === 2 && (
        <>
          <div className="row">
            <FormField
              label="PHONE"
              placeholder="+233 ..."
              value={form.phone}
              onChange={(v) => updateField('phone', v)}
              style={{ flex: 1 }}
            />
            <FormField
              label="OTHER PHONE"
              placeholder="+233 ..."
              value={form.altPhone}
              onChange={(v) => updateField('altPhone', v)}
              style={{ flex: 1 }}
            />
          </div>
          <FormField
            label="WHATSAPP"
            placeholder="Number or username"
            value={form.whatsapp}
            onChange={(v) => updateField('whatsapp', v)}
          />
          <div>
            <FormField
              label="EMAIL *"
              type="email"
              placeholder="student@school.edu"
              value={form.email}
              onChange={(v) => updateField('email', v)}
            />
            <FieldError error={errors.email} />
          </div>
        </>
      )}

      {currentStep === 3 && (
        <>
          <div style={{ position: 'relative' }}>
            <FormField
              label="SEARCH EXISTING GUARDIAN"
              placeholder="Search by name, email, or phone..."
              value={guardianSearch}
              onChange={(v) => {
                setGuardianSearch(v);
                setIsGuardianSelected(false);
              }}
            />
            {guardianSearch && guardianSearchResults?.guardians?.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  borderRadius: '14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  zIndex: 10,
                  maxHeight: '180px',
                  overflowY: 'auto',
                }}
              >
                {guardianSearchResults.guardians.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => selectExistingGuardian(g)}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--line)',
                      fontSize: '13px',
                    }}
                  >
                    <b>{g.name}</b> · <span style={{ color: 'var(--mute)' }}>{g.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <FileInput
            label="GUARDIAN PHOTO *"
            file={files.guardianPhoto}
            existingUrl={initialData?.guardianPhoto}
            onChange={(f) => updateFile('guardianPhoto', f)}
            title="Guardian photo"
            hint="Tap to upload"
            error={errors.guardianPhoto}
          />

          <div>
            <FormField
              label="FULL NAME *"
              placeholder="Parent or guardian name (First Last)"
              value={form.guardianFullName}
              disabled={isGuardianSelected}
              onChange={(v) => updateField('guardianFullName', v)}
            />
            <FieldError error={errors.guardianFullName} />
          </div>

          <OptionGroup
            label="RELATIONSHIP"
            options={['Mother', 'Father', 'Guardian', 'Other']}
            value="Guardian"
            onChange={() => {}}
          />

          <div className="row">
            <div style={{ flex: 1 }}>
              <FormField
                label="PHONE *"
                placeholder="+233 ..."
                value={form.guardianPhone}
                disabled={isGuardianSelected}
                onChange={(v) => updateField('guardianPhone', v)}
              />
              <FieldError error={errors.guardianPhone} />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                label="EMAIL *"
                type="email"
                placeholder="parent@email.com"
                value={form.guardianEmail}
                disabled={isGuardianSelected}
                onChange={(v) => updateField('guardianEmail', v)}
              />
              <FieldError error={errors.guardianEmail} />
            </div>
          </div>

          <FormField
            label="GUARDIAN ID TYPE"
            as="select"
            value={form.guardianIdType}
            onChange={(v) => updateField('guardianIdType', v)}
            options={ID_TYPES_LIST}
          />

          {form.guardianIdType === 'Passport' ? (
            <FileInput
              label="GUARDIAN PASSPORT PAGE *"
              file={files.guardianIdFront}
              existingUrl={initialData?.guardianIdFront}
              onChange={(f) => updateFile('guardianIdFront', f)}
              title="Guardian Passport page"
              hint="Clear scan preferred"
              error={errors.guardianIdFront}
            />
          ) : (
            <div className="row">
              <div style={{ flex: 1 }}>
                <FileInput
                  label="GUARDIAN ID FRONT *"
                  file={files.guardianIdFront}
                  existingUrl={initialData?.guardianIdFront}
                  onChange={(f) => updateFile('guardianIdFront', f)}
                  title="Guardian ID Front"
                  error={errors.guardianIdFront}
                />
              </div>
              <div style={{ flex: 1 }}>
                <FileInput
                  label="GUARDIAN ID BACK *"
                  file={files.guardianIdBack}
                  existingUrl={initialData?.guardianIdBack}
                  onChange={(f) => updateFile('guardianIdBack', f)}
                  title="Guardian ID Back"
                  error={errors.guardianIdBack}
                />
              </div>
            </div>
          )}
        </>
      )}

      {currentStep === 4 && (
        <>
          <div>
            <FormField
              label="STREET *"
              placeholder="Street address"
              value={form.street}
              onChange={(v) => updateField('street', v)}
            />
            <FieldError error={errors.street} />
          </div>

          <div className="row">
            <div style={{ flex: 1 }}>
              <FormField
                label="CITY *"
                placeholder="City"
                value={form.city}
                onChange={(v) => updateField('city', v)}
              />
              <FieldError error={errors.city} />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                label="REGION *"
                placeholder="Region"
                value={form.region}
                onChange={(v) => updateField('region', v)}
              />
              <FieldError error={errors.region} />
            </div>
          </div>

          <div className="row">
            <div style={{ flex: 1 }}>
              <FormField
                label="POSTAL CODE *"
                placeholder="Postal code"
                value={form.postalCode}
                onChange={(v) => updateField('postalCode', v)}
              />
              <FieldError error={errors.postalCode} />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                label="COUNTRY *"
                placeholder="Country"
                value={form.country}
                onChange={(v) => updateField('country', v)}
              />
              <FieldError error={errors.country} />
            </div>
          </div>

          <CheckboxCard
            title="Same address for guardian"
            description="Skip re-entering if they live at the same place"
            checked={form.sameAsStudentAddress}
            onChange={(v) => updateField('sameAsStudentAddress', v)}
          />

          {!form.sameAsStudentAddress && (
            <div style={{ display: 'grid', gap: '14px', marginTop: '10px' }}>
              <div>
                <label>GUARDIAN RESIDENTIAL ADDRESS</label>
              </div>
              <div>
                <FormField
                  label="GUARDIAN STREET *"
                  placeholder="Guardian street address"
                  value={form.guardianStreet}
                  onChange={(v) => updateField('guardianStreet', v)}
                />
                <FieldError error={errors.guardianStreet} />
              </div>

              <div className="row">
                <div style={{ flex: 1 }}>
                  <FormField
                    label="GUARDIAN CITY *"
                    placeholder="City"
                    value={form.guardianCity}
                    onChange={(v) => updateField('guardianCity', v)}
                  />
                  <FieldError error={errors.guardianCity} />
                </div>
                <div style={{ flex: 1 }}>
                  <FormField
                    label="GUARDIAN REGION *"
                    placeholder="Region"
                    value={form.guardianRegion}
                    onChange={(v) => updateField('guardianRegion', v)}
                  />
                  <FieldError error={errors.guardianRegion} />
                </div>
              </div>

              <div className="row">
                <div style={{ flex: 1 }}>
                  <FormField
                    label="GUARDIAN POSTAL CODE *"
                    placeholder="Postal code"
                    value={form.guardianPostalCode}
                    onChange={(v) => updateField('guardianPostalCode', v)}
                  />
                  <FieldError error={errors.guardianPostalCode} />
                </div>
                <div style={{ flex: 1 }}>
                  <FormField
                    label="GUARDIAN COUNTRY *"
                    placeholder="Country"
                    value={form.guardianCountry}
                    onChange={(v) => updateField('guardianCountry', v)}
                  />
                  <FieldError error={errors.guardianCountry} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </WizardModal>
  );
}
