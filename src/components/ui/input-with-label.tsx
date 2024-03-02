import { Label } from "@radix-ui/react-label";
import { Input, type InputProps } from "~/components/ui/input";

type Props = {
  label: string;
  description?: string;
  id: string;
} & InputProps;

export function InputWithLabel({ id, label, description, ...props }: Props) {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <Input id={id} {...props} />
    </div>
  );
}
