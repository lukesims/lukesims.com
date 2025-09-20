import { SITE_URL } from "astro:env/client";
import { useState } from "react";

import { Button } from "~/components/button";
import { Field, Form, type FormProps, Submit } from "~/components/form";
import { Input } from "~/components/input";
import { TextArea } from "~/components/textarea";
import { toast } from "~/components/toast";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<{
    [key: string]: string | undefined;
  }>({
    name: undefined,
    email: undefined,
    phone: undefined,
    message: undefined,
  });

  const onSubmit: FormProps["onSubmit"] = async (event) => {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;
    let response: Response;

    try {
      response = await fetch(new URL("/contact/send", SITE_URL), {
        body: new FormData(form),
        method: "POST",
      });
    } catch (err) {
      toast({
        title: "Internal Error",
        description: "Please try again later.",
        icon: "icon-[ri--error-warning-line]",
        variant: "danger",
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
        });
      } else {
        toast({
          title: "Internal Error",
          description: "Please try again later.",
          icon: "icon-[ri--error-warning-line]",
          variant: "danger",
        });
      }
      setLoading(false);
      return;
    }

    form.reset();
    setLoading(false);
    toast({
      title: "Sent!",
      description: "I'll get back to you as soon as possible.",
      icon: "icon-[ri--thumb-up-line]",
      variant: "success",
    });
  };

  const onClearServerErrors: FormProps["onClearServerErrors"] = () => {
    setServerErrors({
      name: undefined,
      email: undefined,
      phone: undefined,
      message: undefined,
    });
  };

  return (
    <Form onClearServerErrors={onClearServerErrors} onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-6">
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
        <TextArea minLength={20} rows={4} />
      </Field>

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
