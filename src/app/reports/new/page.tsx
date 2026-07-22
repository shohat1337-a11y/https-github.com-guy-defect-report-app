import PageHeader from "@/components/PageHeader";
import ReportForm from "@/components/ReportForm";

export default function NewReportPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-6">
      <PageHeader title="פתיחת דוח חדש" backHref="/" />
      <ReportForm mode="create" />
    </div>
  );
}
