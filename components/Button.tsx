import Link from "next/link";
import styles from "./Button.module.css";

type CommonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  className?: string;
};

type LinkButtonProps = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

type ActionButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">;

type ButtonProps = LinkButtonProps | ActionButtonProps;

function isLinkButton(props: ButtonProps): props is LinkButtonProps {
  return typeof (props as LinkButtonProps).href === "string";
}

export default function Button(props: ButtonProps) {
  const { children, variant = "primary", fullWidth, className = "" } = props;
  const classes = [styles.btn, variant === "secondary" ? styles.secondary : "", fullWidth ? styles.fullWidth : "", className]
    .filter(Boolean)
    .join(" ");

  if (isLinkButton(props)) {
    return (
      <Link href={props.href} target={props.target} rel={props.rel} className={classes}>
        {children}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children: _children, variant: _variant, fullWidth: _fullWidth, className: _className, ...buttonProps } = props;

  return (
    <button type="button" {...buttonProps} className={classes}>
      {children}
    </button>
  );
}
