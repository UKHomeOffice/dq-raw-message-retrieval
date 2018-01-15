const rewire = require('rewire')
const app = rewire('../')
const chai = require('chai')
const sinon = require('sinon')

chai.use(require('sinon-chai'))

chai.use(require('chai-as-promised'))
var expect = chai.expect

describe('RMR tool', () => {
  describe('get_zip_path_from_url', () => {
    it('should return the correct path from the url', () =>
      expect(app.__get__('get_zip_path_from_url')('/ignored/zipfile_date/filedir/filename')).to.eventually.equal('E:\\RAW_ARCHIVE/date/zipfile_date'))
  })

  describe('get_filepath_in_zip_from_url', () => {
    it('should return the correct path inside the zip from the url', () =>
      expect(app.__get__('get_filepath_in_zip_from_url')
      ('/ignored/zipfile_date/filedir/filename'))
        .to.equal('filedir/filename'))
  })

  describe('make_buffer_from_file', () => {
    it('should return a buffer given a file', () =>
      expect(app.__get__('make_buffer_from_file')('../zip_file_fixture.zip')).to.eventually.be.instanceof(Buffer)
    )
    it('should reject an invalid file', () =>
      expect(app.__get__('make_buffer_from_file')('nofile')).to.be.rejected
    )
  })

  describe('read_file_from_zip_buffer', () => {
    it('should return foobar', () => {
      const buffer = Buffer.from('UEsDBAoAAAAAADJUK0wAAAAAAAAAAAAAAAAIABAAZmlsZWRpci9VWAwAqUBXWn89V1r2ARQAUEsDBBQACAAIADJUK0wAAAAAAAAAAAAAAAAQABAAZmlsZWRpci9maWxlbmFtZVVYDABjPldafz1XWvYBFABLy89PSiziAgBQSwcIR5cssgkAAAAHAAAAUEsBAhUDCgAAAAAAMlQrTAAAAAAAAAAAAAAAAAgADAAAAAAAAAAAQO1BAAAAAGZpbGVkaXIvVVgIAKlAV1p/PVdaUEsBAhUDFAAIAAgAMlQrTEeXLLIJAAAABwAAABAADAAAAAAAAAAAQKSBNgAAAGZpbGVkaXIvZmlsZW5hbWVVWAgAYz5XWn89V1pQSwUGAAAAAAIAAgCMAAAAjQAAAAAA', 'base64')
      expect(app.__get__('read_file_from_zip_buffer')(buffer, 'filedir/filename')).to.equal('foobar\n')
    })
  })

  describe('request_hander', () => {
    const res = {
      writeHead: sinon.stub(),
      end: sinon.stub()
    }
    const req = {url: '/ignored/zipfile_date/filedir/filename'}
    it('should write the head as html', () =>
      app.__get__('request_handler')(req, res)
        .then(() =>
          expect(res.writeHead).to.be.calledWith(200, {'Content-Type': 'text/html'}))
    )

    it('should return everything we expect', () =>
      app.__get__('request_handler')(req, res)
        .then(() =>
          expect(res.end).to.be.calledWithMatch('foobar')
        )
    )
    it('should return a 404 for files not found', () =>
      app.__get__('request_handler')({url: 'not_a_file'}, res)
        .then(() =>
          expect(res.writeHead).to.be.calledWithMatch(404)
        )
    )
  })

  after(() => {
    app.__get__('http_server').close()
  })
})
