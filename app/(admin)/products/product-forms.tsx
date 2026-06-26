"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { createProductAction, toggleProductAction } from "@/app/actions/products";
import { buttonPrimaryClassName, inputClassName, selectClassName } from "@/lib/constants";

type Product = {
  id: string;
  name: string;
  sizeLiters: number;
  price: number;
  isActive: boolean;
};

export function AddProductForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createProductAction(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("تم إضافة المنتج");
        router.refresh();
      }
    });
  }

  return (
    <form action={handleSubmit} className="mb-6 grid gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:grid-cols-2">
      <h3 className="font-semibold text-gray-900 sm:col-span-2">إضافة منتج</h3>
      <input name="name" placeholder="اسم المنتج" required className={inputClassName} />
      <select name="sizeLiters" required className={selectClassName} defaultValue="20">
        <option value="20">20 لتر</option>
        <option value="10">10 لتر</option>
      </select>
      <input name="price" type="number" step="0.5" min="0" placeholder="السعر" required className={inputClassName} />
      <button type="submit" disabled={isPending} className={buttonPrimaryClassName}>
        {isPending ? "جاري الحفظ..." : "حفظ المنتج"}
      </button>
    </form>
  );
}

export function ProductToggle({ product }: { product: Product }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const formData = new FormData();
    formData.set("id", product.id);
    formData.set("isActive", String(!product.isActive));
    startTransition(async () => {
      const result = await toggleProductAction(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success(product.isActive ? "تم إيقاف المنتج" : "تم تفعيل المنتج");
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={toggle}
      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium ${product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
    >
      {product.isActive ? "نشط" : "متوقف"}
    </button>
  );
}
