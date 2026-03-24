"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Typography from "../Typography";

interface BackButtonProps {
  href?: string;
  label?: string;
}

const BackButton = ({ href, label = "" }: BackButtonProps) => {
  const router = useRouter();

  return (
    <Button
      variant="link"
      className="!px-0"
      icon={<i className="ri-arrow-left-line" />}
      color="neutral"
      onClick={() => (href ? router.push(href) : router.back())}
    >
      <Typography className="text-neutral-900" variant="paragraph-small">
        {label}
      </Typography>
    </Button>
  );
};

export default BackButton;
