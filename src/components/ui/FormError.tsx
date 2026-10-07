export const FormError = ({ message }: { message: string }) =>
  message ? <p className="form__error">{message}</p> : null;
