"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { VendorForm, explainApiError } from "@/components/VendorForm";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/lib/toast";
import type { Vendor } from "@/lib/types";

export default function NewVendorPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (body: unknown) =>
      apiFetch<Vendor>("/admin/vendors", { method: "POST", body }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
      toast.success(`Vendor “${data.name}” created`);
      router.replace("/admin/vendors");
    },
    onError: (err) => {
      const msg = explainApiError(err);
      setError(msg);
      toast.error(msg);
    },
  });

  return (
    <>
      <PageHeader
        title="New vendor"
        subtitle="Creates a user + vendor record in one transaction."
        actions={
          <button
            type="button"
            className="pill-ghost"
            onClick={() => router.push("/admin/vendors")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to vendors
          </button>
        }
      />
      <div className="surface mx-auto max-w-3xl p-7 animate-fadeInUp">
        <VendorForm
          mode="create"
          submitting={create.isPending}
          serverError={error}
          onCancel={() => router.push("/admin/vendors")}
          onSubmit={(values) => {
            setError(null);
            create.mutate(values);
          }}
        />
      </div>
    </>
  );
}
