export async function parseM3U8(
  m3u8Text: string,
  currentUrl: string,
): Promise<string[]> {
  const lines = m3u8Text.split('\n').map((l) => l.trim());

  if (m3u8Text.includes('#EXT-X-STREAM-INF')) {
    let subM3u8Url: string | null = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i] && !lines[i].startsWith('#')) {
        subM3u8Url = lines[i].startsWith('http')
          ? lines[i]
          : new URL(lines[i], currentUrl).href;
        break;
      }
    }
    if (!subM3u8Url) throw new Error('error occured while handling m3u8 url');
    const res = await fetch(subM3u8Url);
    return parseM3U8(await res.text(), subM3u8Url);
  }

  const mediaUrls: string[] = [];
  let initUrl: string | null = null;
  const mapRegex = /URI=["']([^"']+)["']/;

  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith('#EXT-X-MAP')) {
      const match = mapRegex.exec(line);
      if (match?.[1]) {
        initUrl = match[1].startsWith('http')
          ? match[1]
          : new URL(match[1], currentUrl).href;
      }
    }
    if (!line.startsWith('#')) {
      mediaUrls.push(
        line.startsWith('http') ? line : new URL(line, currentUrl).href,
      );
    }
  }
  if (initUrl) mediaUrls.unshift(initUrl);
  return mediaUrls;
}

export async function startDownload(
  m3u8Url: string,
  onStatusChange: (status: string) => void,
) {
  if (!m3u8Url.trim()) return;
  onStatusChange('다운로드중...');

  try {
    const response = await fetch(m3u8Url);
    const mediaUrls = await parseM3U8(await response.text(), m3u8Url);
    const chunkBuffers: ArrayBuffer[] = [];

    for (const url of mediaUrls) {
      const chunkResponse = await fetch(url, { credentials: 'include' });
      chunkBuffers.push(await chunkResponse.arrayBuffer());
    }

    const finalBlob = new Blob(chunkBuffers, { type: 'video/mp4' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(finalBlob);
    downloadLink.download = `m3u8_download_${Date.now()}.mp4`;
    downloadLink.click();
    onStatusChange('다운로드 완료');
  } catch (error) {
    console.error(error);
    onStatusChange('오류 발생');
  }
}
