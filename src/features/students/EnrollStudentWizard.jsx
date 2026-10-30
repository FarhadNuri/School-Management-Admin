import React, { useState, useEffect } from 'react';
import {
  WizardModal,
  FormField,
  OptionGroup,
  CheckboxCard,
  FileInput,
  FieldError,
  CredentialsModal,
  useToast,
} from '../../components/ui';
import { useCreateStudent, useUpdateStudent, useClasses, useGuardians } from '../../hooks/queries';
import { useDebounce } from '../../hooks/useDebounce';
import { formatBdPhone } from '../../api/adapters/helpers';

const STEPS = ['IDENTITY', 'SCHOOL', 'CONTACT', 'FAMILY', 'ADDRESS'];

const STUDENT_ID_TYPES = ['Birth Certificate'];
const GUARDIAN_ID_TYPES = ['National ID Card', 'Birth Certificate'];

const getMaxStudentDob = () => {
  const d = new Date();
  const y = d.getFullYear() - 10;
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export function EnrollStudentWizard({ isOpen, onClose, initialData = null }) {
  const isEdit = Boolean(initialData?.id);
  const { addToast } = useToast();
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();

  const { data: classesData } = useClasses();
  const classesList = classesData?.classes || [];

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [createdEmailSent, setCreatedEmailSent] = useState(false);

  // Guardian search state
  const [guardianSearch, setGuardianSearch] = useState('');
  const debouncedGuardianSearch = useDebounce(guardianSearch, 400);
  const { data: guardianSearchResults } = useGuardians({ search: debouncedGuardianSearch });
  const [isGuardianSelected, setIsGuardianSelected] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState(null);

  const [form, setForm] = useState({
    existingGuardianId: '',
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: 'female',
    emergencyContact: '+88',
    classId: '',
    idType: 'Birth Certificate',
    phone: '+88',
    altPhone: '+88',
    whatsapp: '+88',
    guardianFullName: '',
    guardianEmail: '',
    guardianPhone: '+88',
    guardianIdType: 'National ID Card',
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'Bangladesh',
    sameAsStudentAddress: true,
    guardianStreet: '',
    guardianCity: '',
    guardianRegion: '',
    guardianPostalCode: '',
    guardianCountry: 'Bangladesh',
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
        existingGuardianId: g._id || g.id || '',
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.email || '',
        dateOfBirth: u.dateOfBirth ? String(u.dateOfBirth).slice(0, 10) : '',
        gender: u.gender === 'male' ? 'male' : 'female',
        emergencyContact: raw.emergencyContact && raw.emergencyContact !== '—' ? formatBdPhone(raw.emergencyContact) : '+88',
        classId: raw.class?._id || raw.class || '',
        idType: 'Birth Certificate',
        phone: u.contactInfo?.phone && u.contactInfo?.phone !== '—' ? formatBdPhone(u.contactInfo.phone) : '+88',
        altPhone: u.contactInfo?.altPhone && u.contactInfo?.altPhone !== '—' ? formatBdPhone(u.contactInfo.altPhone) : '+88',
        whatsapp: u.contactInfo?.whatsapp && u.contactInfo?.whatsapp !== '—' ? formatBdPhone(u.contactInfo.whatsapp) : '+88',
        guardianFullName: `${gu.firstName || ''} ${gu.lastName || ''}`.trim(),
        guardianEmail: gu.email || '',
        guardianPhone: gu.contactInfo?.phone && gu.contactInfo?.phone !== '—' ? formatBdPhone(gu.contactInfo.phone) : '+88',
        guardianIdType: g.idType && g.idType.includes('Birth') ? 'Birth Certificate' : 'National ID Card',
        street: u.address?.street || '',
        city: u.address?.city || '',
        region: u.address?.state || '',
        postalCode: u.address?.zip || '',
        country: u.address?.country || 'Bangladesh',
        sameAsStudentAddress: true,
        guardianStreet: gu.address?.street || '',
        guardianCity: gu.address?.city || '',
        guardianRegion: gu.address?.state || '',
        guardianPostalCode: gu.address?.zip || '',
        guardianCountry: gu.address?.country || 'Bangladesh',
      });
      setIsGuardianSelected(Boolean(g._id || g.id));
      setSelectedGuardian(raw.guardian || null);
    } else {
      setForm({
        existingGuardianId: '',
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        gender: 'female',
        emergencyContact: '+88',
        classId: '',
        idType: 'Birth Certificate',
        phone: '+88',
        altPhone: '+88',
        whatsapp: '+88',
        guardianFullName: '',
        guardianEmail: '',
        guardianPhone: '+88',
        guardianIdType: 'National ID Card',
        street: '',
        city: '',
        region: '',
        postalCode: '',
        country: 'Bangladesh',
        sameAsStudentAddress: true,
        guardianStreet: '',
        guardianCity: '',
        guardianRegion: '',
        guardianPostalCode: '',
        guardianCountry: 'Bangladesh',
      });
      setIsGuardianSelected(false);
      setSelectedGuardian(null);
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
    // When typing phone number, automatically mirror to whatsapp
    if (field === 'phone') {
      const formatted = formatBdPhone(val);
      setForm((prev) => ({
        ...prev,
        phone: formatted,
        whatsapp: formatted,
      }));
      if (errors.phone || errors.whatsapp) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.phone;
          delete copy.whatsapp;
          return copy;
        });
      }
      return;
    }

    if (['emergencyContact', 'altPhone', 'whatsapp', 'guardianPhone'].includes(field)) {
      const formatted = formatBdPhone(val);
      setForm((prev) => ({ ...prev, [field]: formatted }));
      if (errors[field]) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[field];
          return copy;
        });
      }
      return;
    }

    // When updating address fields, keep guardian address in sync if same address is selected
    if (['street', 'city', 'region', 'postalCode', 'country'].includes(field)) {
      setForm((prev) => {
        const updated = { ...prev, [field]: val };
        if (prev.sameAsStudentAddress) {
          if (field === 'street') updated.guardianStreet = val;
          if (field === 'city') updated.guardianCity = val;
          if (field === 'region') updated.guardianRegion = val;
          if (field === 'postalCode') updated.guardianPostalCode = val;
          if (field === 'country') updated.guardianCountry = val;
        }
        return updated;
      });
      if (errors[field]) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy[field];
          return copy;
        });
      }
      return;
    }

    // Toggle same address
    if (field === 'sameAsStudentAddress') {
      setForm((prev) => {
        const checked = Boolean(val);
        if (checked) {
          const hasStudentAddress = Boolean(prev.street || prev.city || prev.region || prev.postalCode);
          const hasGuardianAddress = Boolean(prev.guardianStreet || prev.guardianCity || prev.guardianRegion || prev.guardianPostalCode);

          if (hasGuardianAddress && !hasStudentAddress) {
            return {
              ...prev,
              sameAsStudentAddress: true,
              street: prev.guardianStreet,
              city: prev.guardianCity,
              region: prev.guardianRegion,
              postalCode: prev.guardianPostalCode,
              country: prev.guardianCountry || 'Bangladesh',
            };
          } else {
            return {
              ...prev,
              sameAsStudentAddress: true,
              guardianStreet: prev.street,
              guardianCity: prev.city,
              guardianRegion: prev.region,
              guardianPostalCode: prev.postalCode,
              guardianCountry: prev.country || 'Bangladesh',
            };
          }
        }
        return {
          ...prev,
          sameAsStudentAddress: false,
        };
      });
      return;
    }

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
    const rawUser = g.rawGuardian?.user || {};
    const rawGuardian = g.rawGuardian || {};
    const rawAddress = rawUser.address || g.address || {};
    const rawContact = rawUser.contactInfo || g.contactInfo || {};

    const fullName = (
      (g.name && g.name !== '—' ? g.name : '') ||
      `${rawUser.firstName || ''} ${rawUser.lastName || ''}`.trim() ||
      `${g.firstName || ''} ${g.lastName || ''}`.trim()
    );

    const email = (g.email && g.email !== '—' ? g.email : rawUser.email) || '';
    const phone = (g.phone && g.phone !== '—' ? g.phone : rawContact.phone) || '';
    const formattedPhone = phone ? formatBdPhone(phone) : '+88';

    let idType = (g.idType && g.idType !== '—' ? g.idType : rawGuardian.idType) || 'National ID Card';
    if (!GUARDIAN_ID_TYPES.includes(idType)) {
      if (idType.toLowerCase().includes('birth')) {
        idType = 'Birth Certificate';
      } else {
        idType = 'National ID Card';
      }
    }

    const street = (g.street && g.street !== '—' ? g.street : rawAddress.street) || '';
    const city = rawAddress.city || (g.city && g.city !== '—' ? g.city.split(',')[0].trim() : '');
    const region = (g.state && g.state !== '—' ? g.state : rawAddress.state) || '';
    const postalCode = (g.zip && g.zip !== '—' ? g.zip : rawAddress.zip) || '';
    const country = (g.country && g.country !== '—' ? g.country : rawAddress.country) || 'Bangladesh';

    setSelectedGuardian(g);
    setIsGuardianSelected(true);
    setGuardianSearch('');

    setForm((prev) => {
      const next = {
        ...prev,
        existingGuardianId: String(g.id || rawGuardian._id || ''),
        guardianFullName: fullName,
        guardianEmail: email,
        guardianPhone: formattedPhone,
        guardianIdType: idType,
        guardianStreet: street,
        guardianCity: city,
        guardianRegion: region,
        guardianPostalCode: postalCode,
        guardianCountry: country,
      };

      // In address, if same address for guardian is selected, fetch those into the student boxes
      if (prev.sameAsStudentAddress) {
        if (street) next.street = street;
        if (city) next.city = city;
        if (region) next.region = region;
        if (postalCode) next.postalCode = postalCode;
        if (country) next.country = country;
      }

      return next;
    });

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.guardianFullName;
      delete copy.guardianEmail;
      delete copy.guardianPhone;
      delete copy.guardianPhoto;
      delete copy.guardianIdFront;
      delete copy.guardianIdBack;
      if (street) delete copy.street;
      if (city) delete copy.city;
      if (region) delete copy.region;
      if (postalCode) delete copy.postalCode;
      if (country) delete copy.country;
      return copy;
    });
  };

  const handleClearSelectedGuardian = () => {
    setSelectedGuardian(null);
    setIsGuardianSelected(false);
    setGuardianSearch('');
    setForm((prev) => ({
      ...prev,
      existingGuardianId: '',
      guardianFullName: '',
      guardianEmail: '',
      guardianPhone: '+88',
      guardianIdType: 'National ID Card',
      guardianStreet: '',
      guardianCity: '',
      guardianRegion: '',
      guardianPostalCode: '',
      guardianCountry: 'Bangladesh',
    }));
  };

  const validateStep = (step) => {
    const errs = {};

    if (step === 0) {
      if (!isEdit && !files.photo) errs.photo = 'Profile photo is required';
      if (!form.firstName.trim()) errs.firstName = 'First name is required';
      if (!form.lastName.trim()) errs.lastName = 'Last name is required';
      if (!form.dateOfBirth) {
        errs.dateOfBirth = 'Date of birth is required';
      } else {
        const dob = new Date(form.dateOfBirth);
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - 10);
        maxDate.setHours(23, 59, 59, 999);
        if (isNaN(dob.getTime())) {
          errs.dateOfBirth = 'Please enter a valid date of birth';
        } else if (dob > maxDate) {
          errs.dateOfBirth = 'Student must be at least 10 years old';
        }
      }
      const emDigits = form.emergencyContact ? form.emergencyContact.replace(/^\+88/, '').replace(/\D/g, '') : '';
      if (!emDigits) {
        errs.emergencyContact = 'Emergency contact is required';
      } else if (emDigits.length !== 11) {
        errs.emergencyContact = 'Emergency contact must have exactly 11 digits (+88 + 11 digits)';
      }
    } else if (step === 1) {
      if (!form.classId) errs.classId = 'Class / Grade selection is required';
      if (!form.idType) errs.idType = 'ID type is required';
      if (!isEdit) {
        if (!files.idFront) errs.idFront = 'Birth certificate scan is required';
      }
    } else if (step === 2) {
      if (!form.email.trim()) {
        errs.email = 'Email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        errs.email = 'Please enter a valid email address';
      }
      const phDigits = form.phone ? form.phone.replace(/^\+88/, '').replace(/\D/g, '') : '';
      if (phDigits && phDigits.length !== 11) {
        errs.phone = 'Phone number must have exactly 11 digits (+88 + 11 digits)';
      }
      const altDigits = form.altPhone ? form.altPhone.replace(/^\+88/, '').replace(/\D/g, '') : '';
      if (altDigits && altDigits.length !== 11) {
        errs.altPhone = 'Other phone must have exactly 11 digits (+88 + 11 digits)';
      }
      const waDigits = form.whatsapp ? form.whatsapp.replace(/^\+88/, '').replace(/\D/g, '') : '';
      if (waDigits && waDigits.length !== 11) {
        errs.whatsapp = 'WhatsApp must have exactly 11 digits (+88 + 11 digits)';
      }
    } else if (step === 3) {
      const isExistingGuardian = Boolean(form.existingGuardianId || selectedGuardian);

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

      const gPhDigits = form.guardianPhone ? form.guardianPhone.replace(/^\+88/, '').replace(/\D/g, '') : '';
      if (!gPhDigits) {
        errs.guardianPhone = 'Guardian phone is required';
      } else if (gPhDigits.length !== 11) {
        errs.guardianPhone = 'Guardian phone must have exactly 11 digits (+88 + 11 digits)';
      }

      // Existing guardian already has photo & IDs on file
      if (!isEdit && !isExistingGuardian && !files.guardianPhoto && !initialData?.guardianPhoto) {
        errs.guardianPhoto = 'Guardian photo is required';
      }

      if (!isEdit && !isExistingGuardian) {
        if (!files.guardianIdFront && !initialData?.guardianIdFront) {
          errs.guardianIdFront = 'Guardian ID front document is required';
        }
        const isGuardianSingleSided = form.guardianIdType === 'Birth Certificate' || form.guardianIdType === 'Passport';
        if (!isGuardianSingleSided && !files.guardianIdBack && !initialData?.guardianIdBack) {
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
        phone: form.phone && form.phone !== '+88' ? form.phone.trim() : '',
        altPhone: form.altPhone && form.altPhone !== '+88' ? form.altPhone.trim() : '',
        whatsapp: form.whatsapp && form.whatsapp !== '+88' ? form.whatsapp.trim() : '',
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

    if (form.existingGuardianId) {
      payload.existingGuardianId = form.existingGuardianId;
    }

    try {
      if (isEdit) {
        await updateStudentMutation.mutateAsync({ id: initialData.id, data: payload });
        addToast('Student record updated successfully.');
        onClose();
      } else {
        const res = await createStudentMutation.mutateAsync(payload);
        if (res?.credentials) {
          setCreatedCredentials(res.credentials);
          setCreatedEmailSent(Boolean(res.emailSent));
          addToast('Student enrolled successfully.');
        } else {
          addToast('Student enrolled successfully.');
          onClose();
        }
      }
    } catch (err) {
      addToast(err?.message || 'Operation failed. Please review the inputs.', 'error');
    }
  };

  const isSubmitting = createStudentMutation.isPending || updateStudentMutation.isPending;

  return (
    <>
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
                max={getMaxStudentDob()}
                value={form.dateOfBirth}
                onChange={(v) => updateField('dateOfBirth', v)}
              />
              <FieldError error={errors.dateOfBirth} />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                label="EMERGENCY CONTACT *"
                placeholder="+88017XXXXXXXX"
                value={form.emergencyContact}
                maxLength={14}
                onChange={(v) => updateField('emergencyContact', v)}
              />
              <FieldError error={errors.emergencyContact} />
            </div>
          </div>

          <OptionGroup
            label="GENDER"
            options={['Female', 'Male']}
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
                options={STUDENT_ID_TYPES}
              />
              <FieldError error={errors.idType} />
            </div>
          </div>

          <FileInput
            label="BIRTH CERTIFICATE (SCAN) *"
            file={files.idFront}
            existingUrl={initialData?.idFront}
            onChange={(f) => updateFile('idFront', f)}
            title="Birth certificate scan"
            hint="Clear scan preferred"
            error={errors.idFront}
          />
        </>
      )}

      {currentStep === 2 && (
        <>
          <div className="row">
            <div style={{ flex: 1 }}>
              <FormField
                label="PHONE"
                placeholder="+88017XXXXXXXX"
                value={form.phone}
                maxLength={14}
                onChange={(v) => updateField('phone', v)}
              />
              <FieldError error={errors.phone} />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                label="OTHER PHONE"
                placeholder="+88017XXXXXXXX"
                value={form.altPhone}
                maxLength={14}
                onChange={(v) => updateField('altPhone', v)}
              />
              <FieldError error={errors.altPhone} />
            </div>
          </div>

          <FormField
            label="WHATSAPP"
            placeholder="+88017XXXXXXXX"
            value={form.whatsapp}
            maxLength={14}
            onChange={(v) => updateField('whatsapp', v)}
          />
          <FieldError error={errors.whatsapp} />
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
          {isGuardianSelected && selectedGuardian ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(12, 107, 89, 0.08)',
                border: '1px solid rgba(12, 107, 89, 0.25)',
                borderRadius: '12px',
                marginBottom: '12px',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--brand)' }}>
                  ✓ Existing Guardian Selected
                </div>
                <div style={{ fontSize: '12px', color: 'var(--mute)', marginTop: '2px' }}>
                  {form.guardianFullName} · {form.guardianEmail}
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearSelectedGuardian}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: 'var(--ink)',
                }}
              >
                Change Guardian
              </button>
            </div>
          ) : (
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
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectExistingGuardian(g);
                      }}
                      onClick={() => selectExistingGuardian(g)}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--line)',
                        fontSize: '13px',
                      }}
                    >
                      <b>{g.name}</b> · <span style={{ color: 'var(--mute)' }}>{g.email}</span>
                      {g.phone && g.phone !== '—' && (
                        <span style={{ color: 'var(--mute)', marginLeft: '6px' }}>({g.phone})</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <FileInput
            label={isGuardianSelected ? "GUARDIAN PHOTO (ON FILE)" : "GUARDIAN PHOTO *"}
            file={files.guardianPhoto}
            existingUrl={selectedGuardian?.photo || initialData?.guardianPhoto}
            onChange={(f) => updateFile('guardianPhoto', f)}
            title={isGuardianSelected ? "Guardian photo on file" : "Guardian photo"}
            hint={isGuardianSelected ? "Existing photo loaded · Click to upload new" : "Tap to upload"}
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
                placeholder="+88017XXXXXXXX"
                value={form.guardianPhone}
                disabled={isGuardianSelected}
                maxLength={14}
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
            disabled={isGuardianSelected}
            onChange={(v) => updateField('guardianIdType', v)}
            options={GUARDIAN_ID_TYPES}
          />

          {form.guardianIdType === 'Birth Certificate' ? (
            <FileInput
              label={isGuardianSelected ? "GUARDIAN BIRTH CERTIFICATE (ON FILE)" : "GUARDIAN BIRTH CERTIFICATE *"}
              file={files.guardianIdFront}
              existingUrl={selectedGuardian?.idFront || initialData?.guardianIdFront}
              onChange={(f) => updateFile('guardianIdFront', f)}
              title={isGuardianSelected ? "Birth certificate on file" : "Guardian Birth certificate"}
              hint={isGuardianSelected ? "Existing scan loaded · Click to upload new" : "Clear scan preferred"}
              error={errors.guardianIdFront}
            />
          ) : (
            <div className="row">
              <div style={{ flex: 1 }}>
                <FileInput
                  label={isGuardianSelected ? "GUARDIAN ID FRONT (ON FILE)" : "GUARDIAN ID FRONT *"}
                  file={files.guardianIdFront}
                  existingUrl={selectedGuardian?.idFront || initialData?.guardianIdFront}
                  onChange={(f) => updateFile('guardianIdFront', f)}
                  title={isGuardianSelected ? "ID Front on file" : "Guardian ID Front"}
                  hint={isGuardianSelected ? "Existing scan loaded · Click to upload new" : "Clear scan preferred"}
                  error={errors.guardianIdFront}
                />
              </div>
              <div style={{ flex: 1 }}>
                <FileInput
                  label={isGuardianSelected ? "GUARDIAN ID BACK (ON FILE)" : "GUARDIAN ID BACK *"}
                  file={files.guardianIdBack}
                  existingUrl={selectedGuardian?.idBack || initialData?.guardianIdBack}
                  onChange={(f) => updateFile('guardianIdBack', f)}
                  title={isGuardianSelected ? "ID Back on file" : "Guardian ID Back"}
                  hint={isGuardianSelected ? "Existing scan loaded · Click to upload new" : "Clear scan preferred"}
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
              placeholder="e.g. Sugandha"
              value={form.street}
              onChange={(v) => updateField('street', v)}
            />
            <FieldError error={errors.street} />
          </div>

          <div className="row">
            <div style={{ flex: 1 }}>
              <FormField
                label="CITY *"
                placeholder="e.g. Chattogram"
                value={form.city}
                onChange={(v) => updateField('city', v)}
              />
              <FieldError error={errors.city} />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                label="REGION *"
                placeholder="e.g. Chattogram"
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
                placeholder="e.g. 4203"
                value={form.postalCode}
                onChange={(v) => updateField('postalCode', v)}
              />
              <FieldError error={errors.postalCode} />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                label="COUNTRY *"
                placeholder="e.g. Bangladesh"
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
                  placeholder="e.g. Sugandha"
                  value={form.guardianStreet}
                  onChange={(v) => updateField('guardianStreet', v)}
                />
                <FieldError error={errors.guardianStreet} />
              </div>

              <div className="row">
                <div style={{ flex: 1 }}>
                  <FormField
                    label="GUARDIAN CITY *"
                    placeholder="e.g. Chattogram"
                    value={form.guardianCity}
                    onChange={(v) => updateField('guardianCity', v)}
                  />
                  <FieldError error={errors.guardianCity} />
                </div>
                <div style={{ flex: 1 }}>
                  <FormField
                    label="GUARDIAN REGION *"
                    placeholder="e.g. Chattogram"
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
                    placeholder="e.g. 4203"
                    value={form.guardianPostalCode}
                    onChange={(v) => updateField('guardianPostalCode', v)}
                  />
                  <FieldError error={errors.guardianPostalCode} />
                </div>
                <div style={{ flex: 1 }}>
                  <FormField
                    label="GUARDIAN COUNTRY *"
                    placeholder="e.g. Bangladesh"
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
    {createdCredentials && (
      <CredentialsModal
        isOpen={Boolean(createdCredentials)}
        onClose={() => {
          setCreatedCredentials(null);
          onClose();
        }}
        title="Student Enrolled Successfully"
        subtitle="Login credentials have been generated for the newly enrolled student and guardian."
        credentials={createdCredentials}
        emailSent={createdEmailSent}
      />
    )}
    </>
  );
}
