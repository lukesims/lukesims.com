import * as RadixForm from "@radix-ui/react-form";

export const Submit = RadixForm.Submit;

export interface FormProps extends RadixForm.FormProps {}

export function Form({ children, ...props }: FormProps) {
  return (
    <RadixForm.Root
      {...props}
      className="flex w-full flex-col items-stretch gap-6"
    >
      {children}
    </RadixForm.Root>
  );
}

export interface FieldProps {
  children: React.ReactNode;
  label: string;
  name: RadixForm.FormFieldProps["name"];
  required?: boolean;
  serverInvalid?: RadixForm.FormFieldProps["serverInvalid"];

  messages?: {
    forceMatch?: RadixForm.FormMessageProps["forceMatch"];
    match: RadixForm.FormMessageProps["match"];
    message: string;
  }[];
}

export function Field({ children, required = false, ...props }: FieldProps) {
  return (
    <FieldContainer {...props} required={required}>
      <RadixForm.Control asChild required={required}>
        {children}
      </RadixForm.Control>
    </FieldContainer>
  );
}

export function FieldContainer({
  children,
  label,
  messages = [],
  name,
  required = false,
  serverInvalid = false,
}: FieldProps) {
  return (
    <RadixForm.Field
      className="grid gap-1"
      name={name}
      serverInvalid={serverInvalid}
    >
      <div className="flex items-baseline justify-between">
        <RadixForm.Label className="text-base font-medium">
          {label}
          {required && <span className="text-danger ml-1 font-bold">*</span>}
        </RadixForm.Label>
        {messages.map(({ message, ...props }, i) => (
          <RadixForm.Message
            className="text-danger text-sm font-semibold"
            key={i}
            {...props}
          >
            {message}
          </RadixForm.Message>
        ))}
      </div>
      {children}
    </RadixForm.Field>
  );
}
