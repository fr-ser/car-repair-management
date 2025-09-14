export interface ConfirmationOptions {
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

export const DEFAULT_OPTIONS = {
  title: '', // Empty by default
  message: '', // Will be overridden
  confirmText: 'Bestätigen',
  cancelText: 'Abbrechen',
};
