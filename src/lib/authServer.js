import { prisma } from "./prismaClient"

// Temporary: get firebaseUid from header (x-artist-id) until Firebase ID token verification is added
export async function getCurrentUser(req) {
	const firebaseUid = req.headers.get("x-artist-id")
	if (!firebaseUid) return null
	const user = await prisma.user.findUnique({ where: { firebaseUid } })
	return user
}

export async function ensureUser(
	firebaseUid,
	{ displayName, photoURL, role } = {}
) {
	if (!firebaseUid) throw new Error("firebaseUid required")
	const data = {}
	if (displayName) data.displayName = displayName
	if (photoURL !== undefined) data.photoURL = photoURL
	// Only set role on create unless explicitly passed
	return prisma.user.upsert({
		where: { firebaseUid },
		update: role ? { ...data, role } : data,
		create: {
			firebaseUid,
			displayName: displayName || "User",
			photoURL: photoURL || null,
			role: role || "AUDIENCE",
		},
	})
}

export function requireRole(user, roles) {
	if (!user || !roles.includes(user.role)) {
		const err = new Error("Forbidden")
		err.status = 403
		throw err
	}
}

export async function ensureArtistAccess(firebaseUid, displayName) {
	// Ensure user exists (AUDIENCE by default). Do not promote automatically.
	const user = await ensureUser(firebaseUid, { displayName })
	if (user.role !== "ARTIST" && user.role !== "ADMIN") {
		const err = new Error("Forbidden")
		err.status = 403
		throw err
	}
	// Ensure Artist profile exists for artist users
	const artist = await prisma.artist.upsert({
		where: { firebaseUid },
		update: { displayName },
		create: { firebaseUid, displayName },
	})
	return { user, artist }
}

export async function promoteToArtist(firebaseUid, displayName) {
	// Explicitly promote a user to ARTIST and create Artist profile
	await ensureUser(firebaseUid, { displayName, role: "ARTIST" })
	const artist = await prisma.artist.upsert({
		where: { firebaseUid },
		update: { displayName },
		create: { firebaseUid, displayName },
	})
	return artist
}
