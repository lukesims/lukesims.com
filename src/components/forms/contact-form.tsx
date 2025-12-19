import { useRef, useState } from "react";

import { Button } from "~/components/button";
import { type CaptchaHandle, CaptchaInput } from "~/components/captcha";
import {
  Field,
  FieldContainer,
  Form,
  type FormProps,
  Submit,
} from "~/components/form";
import { Input } from "~/components/input";
import { TextArea } from "~/components/textarea";
import { toast } from "~/components/toast";

export function ContactForm() {
  const captchaRef = useRef<CaptchaHandle | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<{
    [key: string]: string | undefined;
  }>({
    name: undefined,
    email: undefined,
    phone: undefined,
    message: undefined,
    captcha_token: undefined,
  });

  const onSubmit: FormProps["onSubmit"] = async (event) => {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;
    // This will need updating if any multiple/array fields are added
    const body = JSON.stringify(Object.fromEntries(new FormData(form)));

    let response: Response;
    try {
      response = await fetch(
        new URL("/contact/send", import.meta.env.PUBLIC_SITE_URL),
        { method: "POST", body },
      );
    } catch (err) {
      toast.danger({
        title: "Internal Error",
        description: "Please try again later.",
      });
      setLoading(false);
      return;
    }

    if (!response.ok) {
      if (response.status === 422) {
        const errors = (await response.json()) as Record<string, string[]>;
        setServerErrors({
          name: errors.name?.[0],
          email: errors.email?.[0],
          phone: errors.phone?.[0],
          message: errors.message?.[0],
          captcha_token: errors.captcha_token?.[0],
        });
        if (errors.captcha_token?.includes("retry")) {
          captchaRef.current?.reset();
        }
      } else {
        toast.danger({
          title: "Internal Error",
          description: "Please try again later.",
        });
      }
      setLoading(false);
      return;
    }

    form.reset();
    setLoading(false);
    toast.success({
      title: "Sent!",
      description: "I'll get back to you as soon as possible.",
    });
  };

  const onClearServerErrors: FormProps["onClearServerErrors"] = () => {
    setServerErrors({
      name: undefined,
      email: undefined,
      phone: undefined,
      message: undefined,
      captcha_token: undefined,
    });
  };

  return (
    <Form onClearServerErrors={onClearServerErrors} onSubmit={onSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <Field
          required
          name="name"
          label="Name"
          serverInvalid={!!serverErrors.name}
          messages={[
            {
              match: "tooShort",
              forceMatch: serverErrors.name === "tooShort",
              message: "Please enter your name",
            },
            {
              match: "valueMissing",
              forceMatch: serverErrors.name === "valueMissing",
              message: "Please enter your name",
            },
          ]}
        >
          <Input />
        </Field>

        <Field
          name="phone"
          label="Phone number"
          serverInvalid={!!serverErrors.phone}
          messages={[
            {
              match: "typeMismatch",
              message: "Please enter a valid phone number",
            },
          ]}
        >
          <Input type="tel" />
        </Field>
      </div>

      <Field
        required
        name="email"
        label="Email address"
        serverInvalid={!!serverErrors.email}
        messages={[
          {
            match: "valueMissing",
            forceMatch: serverErrors.email === "valueMissing",
            message: "Please enter your email address",
          },
          {
            match: "tooShort",
            forceMatch: serverErrors.email === "tooShort",
            message: "Please enter a valid email address",
          },
          {
            match: "typeMismatch",
            forceMatch: serverErrors.email === "typeMismatch",
            message: "Please enter a valid email address",
          },
        ]}
      >
        <Input type="email" />
      </Field>

      <Field
        required
        name="message"
        label="Message"
        serverInvalid={!!serverErrors.message}
        messages={[
          {
            match: "tooShort",
            forceMatch: serverErrors.message === "tooShort",
            message: "Please enter a longer message",
          },
          {
            match: "valueMissing",
            forceMatch: serverErrors.message === "valueMissing",
            message: "Please enter a message",
          },
        ]}
      >
        <TextArea minLength={20} rows={6} />
      </Field>

      <FieldContainer
        required
        name="captcha_token"
        label="Are you human?"
        serverInvalid={!!serverErrors.captcha_token}
        messages={[
          {
            match: "tooShort",
            forceMatch: serverErrors.captcha_token === "tooShort",
            message: "Please confirm if you are human",
          },
          {
            match: "valueMissing",
            forceMatch: serverErrors.captcha_token === "valueMissing",
            message: "Please confirm if you are human",
          },
          {
            match: () => serverErrors.captcha_token === "retry",
            forceMatch: serverErrors.captcha_token === "retry",
            message: "Please reconfirm if you are human",
          },
        ]}
      >
        <CaptchaInput
          required
          action="contact"
          name="captcha_token"
          ref={captchaRef}
        />
      </FieldContainer>

      <div className="flex items-center justify-center">
        <Submit asChild>
          <Button disabled={loading} variant="primary">
            <i
              className={
                loading
                  ? "icon-[ri--refresh-line] animate-spin"
                  : "icon-[ri--mail-send-line]"
              }
            ></i>{" "}
            Send
          </Button>
        </Submit>
      </div>
    </Form>
  );
}
