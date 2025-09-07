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
		],
	},
}

export default nextConfig
