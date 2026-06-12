"use server";

import { assertAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createInvoiceAction(data: { clientName: string, amount: number, dueDate?: Date | null }) {
  await assertAuthenticated();
  // Find highest invoice number
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  
  let nextNumber = 1;
  if (lastInvoice && lastInvoice.invoiceNo.startsWith('INV-')) {
    const numPart = parseInt(lastInvoice.invoiceNo.replace('INV-', ''));
    if (!isNaN(numPart)) nextNumber = numPart + 1;
  }
  
  const invoiceNo = `INV-${nextNumber.toString().padStart(3, '0')}`;

  await prisma.invoice.create({
    data: {
      invoiceNo,
      clientName: data.clientName,
      amount: data.amount,
      dueDate: data.dueDate,
    },
  });
  revalidatePath("/admin/finance");
}

export async function updateInvoiceStatusAction(id: string, status: string) {
  await assertAuthenticated();
  await prisma.invoice.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/finance");
}

export async function deleteInvoiceAction(id: string) {
  await assertAuthenticated();
  await prisma.invoice.delete({
    where: { id },
  });
  revalidatePath("/admin/finance");
}
