import { PageHeader } from "@/components/dashboard/PageHeader";
import { ApiVaultClient } from "@/components/vault/ApiVaultClient";

export default function ApiVaultPage() {
  return (
    <>
      <PageHeader eyebrow="API Vault" title="Keys privadas, cifradas y fuera del navegador." />
      <ApiVaultClient />
    </>
  );
}
