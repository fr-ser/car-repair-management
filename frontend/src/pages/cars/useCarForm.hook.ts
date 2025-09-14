import dayjs from 'dayjs';
import React from 'react';

import { BackendCar } from '@/src/types/backend-contracts';
import { CarForm, CreateCarRequest } from '@/src/types/cars';
import { formatNumber, parseNumber } from '@/src/utils/numbers';

const dateFields = [
  'firstRegistration',
  'oilChangeDate',
  'inspectionDate',
  'timingBeltDate',
];

const numberFields = ['timingBeltKm', 'oilChangeKm'];

function getFromFromClient(data?: BackendCar): CarForm {
  return {
    licensePlate: {
      required: true,
      value: data?.licensePlate ?? '',
    },
    model: {
      required: true,
      value: data?.model ?? '',
    },
    manufacturer: {
      required: true,
      value: data?.manufacturer ?? '',
    },
    firstRegistration: {
      value: data?.firstRegistration ? dayjs(data.firstRegistration) : null,
    },
    color: {
      value: data?.color ?? '',
    },
    engineCapacity: {
      value: data?.engineCapacity ?? '',
    },
    comment: {
      value: data?.comment ?? '',
    },
    fuelType: {
      value: data?.fuelType ?? '',
    },
    enginePower: {
      value: data?.enginePower ?? '',
    },
    oilChangeDate: {
      value: data?.oilChangeDate ? dayjs(data.oilChangeDate) : null,
    },
    oilChangeKm: {
      value: formatNumber(data?.oilChangeKm, { undefinedAs: '' }),
    },
    tires: {
      value: data?.tires ?? '',
    },
    inspectionDate: {
      value: data?.inspectionDate ? dayjs(data.inspectionDate) : null,
    },
    vin: {
      value: data?.vin ?? '',
    },
    timingBeltKm: {
      value: formatNumber(data?.timingBeltKm, { undefinedAs: '' }),
    },
    timingBeltDate: {
      value: data?.timingBeltDate ? dayjs(data.timingBeltDate) : null,
    },
    documentField2: {
      value: data?.documentField2 ?? '',
    },
    documentField3: {
      value: data?.documentField3 ?? '',
    },
  };
}

export default (data?: BackendCar) => {
  const [formData, setFormData] = React.useState<CarForm>(
    getFromFromClient(data),
  );

  const reloadForm = React.useCallback((data?: BackendCar) => {
    setFormData(getFromFromClient(data));
  }, []);

  const onFormInputChange = React.useCallback(
    (field: keyof CarForm, value: string | Date | null) => {
      let formattedValue;
      if (value instanceof Date) {
        formattedValue = dayjs(value);
      } else {
        formattedValue = value;
      }

      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], value: formattedValue },
      }));
    },
    [],
  );

  const validate = React.useCallback((): boolean => {
    let isValid = true;
    Object.entries(formData).forEach(([fieldName, field]) => {
      field.errorMessage = undefined;
      switch (fieldName) {
        case 'tires':
          if (field.value) {
            const tirePattern = /^\d{3}\/\d{2} R\d{2} \d{3}[A-Z]$/;
            if (!tirePattern.test(field.value)) {
              field.errorMessage =
                'Ungültiges Format (korrekt: 265/60 R18 110H)';
              isValid = false;
            }
          }
          break;
        default:
          if (field.required && (field.value === '' || field.value === null)) {
            field.errorMessage = 'Dieses Feld ist erforderlich';
            isValid = false;
          }
          break;
      }
    });
    return isValid;
  }, [formData]);

  const getPayload = React.useCallback((): CreateCarRequest => {
    const isValid = validate();
    if (!isValid) {
      throw new Error('Die Formulardaten sind ungültig');
    }

    const result: CreateCarRequest = {
      licensePlate: formData.licensePlate.value as string,
      model: formData.model.value as string,
      manufacturer: formData.manufacturer.value as string,
    };

    Object.entries(formData).forEach(([key, field]) => {
      if (field.value) {
        if (dateFields.includes(key)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result as any)[key] = field.value.format('YYYY-MM-DD');
        } else if (numberFields.includes(key)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result as any)[key] = parseNumber(field.value);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result as any)[key] = field.value;
        }
      }
    });

    return result;
  }, [formData, validate]);

  return {
    formData,
    reloadForm,
    setFormData,
    onFormInputChange,
    validate,
    getPayload,
  };
};
