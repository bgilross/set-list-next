/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "i.scdn.co",
			},
			{
				protocol: "https",
				hostname: "mosaic.scdn.co",
			},
			{
				protocol: "https",
				hostname: "seeded-session-images.scdn.co",
			},
			// Allow Google Chart API for QR codes on the Profile page
			{
				protocol: "https",
				hostname: "chart.googleapis.com",
			},
		],
	},
}

export default nextConfig
