import { SITE_URL } from "astro:env/client";
import { useRef, useState } from "react";

import { Button } from "~/components/button";
import { type CaptchaHandle, CaptchaInput } from "~/components/captcha";
import {
  FieldContainer,
  Form,
  type FormProps,
  Submit,
} from "~/components/form";
import { toast } from "~/components/toast";

export interface CvFormProps {
  id: string;
}

export function CvForm({ id }: CvFormProps) {
  const captchaRef = useRef<CaptchaHandle | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<{
    [key: string]: string | undefined;
  }>({
    captcha_token: undefined,
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
    window.location.href = await response.text();
  };

  const onClearServerErrors: FormProps["onClearServerErrors"] = () => {
    setServerErrors({
      captcha_token: undefined,
    });
  };

  return (
    <Form onClearServerErrors={onClearServerErrors} onSubmit={onSubmit}>
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
