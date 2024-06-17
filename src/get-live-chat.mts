import { resolve } from 'node:path'
import { Innertube, YTNodes } from 'youtubei.js/web'
import Cache from './cache.mts'
import { getAuthorNameFromLiveChatBannerRedirect } from './utils.mts'

const youtube = await Innertube.create({
  cache: new Cache(true, resolve(import.meta.dirname, '..', '.cache')),
})

console.log('is logged in?', youtube.session.logged_in)

// Fired when waiting for the user to authorize the sign in attempt.
youtube.session.on('auth-pending', (data) => {
  console.log(`Go to ${data.verification_url} in your browser and enter code ${data.user_code} to authenticate.`)
})

// Fired when authentication is successful.
youtube.session.on('auth', ({ credentials }) => {
  // console.log('Sign in successful:', credentials)
})

// Fired when the access token expires.
youtube.session.on('update-credentials', async ({ credentials }) => {
  console.log('Credentials updated:', credentials)
  await youtube.session.oauth.cacheCredentials()
})

await youtube.session.signIn()

// You may cache the session for later use
// If you use this, the next call to signIn won't fire 'auth-pending' instead just 'auth'.
await youtube.session.oauth.cacheCredentials()

// Sign out of the session
// this will also remove the cached credentials
// await youtube.session.signOut()

console.log('is logged in?', youtube.session.logged_in)

const videoId = '4nDqiDS4Rus'

const video = await youtube.getInfo(videoId)

const livechat = video.getLiveChat()

livechat.once('start', (initialData) => {
  // console.log('once start', initialData)
  livechat.applyFilter('LIVE_CHAT')
})

livechat.on('start', (initialData) => {
  // console.log('on start', initialData)
  /**
   * Initial info is what you see when you first open a a live chat — this is; initial actions (pinned messages, top donations..), account's info and so forth.
   */
  // console.info(`Hey ${initialData.viewer_name || 'Guest'}, welcome to Live Chat!`)
  // const pinned_action = initialData.actions.firstOfType(YTNodes.AddBannerToLiveChatCommand)
  // if (pinned_action) {
  //   if (pinned_action.banner?.contents?.is(YTNodes.LiveChatTextMessage)) {
  //     console.info(
  //       '\n',
  //       'Pinned message:\n',
  //       pinned_action.banner.contents.author?.name.toString(),
  //       '-',
  //       pinned_action?.banner.contents.message.toString(),
  //       '\n',
  //     )
  //   }
  // }
})

livechat.on('error', (error) => console.info('Live chat error:', error))

livechat.on('end', () => {
  console.info('This live stream has ended.')
  livechat.stop()
})

livechat.on('chat-update', (chatAction) => {
  if (chatAction.is(YTNodes.AddBannerToLiveChatCommand)) {
    const content = chatAction.banner?.contents

    if (!content) {
      return
    }

    if (content.is(YTNodes.LiveChatBannerRedirect)) {
      const banner = content.as(YTNodes.LiveChatBannerRedirect)

      const authorName = getAuthorNameFromLiveChatBannerRedirect(banner)

      livechat.sendMessage(`「${authorName}」和他們的觀眾剛剛加入。打聲招呼吧！`)
    }
  }

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
