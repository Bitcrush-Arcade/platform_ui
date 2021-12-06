const highlightedAnnouncements : Array<Announcement> = [
  {
    name: 'Live Now',
    img: '/assets/announcements/1-live-now-banner.png',
    imgMobile: '/assets/announcements/1-live-now-mobile.png',
    link: '/games/diceInvaders',
    target: null,
    rel: null,
  },
  {
    name: 'Staking 2.0',
    img: '/assets/announcements/2-stake-v2-banner.png',
    imgMobile: '/assets/announcements/2-stake-v2-mobile.png',
    link: '/mining',
    target: null,
    rel: null,
  },
  {
    name: 'Knightswap Partnership',
    img: '/assets/announcements/4-knightswap-banner.png',
    imgMobile: '/assets/announcements/4-knightswap-mobile.png',
    link: 'https://app.knightswap.financial/farms',
    target: "_blank",
    rel: "noopener nonreferrer",
  },
]

export const height= 310
export const width = 1080
export const mobileWidth = 300 /1.1
export const mobileHeight = 250 / 1.1

export default highlightedAnnouncements

type Announcement = {
  name: string,
  img: string,
  imgMobile: string,
  link: string,
  target: HTMLAnchorElement['target'] | null,
  rel: HTMLAnchorElement['rel'] | null
}