import {
  type ComponentProps,
  type MouseEventHandler,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "~/components/button";
import { cn } from "~/utils/styles";

export interface CopyButtonProps extends ComponentProps<typeof Button> {
  /** The text to copy to the user's clipboard when the button is clicked. */
  copyText: string;
  /** Overrides the default content displayed inside the button. */
  defaultContent?: ReactNode;
  /** Overrides the content displayed inside the button when the copy action is successful. */
  successContent?: ReactNode;
}

/**
 * A button that copies text to the user's clipboard when clicked.
 *
 * Inherits all of the props of the underlying Button component.
 */
export function CopyButton({
  children: childrenProp,
  copyText,
  defaultContent,
  successContent,
  ...props
}: CopyButtonProps) {
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const onClick: MouseEventHandler = async (event) => {
    event.preventDefault();

    if (!copyText?.trim()) return;
    if (!navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(copyText);

    setRecentlySuccessful(true);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setRecentlySuccessful(false);
    }, 2000);
  };

  let children: ReactNode;
  // Children nested inside the componennt in the markup have highest priority
  if (childrenProp) children = childrenProp;
  // If children are provided via defaultContent/successContent props, use those next
  else if (defaultContent && successContent) {
    children = recentlySuccessful ? successContent : defaultContent;
  }
  // Otherwise use the default content: an icon that changes upon successful copy
  else {
    children = (
      <span
        className={cn(
          recentlySuccessful
            ? "icon-[ri--check-fill]"
            : "icon-[ri--clipboard-fill]",
          "size-4!",
        )}
      />
    );
  }

  return (
    <Button type="button" onClick={onClick} {...props}>
      {children}
    </Button>
  );
}
