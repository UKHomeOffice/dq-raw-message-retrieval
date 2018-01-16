const AWS = require('aws-sdk')
const fs = require('fs')
const http = require('http')
const admzip = require('adm-zip')
const readFileAsync = require('util').promisify(require('fs').readFile)
let s3 = new AWS.S3({
  params: {Bucket: process.env.Bucket}
})

const header = '<!DOCTYPE html>\n' +
  '<html>\n' +
  '<body>\n' +
  '<font face="courier">'

const footer = '</font>\n' +
  '</body>\n' +
  '</html>\n'

const get_zip_path_from_url = url => /\/\w+$/.exec(url)[0]

const get_zip_name_from_url = url => /\w+$/.exec(url)[0]

const read_file_from_zip_buffer = (buffer, file_path) =>
  new admzip(buffer).readAsText(file_path)

const request_handler = (req, res) => {
  const zip_path = get_zip_path_from_url(req.url);
  const zip_name = get_zip_name_from_url(req.url);

  s3.getObject({ Key: zip_name }).promise()
    .then(response => read_file_from_zip_buffer(response.Body, zip_path))
    .then(payload => {
      res.writeHead(200, {'Content-Type': 'text/html'})
      return res.end(templated_response(payload))
    })
    .catch(e => {
      res.writeHead(404)
      return res.end(e)
    })
}

const http_server = http.createServer(request_handler).listen(3000)
module.exports = http_server


const templated_response = payload => header + payload + footer
