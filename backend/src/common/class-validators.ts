import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'requireOneOf', async: false })
export class RequireOneOfConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(value: any, args: ValidationArguments) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const object = args.object as Record<string, any>;
    const fields = args.constraints as string[];

    return fields.some((field) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const fieldValue = object[field];
      return (
        fieldValue !== undefined && fieldValue !== null && fieldValue !== ''
      );
    });
  }

  defaultMessage(args: ValidationArguments) {
    const fields = args.constraints.join(', ');
    return `At least one of these fields (${fields}) must be provided`;
  }
}

export function RequireOneOf(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (target: any) {
    registerDecorator({
      target: target,
      propertyName: 'requireOneOfValidation',
      options: validationOptions,
      constraints: fields,
      validator: RequireOneOfConstraint,
    });
  };
}
