"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { FormSkeleton } from "@/components/Skeleton";
import { VendorForm, explainApiError } from "@/components/VendorForm";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/lib/toast";
import type { Vendor } from "@/lib/types";

export default function EditVendorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "vendor", id],
    queryFn: () => apiFetch<Vendor>(`/admin/vendors/${id}`),
    enabled: !!id,
  });

  const update = useMutation({
    mutationFn: (body: unknown) =>
      apiFetch<Vendor>(`/admin/vendors/${id}`, { method: "PUT", body }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "vendor", id] });
      toast.success(`Vendor “${updated.name}” updated`);
      router.replace("/admin/vendors");
    },
    onError: (err) => {
      const msg = explainApiError(err);
      setError(msg);
      toast.error(msg);
    },
  });

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Edit vendor" subtitle="Loading…" />
        <div className="surface mx-auto max-w-3xl p-7">
          <FormSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit — ${data.name}`}
        subtitle={data.email}
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
          mode="edit"
          defaults={{
            name: data.name,
            email: data.email,
            location: data.location,
            city: data.city,
            state: data.state,
            pin_code: data.pin_code,
          }}
          submitting={update.isPending}
          serverError={error}
          onCancel={() => router.push("/admin/vendors")}
          onSubmit={(values) => {
            setError(null);
            // Strip password fields if blank — server treats them as "no change".
            const payload: Record<string, unknown> = { ...values };
            if (!values.password) {
              delete payload.password;
              delete payload.confirm_password;
            }
            update.mutate(payload);
          }}
        />
      </div>
    </>
  );
}
