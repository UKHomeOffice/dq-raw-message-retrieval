const http = require('http')
const admzip = require('adm-zip')
const readFileAsync = require('util').promisify(require('fs').readFile)

const header = '<!DOCTYPE html>\n' +
  '<html>\n' +
  '<body>\n' +
  '<font face="courier">'

const footer = '</font>\n' +
  '</body>\n' +
  '</html>\n'

const zip_root_path = 'E:\\RAW_ARCHIVE'

const get_zip_path_from_url = url => new Promise((resolve, reject) => {
  let result = new RegExp('((?<=^\\/.+\\/)[^\\/]+)((?<=_)[^\\/]+)').exec(url)
  if (!result) {
    return reject('did not match')
  }
  resolve(`${zip_root_path}/${result[2]}/${result[0]}`)
})

const get_filepath_in_zip_from_url = url => /\w+\/\w+$/.exec(url)[0]

const make_buffer_from_file = file_path =>
  readFileAsync(file_path)

const read_file_from_zip_buffer = (buffer, file_path) =>
  new admzip(buffer).readAsText(file_path)

const request_handler = (req, res) =>
  get_zip_path_from_url(req.url)
    .then(make_buffer_from_file)
    .then(buffer => read_file_from_zip_buffer(buffer, get_filepath_in_zip_from_url(req.url)))
    .then(payload => {
      res.writeHead(200, {'Content-Type': 'text/html'})
      return res.end(templated_response(payload))
    })
    .catch(e => {
      res.writeHead(404)
      return res.end(e)
    })

const http_server = http.createServer(request_handler).listen(3000)

const templated_response = payload => header + payload + footer
