import { SITE_URL } from "astro:env/client";
import { useState } from "react";

import { Button } from "~/components/button";
import { Field, Form, type FormProps, Submit } from "~/components/form";
import { Input } from "~/components/input";
import { toast } from "~/components/toast";

export interface CvFormProps {
  id: string;
}

export function CvForm({ id }: CvFormProps) {
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<{
    [key: string]: string | undefined;
  }>({
    company: undefined,
    email: undefined,
    name: undefined,
  });

  const onSubmit: FormProps["onSubmit"] = async (event) => {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;

    let response: Response;
    try {
      response = await fetch(new URL(`/cv/${id}/access`, SITE_URL), {
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        method: "POST",
      });
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
          company: errors.company?.[0],
          email: errors.email?.[0],
          name: errors.name?.[0],
        });
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
      title: "Check your email!",
      description: "I've sent you a link.",
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
        name="company"
        label="Company"
        serverInvalid={!!serverErrors.company}
        messages={[
          {
            match: "tooShort",
            forceMatch: serverErrors.company === "tooShort",
            message: "Please enter your company's name",
          },
          {
            match: "valueMissing",
            forceMatch: serverErrors.company === "valueMissing",
            message: "Please enter your company's name",
          },
        ]}
      >
        <Input />
      </Field>

      <div className="flex items-center justify-center">
        <Submit asChild>
          <Button disabled={loading} variant="primary">
            <i
              className={
                loading
                  ? "icon-[ri--refresh-line] animate-spin"
                  : "icon-[ri--lock-unlock-line]"
              }
            ></i>{" "}
            Open CV
          </Button>
        </Submit>
      </div>
    </Form>
  );
}
