import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Form } from "@/models/Form";
import SheetEditor from "@/components/sheet-editor/SheetEditor";

export default async function SheetEditorPage({
  params,
}: {
  params: { formId: string };
}) {
  const session = await getSession();
  if (!session?.user?.email) redirect("/login");

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) redirect("/login");

  const form = await Form.findOne({ formId: params.formId, userId: user._id });
  if (!form) notFound();

  return (
    <SheetEditor
      formId={form.formId}
      formTitle={form.title}
      initialHeaders={form.sheetHeaders}
      initialStyling={form.styling}
    />
  );
}
