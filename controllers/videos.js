/**
 * Video controllers
 * @author Najam Ul Saqib
 */
const fs = require('fs');

exports.videoStream = (req, res) => {
  let { dir, video } = req.params;

  // Create path from the parameters we got from the request
  const videoPath = `${dir}/${video}`;

  //   If requested format is not supported, return error
  if (!video.match(/\.(mp4|mpeg|mov)$/)) {
    return res.status(400).json({ success: false, message: 'Video video format is not supported' });
  }
  //   If requested video is not found, return error
  else if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  // Ensure there is a range given for the video
  const range = req.headers.range || 'bytes=0-';

  const options = {};

  let start;
  let end;

  if (range) {
    const bytesPrefix = 'bytes=';
    if (range.startsWith(bytesPrefix)) {
      const bytesRange = range.substring(bytesPrefix.length);
      const parts = bytesRange.split('-');
      if (parts.length === 2) {
        const rangeStart = parts[0] && parts[0].trim();
        if (rangeStart && rangeStart.length > 0) {
          options.start = start = parseInt(rangeStart);
        }
        const rangeEnd = parts[1] && parts[1].trim();
        if (rangeEnd && rangeEnd.length > 0) {
          options.end = end = parseInt(rangeEnd);
        }
      }
    }
  }

  res.setHeader('content-type', 'video/mp4');

  fs.stat(videoPath, (err, stat) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error('Error ->', err);
      res.sendStatus(500);
      return;
    }

    let contentLength = stat.size;

    if (req.method === 'HEAD') {
      res.statusCode = 200;
      res.setHeader('accept-ranges', 'bytes');
      res.setHeader('content-length', contentLength);
      res.end();
    } else {
      let retrievedLength;
      if (start !== undefined && end !== undefined) {
        retrievedLength = end + 1 - start;
      } else if (start !== undefined) {
        retrievedLength = contentLength - start;
      } else if (end !== undefined) {
        retrievedLength = end + 1;
      } else {
        retrievedLength = contentLength;
      }

      res.statusCode = start !== undefined || end !== undefined ? 206 : 200;

      res.setHeader('content-length', retrievedLength);

      if (range !== undefined) {
        res.setHeader(
          'content-range',
          `bytes ${start || 0}-${end || contentLength - 1}/${contentLength}`,
        );
        res.setHeader('accept-ranges', 'bytes');
      }

      const fileStream = fs.createReadStream(videoPath, options);
      fileStream.on('error', (error) => {
        // eslint-disable-next-line no-console
        console.log('Error => ', error);
        res.sendStatus(500);
      });

      res.setHeader('cache-control', 'public, max-age=43200');
      fileStream.pipe(res);
    }
  });
};
