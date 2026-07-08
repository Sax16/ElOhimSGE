import * as React from "react";

/** Multi-line text field sharing Input's label/hint/error scaffolding. */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  containerStyle?: React.CSSProperties;
}

export declare function Textarea(props: TextareaProps): React.JSX.Element;
