import { MoveLeft } from "lucide-react";
import { useRouter } from "next/router";
import { Button, type ButtonProps } from "~/components/ui/button";

export function BackButton(props: ButtonProps) {
  const router = useRouter();

  return (
    <Button
      {...props}
      variant="ghost"
      onClick={() => {
        router.back();
      }}
    >
      <MoveLeft />
    </Button>
  );
}
