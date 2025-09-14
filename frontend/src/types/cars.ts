import dayjs from 'dayjs';

export interface CreateCarRequest {
  licensePlate: string;
  model: string;
  manufacturer: string;
  firstRegistration?: string;
  color?: string;
  engineCapacity?: string;
  comment?: string;
  fuelType?: string;
  enginePower?: string;
  oilChangeDate?: string;
  oilChangeKm?: number;
  tires?: string;
  inspectionDate?: string;
  vin?: string;
  timingBeltKm?: number;
  timingBeltDate?: string;
  documentField2?: string;
  documentField3?: string;
}

export type UpdateCarRequest = Partial<CreateCarRequest>;

type CarFormField<V = string | number | dayjs.Dayjs | null> = {
  required?: true;
  value: V;
  errorMessage?: string;
};

export interface CarForm {
  licensePlate: CarFormField;
  model: CarFormField;
  manufacturer: CarFormField;
  firstRegistration: CarFormField<dayjs.Dayjs | null>;
  color: CarFormField;
  engineCapacity: CarFormField;
  comment: CarFormField;
  fuelType: CarFormField;
  enginePower: CarFormField;
  oilChangeDate: CarFormField<dayjs.Dayjs | null>;
  oilChangeKm: CarFormField;
  tires: CarFormField;
  inspectionDate: CarFormField<dayjs.Dayjs | null>;
  vin: CarFormField;
  timingBeltKm: CarFormField;
  timingBeltDate: CarFormField<dayjs.Dayjs | null>;
  documentField2: CarFormField;
  documentField3: CarFormField;
}
