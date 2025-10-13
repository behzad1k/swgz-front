const fetchImageByMBID = (mbid: string, sizes: string) => {
  const mainUrl = `https://coverartarchive.org/release/${mbid}`
  return `${mainUrl}/front-${sizes[0]}` || `${mainUrl}/front-${sizes[1]}` || `${mainUrl}/front-${sizes[2]}` || `${mainUrl}/front-${sizes[3]}` || `${mainUrl}/front-${sizes[4]}` ||
         `${mainUrl}/back-${sizes[0]}` || `${mainUrl}/back-${sizes[1]}` || `${mainUrl}/back-${sizes[2]}` || `${mainUrl}/back-${sizes[3]}` || `${mainUrl}/back-${sizes[4]}`
}
const imageSizes = ['large', '1000', '500', '250', 'small']
export const fetchSmallImageByMBID = (mbid: string) => fetchImageByMBID(mbid, imageSizes.reverse())
export const fetchLargeImageByMBID = (mbid: string) => fetchImageByMBID(mbid, imageSizes)