import { PageHeader } from "@/components/dashboard/PageHeader";
import { AdminLicenseKeysClient } from "@/components/admin/AdminLicenseKeysClient";
import { adminEmail, isAdminEmail } from "@/lib/admin/config";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function AdminPage() {
  const { user } = await getCurrentUser();

  if (!isAdminEmail(user?.email)) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="Acceso restringido." />
        <div className="glass p-5 text-sm leading-6 text-slate-300">
          Este panel solo esta disponible para {adminEmail}.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Llaves Pro de un solo uso." />
      <AdminLicenseKeysClient />
    </>
  );
}
