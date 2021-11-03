const highlightedAnnouncements : Array<Announcement> = [
  {
    name: 'Live Now',
    img: '/assets/announcements/1-live-now-banner.png',
    imgMobile: '',
    link: '/games/diceInvaders',
    target: null,
    rel: null,
  },
  {
    name: 'Staking 2.0',
    img: '/assets/announcements/2-stake-v2-banner.png',
    imgMobile: '',
    link: '',
    target: null,
    rel: null,
  }
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