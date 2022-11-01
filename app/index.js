const { S3 } = require('aws-sdk')
const admzip = require('adm-zip')
const express = require('express')
const db = require('./db')
const {BUCKET_NAME} = process.env

const app = express()

let s3 = new S3({
  logger: console,
  stats: {
    retries: true,
    timer: false,
    http: true
  },
  params: {
    Bucket: BUCKET_NAME
  },
  http: {
   connect_timeout: 1
  }
})

const read_file_from_zip_buffer = (buffer, file_path) => {
  const zf = new admzip(buffer)
  return zf.readAsText(file_path)
}

app.get('/raw/index.js/s4/raw/:year/:month/:day/:zipFile/:zipFileName/s4/raw/:year2/:month2/:day2/:zipFile2/:fileDir/:fileName', async function(req, res) {
    try {
      const file_path = `${req.params.fileDir}/${req.params.fileName}`
      const zip_name = `s4/raw/${req.params.year}/${req.params.month}/${req.params.day}/${req.params.zipFile}`

      const payload = await s3.getObject({ Key: zip_name }).promise()
        .then(response => read_file_from_zip_buffer(response.Body, file_path))
      if (payload.length === 0)
        throw('Not Found')
      res.status(200, {'Content-Type': 'text/html'})
      res.send(templated_response(payload))
    }
    catch (e) {
      res.status(404)
      res.send(e.toString())
    }
});

app.get('/raw/guid/:guid', async function(req, res, err) {
    try {
      const queryString = `select guid, zip_filename, s3_pathname, filename
        from rpt_internal.raw_message_index where guid='${req.params.guid}'`
      const result = await db.query(queryString)
      if (result.rows.length === 0) {
        throw('GUID not Found')
      }
      const file_path = result.rows[0].filename
      const zip_name = result.rows[0].s3_pathname

      const payload = await s3.getObject({ Key: zip_name }).promise()
        .then(response => read_file_from_zip_buffer(response.Body, file_path))
      if (payload.length === 0) {
        throw('File not Found')
      }
      res.status(200, {'Content-Type': 'text/html'})
      res.send(templated_response(payload))
    }
    catch (e) {
      console.log(e)
      console.log(e.toString())
      res.status(404)
      res.send(e.toString())
    }
});

const server = app.listen(3000);

const templated_response = payload => `<!DOCTYPE html>
<html>
<body>
<font face="courier">
${payload}
</font>
</body>
</html>
`

module.exports = server

