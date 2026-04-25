import { connectDB } from "@/lib/mongodb";
import { Form } from "@/models/Form";
import { notFound } from "next/navigation";
import PublicFormClient from "./PublicFormClient";

export default async function PublicFormPage({
  params,
}: {
  params: { formId: string };
}) {
  await connectDB();
  const form = await Form.findOne({ formId: params.formId, isActive: true }).lean();
  if (!form) notFound();

  return <PublicFormClient form={JSON.parse(JSON.stringify(form))} />;
}
