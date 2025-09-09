import PublicAudienceView from "@/components/PublicAudienceView"

export default function AudiencePage({ params }) {
	const { slug } = params
	return <PublicAudienceView slug={slug} />
}
