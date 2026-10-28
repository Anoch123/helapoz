import { Button } from "@workspace/ui";

export default function DashboardScreen() {
    return (
        <main className="flex min-h-screen items-center justify-center gap-4">
      <Button>Shared Button</Button>
      <Button variant="outline">Outline Button</Button>
    </main>
    )
}