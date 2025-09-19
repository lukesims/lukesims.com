import QRCodeStyling, { type DrawType, type Options } from "qr-code-styling";
import { useEffect, useRef } from "react";

import logo from "../images/logo/stacked.svg";

export interface QRCodeProps {
  bgColor?: string;
  className?: string;
  data?: Options["data"];
  dotColor?: string;
  height?: Options["height"];
  margin?: Options["margin"];
  width?: Options["width"];
}

export function QRCode({
  bgColor = "#fbbf24",
  className,
  data,
  dotColor = "#000",
  height = 300,
  margin = 0,
  width = 300,
}: QRCodeProps) {
  const options: Options = {
    data,
    height,
    image: logo.src,
    margin,
    shape: "square",
    type: "svg" as DrawType,
    width,

    backgroundOptions: {
      color: bgColor,
    },

    cornersDotOptions: {
      color: "#000",
      type: "dot",
    },

    cornersSquareOptions: {
      color: dotColor,
      type: "square",
    },

    dotsOptions: {
      color: dotColor,
      type: "square",
    },

    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.45,
      margin: 2,
    },
  };

  const element = useRef<HTMLDivElement>(null);
  const qr = useRef<QRCodeStyling>(null);

  useEffect(() => {
    if (!element.current) return;
    if (qr.current) {
      qr.current.update(options);
    } else {
      qr.current = new QRCodeStyling(options);
      qr.current.append(element.current);
    }
  }, [bgColor, data, dotColor, element, height, margin, width]);

  return <div ref={element} className={className} />;
}
