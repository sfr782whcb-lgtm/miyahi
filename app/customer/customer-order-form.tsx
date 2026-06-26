"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { customerCreateOrderAction } from "@/app/actions/orders";
import { buttonPrimaryClassName, inputClassName, selectClassName } from "@/lib/constants";

type Product = { id: string; name: string; price: number; sizeLiters: number };

export default function CustomerOrderForm({
  products,
  defaultName,
  defaultPhone,
  defaultAddress,
  defaultArea,
}: {
  products: Product[];
  defaultName: string;
  defaultPhone: string;
  defaultAddress?: string;
  defaultArea?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [productId, setProductId] = useState(products[0]?.id ?? "");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await customerCreateOrderAction(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("تم إرسال الطلب");
        router.refresh();
      }
    });
  }

  return (
    <form action={handleSubmit} className="mb-8 space-y-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900">طلب جديد</h3>
      <input name="customerName" defaultValue={defaultName} required className={inputClassName} />
      <input name="phone" defaultValue={defaultPhone} dir="ltr" required className={inputClassName} />
      <input name="address" defaultValue={defaultAddress} required className={inputClassName} />
      <input name="area" defaultValue={defaultArea} required className={inputClassName} />
      <input name="bottles" type="number" min={1} defaultValue={1} dir="ltr" required className={inputClassName} />
      <select name="productId" value={productId} onChange={(e) => setProductId(e.target.value)} required className={selectClassName}>
        {products.map((p) => (
          <option key={p.id} value={p.id}>{p.name} — {p.price} دينار</option>
        ))}
      </select>
      <button type="submit" disabled={isPending} className={`w-full ${buttonPrimaryClassName}`}>
        {isPending ? "جاري الإرسال..." : "إرسال الطلب"}
      </button>
    </form>
  );
}
