import { Innertube } from 'youtubei.js'

export async function createInnertube() {
  return Innertube.create({
    fetch(url, init) {
      return fetch(url, init)
    },
  })
}
