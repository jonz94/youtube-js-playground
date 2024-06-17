import type { YTNodes } from 'youtubei.js'

export function getAuthorNameFromLiveChatBannerRedirect(banner: YTNodes.LiveChatBannerRedirect) {
  const textOfRuns = banner.banner_message.runs?.map((run) => run.toString())

  return textOfRuns?.at(0)
}
