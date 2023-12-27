import { ModalProvider } from "@/components/providers/modal-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";

const PlatformLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <main>
        <Toaster />
        <ModalProvider />
        {children}
      </main>
    </QueryProvider>
  );
};

export default PlatformLayout;
