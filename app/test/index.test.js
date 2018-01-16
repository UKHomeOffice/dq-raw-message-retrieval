const rewire = require('rewire')
const app = rewire('../')
const chai = require('chai')
const sinon = require('sinon')
const request = require('supertest');

chai.use(require('sinon-chai'))

chai.use(require('chai-as-promised'))
var expect = chai.expect

describe('RMR tool', () => {
  describe('get_zip_path_from_url', () => {
    it('should return the correct path for the zip from the url', () =>
      expect(app.__get__('get_zip_path_from_url')
      ('/ignored/zipfile_date/filedir/filename'))
        .to.equal('/filename'))
  })

  describe('get_zip_name_from_url', () => {
    it('should return the correct zip name from the url', () =>
      expect(app.__get__('get_zip_name_from_url')
      ('/ignored/zipfile_date/filedir/filename'))
        .to.equal('filename'))
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

  describe('Browser Tests', function() {
    xit('should display zip contents successfully', function(done) {
      return request(app)
        .get('/')
        .expect(200)
        .then(response => {
          assert(response.body, 'foobar')
        })
    });
  });

  after(() => {
    app.__get__('http_server').close()
  })
})
