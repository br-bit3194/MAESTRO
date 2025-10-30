import { SidebarDemo } from "@/components/ui/sidebar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="h-screen flex flex-col">
        <SidebarDemo />
      </div>
    </div>
  );
}
