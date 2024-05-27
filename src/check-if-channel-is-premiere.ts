import { Innertube, YTNodes } from 'youtubei.js'
const youtube = await Innertube.create()

const youtubeHandler = '@Bismuth9'

const youtubeChannelUrl = `https://www.youtube.com/${youtubeHandler}`
const url = await youtube.resolveURL(youtubeChannelUrl)

const channelId = url.payload.browseId

if (!channelId) {
  throw new Error('cannot find channel id')
}

const channel = await youtube.getChannel(channelId)

const videos = await channel.getVideos()

const contents = videos.current_tab?.content?.as(YTNodes.RichGrid).contents

const currentPremiereVideos = contents?.filter((content) => {
  if (!content.is(YTNodes.RichItem)) {
    return false
  }

  if (!content.content.is(YTNodes.Video)) {
    return false
  }

  try {
    const thumbnailOverlayTimeStatus = content.content.thumbnail_overlays.filter(
      (overlayItem): overlayItem is YTNodes.ThumbnailOverlayTimeStatus =>
        overlayItem.is(YTNodes.ThumbnailOverlayTimeStatus),
    )

    return thumbnailOverlayTimeStatus.some((status) => status.text === 'PREMIERE')
  } catch (error) {
    return false
  }
})

const isPremiere = (currentPremiereVideos ?? []).length > 0

console.log({ currentPremiereVideos, isPremiere })
