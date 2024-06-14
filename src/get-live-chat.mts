import { Innertube, YTNodes } from 'youtubei.js/web'

const youtube = await Innertube.create()

const videoId = 'FXMjUq9YqS8'
const video = await youtube.getInfo(videoId)

console.log(video)

const livechat = video.getLiveChat()
const now = new Date().toISOString().split('.')[0].replaceAll(':', '-').replace('T', '-')
const file = Bun.file(`output-${now}.jsonl`)
const writer = file.writer()

livechat.once('start', (initialData) => {
  // console.log('once start', initialData)

  livechat.applyFilter('LIVE_CHAT')
})

livechat.on('start', (initialData) => {
  // console.log('on start', initialData)

  /**
   * Initial info is what you see when you first open a a live chat — this is; initial actions (pinned messages, top donations..), account's info and so forth.
   */
  console.info(`Hey ${initialData.viewer_name || 'Guest'}, welcome to Live Chat!`)

  const pinned_action = initialData.actions.firstOfType(YTNodes.AddBannerToLiveChatCommand)

  if (pinned_action) {
    if (pinned_action.banner?.contents?.is(YTNodes.LiveChatTextMessage)) {
      console.info(
        '\n',
        'Pinned message:\n',
        pinned_action.banner.contents.author?.name.toString(),
        '-',
        pinned_action?.banner.contents.message.toString(),
        '\n',
      )
    }
  }
})

livechat.on('error', (error) => console.info('Live chat error:', error))

livechat.on('end', () => {
  console.info('This live stream has ended.')
  livechat.stop()
  writer.end()
})

livechat.on('chat-update', (chatAction) => {
  writer.write(JSON.stringify(chatAction, null, 2))
  writer.write('\n\n')

  // if (chatAction.is(YTNodes.ReplayChatItemAction)) {
  //   const actions = chatAction.actions
  //   actions.forEach((action) => {
  //     if (action.is(YTNodes.AddChatItemAction)) {
  //       const item = action.item

  //       switch (item.type) {
  //         case YTNodes.LiveChatTextMessage.type:
  //         case 'LiveChatSponsorshipsGiftRedemptionAnnouncement':
  //           break
  //         default:
  //           console.log(item)
  //           break
  //       }
  //     }
  //   })
  // } else {
  //   console.log((chatAction as any)?.item?.message?.text)
  // }
})

livechat.on('metadata-update', (metadata) => {
  // console.log(metadata)
})

livechat.start()

// console.log(livechat)
