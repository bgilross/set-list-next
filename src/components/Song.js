import React from "react"
import { CardContent, Typography, CardMedia, Box } from "@mui/material"
import ScrollableText from "./ScrollableText"

const Song = ({ song }) => {
	return (
		<Box className="flex items-center bg-green-100 w-full group group-hover:bg-green-400 rounded-r-lg">
			<CardMedia
				component="img"
				image={song.album.images[1].url}
				alt={`${song.album.name} cover`}
				sx={{
					width: 100,
					height: 100,
					borderRadius: "8px",
					// marginRight: 2, // Space between image and text
				}}
			/>
			<CardContent className="rounded-r-lg">
				<ScrollableText text={song.name} />
				<ScrollableText text={song.artists[0].name} />
				<ScrollableText text={song.album.name} /> -{" "}
				{new Date(song.album.release_date).getFullYear()}
			</CardContent>
		</Box>
	)
}

export default Song
