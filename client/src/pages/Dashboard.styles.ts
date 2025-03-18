export const styles = {
	container:
		"min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90",
	content: "container mx-auto max-w-5xl p-6",
	header: "mb-8",
	title: "text-3xl font-bold tracking-tight",
	welcome: "mt-2 text-muted-foreground",
	card: "rounded-lg border bg-card shadow-sm p-6",
	loadingContainer: "flex min-h-screen items-center justify-center",
	loadingText: "text-lg text-muted-foreground",
	sectionTitle: "text-2xl font-semibold mb-4",
} as const;
