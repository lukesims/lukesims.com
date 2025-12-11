import * as RadixForm from "@radix-ui/react-form";
import { TURNSTILE_SITE_KEY } from "astro:env/client";
import {
  type ComponentProps,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type CaptchaHandle = {
  reset: () => void;
};
export type CaptchaProps = {
  action?: string;
  onError?: (error: string) => void;
  onExpired?: (token: string) => void;
  onSuccess?: (token: string) => void;
  onTimeout?: () => void;
  ref?: Ref<CaptchaHandle>;
};

export function Captcha({
  action,
  onError,
  onExpired,
  onSuccess,
  onTimeout,
  ref,
}: CaptchaProps) {
  const [widgetId, setWidgetId] = useState<string | undefined>();
  const element = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (element.current && !widgetId) {
      const id = turnstile.render(element.current, {
        action,
        sitekey: TURNSTILE_SITE_KEY,

        "response-field": false,
        size: "flexible",
        theme: "light",

        callback: onSuccess,
        "error-callback": onError,
        "expired-callback": onExpired,
        "timeout-callback": onTimeout,
      });
      if (id) {
        setWidgetId(id);
      }
    }
    return () => {
      if (element.current && widgetId) {
        turnstile.remove(widgetId);
      }
    };
  }, [element]);

  useImperativeHandle(ref, () => {
    return {
      reset() {
        if (widgetId) {
          turnstile.reset(widgetId);
        }
      },
    };
  }, [widgetId]);

  return <div ref={element} className="border-border h-17.25 border-2" />;
}

export type CaptchaInputProps = CaptchaProps &
  Omit<ComponentProps<typeof RadixForm.Control>, "ref">;

export function CaptchaInput({
  action,
  onError,
  onExpired,
  onSuccess,
  onTimeout,
  ref,
  ...inputProps
}: CaptchaInputProps) {
  const [value, setValue] = useState("");
  return (
    <>
      <RadixForm.Control
        aria-hidden="true"
        className="hidden"
        value={value}
        {...inputProps}
      />
      <Captcha
        action={action}
        onError={onError}
        onExpired={onExpired}
        onTimeout={onTimeout}
        onSuccess={(token) => {
          setValue(token);
          if (onSuccess) onSuccess(token);
        }}
        ref={ref}
      />
    </>
  );
}
