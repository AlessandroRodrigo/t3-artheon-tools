import { UserButton } from "@clerk/nextjs";
import { type ComponentProps } from "react";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-primary p-4">
      <h1 className="text-2xl font-bold text-white">Artheon</h1>

      <UserButton />
    </nav>
  );
}

export function withNavbar(Component: React.ComponentType) {
  return function WithNavbar(props: ComponentProps<typeof Component>) {
    return (
      <>
        <Navbar />
        <Component {...props} />
      </>
    );
  };
}
