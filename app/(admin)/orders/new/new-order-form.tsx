"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createOrderAction } from "@/app/actions/orders";
import { buttonPrimaryClassName, inputClassName, selectClassName } from "@/lib/constants";

type Driver = { id: string; name: string };
type Product = { id: string; name: string; sizeLiters: number; price: number };

export default function NewOrderForm({
  drivers,
  products,
}: {
  drivers: Driver[];
  products: Product[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [productId, setProductId] = useState(products[0]?.id ?? "");

  const selectedProduct = products.find((p) => p.id === productId);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createOrderAction(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("تم إنشاء الطلب بنجاح");
      router.push("/orders");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="animate-fade-in space-y-5">
      <div>
        <label htmlFor="customerName" className="mb-2 block text-sm font-medium text-gray-700">اسم الزبون</label>
        <input id="customerName" name="customerName" required className={inputClassName} />
      </div>
      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">رقم الهاتف</label>
        <input id="phone" name="phone" type="tel" dir="ltr" required className={inputClassName} />
      </div>
      <div>
        <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700">العنوان</label>
        <input id="address" name="address" required className={inputClassName} />
      </div>
      <div>
        <label htmlFor="area" className="mb-2 block text-sm font-medium text-gray-700">المنطقة</label>
        <input id="area" name="area" required className={inputClassName} />
      </div>
      <div>
        <label htmlFor="bottles" className="mb-2 block text-sm font-medium text-gray-700">عدد القوارير</label>
        <input id="bottles" name="bottles" type="number" min={1} dir="ltr" required className={inputClassName} />
      </div>
      <div>
        <label htmlFor="productId" className="mb-2 block text-sm font-medium text-gray-700">المنتج</label>
        <select
          id="productId"
          name="productId"
          required
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className={selectClassName}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.price} دينار
            </option>
          ))}
        </select>
        {selectedProduct && (
          <p className="mt-1 text-sm text-gray-500">سعر الوحدة: {selectedProduct.price} دينار</p>
        )}
      </div>
      <div>
        <label htmlFor="driverId" className="mb-2 block text-sm font-medium text-gray-700">اختيار السائق</label>
        <select id="driverId" name="driverId" defaultValue="" className={selectClassName}>
          <option value="">بدون سائق (جديد)</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={isPending} className={`w-full ${buttonPrimaryClassName}`}>
        {isPending ? "جاري الحفظ..." : "تأكيد الطلب"}
      </button>
    </form>
  );
}
