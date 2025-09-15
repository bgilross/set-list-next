import Link from "next/link"
import { prisma } from "@/lib/prismaClient"

export const revalidate = 10

export default async function UsersPage() {
	// Find artists who currently have a public active setlist
	const artists = await prisma.artist.findMany({
		where: {
			setlists: { some: { isActive: true, isPublic: true } },
		},
		include: { setlists: { where: { isActive: true }, take: 1 } },
		orderBy: { updatedAt: "desc" },
	})

	return (
		<div className="max-w-4xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Live Artists</h1>
			{artists.length === 0 && <p>No live artists right now.</p>}
			<ul className="space-y-3">
				{artists.map((a) => (
					<li
						key={a.id}
						className="p-3 border rounded bg-white flex justify-between items-center"
					>
						<div>
							<div className="font-semibold">{a.displayName}</div>
							<div className="text-sm text-gray-500">
								{a.publicBlurb || "No blurb"}
							</div>
						</div>
						<div>
							<Link
								href={`/a/${a.slug}`}
								className="px-3 py-1 bg-blue-600 text-white rounded"
							>
								View Audience
							</Link>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}
