import {
  Turnstile as ReactTurnstile,
  type TurnstileInstance,
} from "@marsidev/react-turnstile";
import { PUBLIC_TURNSTILE_SITE_KEY } from "astro:env/client";
import type { ComponentProps } from "react";

export type { TurnstileInstance };
export type TurnstileProps = Omit<
  ComponentProps<typeof ReactTurnstile>,
  "siteKey"
>;

export function Turnstile({ options, ...props }: TurnstileProps) {
  return (
    <div className="border-border h-[69px] border-2">
      <ReactTurnstile
        siteKey={PUBLIC_TURNSTILE_SITE_KEY}
        options={{
          appearance: "always",
          execution: "render",
          language: "en",
          responseField: true,
          responseFieldName: "captcha_token",
          size: "flexible",
          theme: "light",
          ...options,
        }}
        {...props}
      />
    </div>
  );
}
