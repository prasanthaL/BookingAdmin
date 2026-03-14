import * as React from "react";

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="mb-1 block text-sm font-medium text-zinc-700" {...props} />;
}
