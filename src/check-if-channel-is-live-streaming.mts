import { Innertube, YTNodes } from 'youtubei.js/web'

const youtube = await Innertube.create()

const youtubeHandler = '@xxhacucoxx_Celestial'

const youtubeChannelUrl = `https://www.youtube.com/${youtubeHandler}`
const url = await youtube.resolveURL(youtubeChannelUrl)

const channelId = url.payload.browseId

if (!channelId) {
  throw new Error('cannot find channel id')
}

const channel = await youtube.getChannel(channelId)

const liveStreams = await channel.getLiveStreams()

const contents = liveStreams.current_tab?.content?.as(YTNodes.RichGrid).contents

const currentLiveStream = contents?.filter((item) => {
  if (!item.is(YTNodes.RichItem)) {
    return false
  }

  try {
    return item.as(YTNodes.RichItem).content.as(YTNodes.Video).duration.text === 'LIVE'
  } catch (error) {
    return false
  }
})

const isLive = (currentLiveStream ?? []).length > 0

console.log({ currentLiveStream, isLive })
