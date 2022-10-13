const rewire = require('rewire')
const app = rewire('../')
const chai = require('chai')
const sinon = require('sinon')
const request = require('supertest')
const db = require('../db')
const expect = chai.expect

chai.use(require('sinon-chai'))
chai.use(require('chai-as-promised'))

// Example Url
// https://analysis.dq.homeoffice.gov.uk/raw/index.js/s4/raw/2018/01/12/RAW_20180112_1929_1170.zip/1929/2018-01-12T19-29-44Z_<GUID>_Raw.txt
// E:\RAW_ARCHIVE/20180112/RAW_20180112_1929_1170.zip/1929/2018-01-12T19-29-44Z_<GUID>_Raw.txt

// {
//   key: "20180112/RAW_20180112_1929_1170.zip",
//     Bucket: "whatever",
//   locationinsidezip: "1929/2018-01-12T19-29-44Z_<GUID>_Raw.txt"
//
// }
// E:\RAW_ARCHIVE/20180112/RAW_20180112_1929_1170.zip/1929/2018-01-12T19-29-44Z_<GUID>_Raw.txt
// s3://s3-dq-data-archive-bucket-notprod/s4/raw/2022/09/12/RAW_20220912_1202_0001.zip
/**
insert into rpt_internal.raw_message_index(guid, zip_filename,s3_pathname,filename  )
values( 'acb67779-371e-4b51-a350-7984be32890b',
        'RAW_20220912_1202_0001.zip',
        's4/raw/2022/09/12/RAW_20220912_1202_0001.zip',
        '1201/5.xml');

https://retrieve-a-raw-message.notprod.dq.homeoffice.gov.uk/raw/index.js/s4/raw/2022/09/12/RAW_20220912_1202_0001.zip/1201/5.xml
https://retrieve-a-raw-message.notprod.dq.homeoffice.gov.uk/raw/guid/acb67779-371e-4b51-a350-7984be32890b
 */
const valid_zip_buffer = Buffer.from('UEsDBAoAAAAAADJUK0wAAAAAAAAAAAAAAAAIABAAZmlsZWRpci9VWAwAqUBXWn89V1r2ARQAUEsDBBQACAAIADJUK0wAAAAAAAAAAAAAAAAQABAAZmlsZWRpci9maWxlbmFtZVVYDABjPldafz1XWvYBFABLy89PSiziAgBQSwcIR5cssgkAAAAHAAAAUEsBAhUDCgAAAAAAMlQrTAAAAAAAAAAAAAAAAAgADAAAAAAAAAAAQO1BAAAAAGZpbGVkaXIvVVgIAKlAV1p/PVdaUEsBAhUDFAAIAAgAMlQrTEeXLLIJAAAABwAAABAADAAAAAAAAAAAQKSBNgAAAGZpbGVkaXIvZmlsZW5hbWVVWAgAYz5XWn89V1pQSwUGAAAAAAIAAgCMAAAAjQAAAAAA', 'base64')

const mock_s3 = params => {
    return {
      promise: () => new Promise((resolve, reject) => {
      if(params.Key === "s4/raw/YYYY/MM/DD/zip_file_fixture.zip")
        return resolve({Body:valid_zip_buffer})
      return reject("NoSuchKey: The specified key does not exist")
    })
  }
}

describe('RMR tool', () => {
  let s3_getObject_stub
  let dbStub
  before(() => {
    s3_getObject_stub = sinon.stub(app.__get__('s3'), 'getObject').callsFake(mock_s3)
    dbStub = sinon.stub(db)
    dbStub.query.resolves({rows: [{
      guid: 'xxx',
      zip_filename: 'zip_file_fixture.zip',
      s3_pathname: 's4/raw/YYYY/MM/DD/zip_file_fixture.zip',
      filename: 'filedir/filename'
    }]})
  })

  after((done) => {
    app.close()
    s3_getObject_stub.restore()
    done()
  })

  describe('read_file_from_zip_buffer', () => {
    it('should return foobar', () => {
      expect(app.__get__('read_file_from_zip_buffer')(valid_zip_buffer, 'filedir/filename')).to.equal('foobar\n')
    })
  });

  describe('request_handler', () => {
    const res = {
      status: sinon.stub(),
      send: sinon.stub()
    }
    const req = {url: '/raw/index.js/s4/raw/YYYY/MM/DD/zip_file_fixture.zip/filedir/filename'}
    it('should write the head as html', () =>
      request(app)
        .get("/raw/index.js/s4/raw/YYYY/MM/DD/zip_file_fixture.zip/filedir/filename")
        .expect(200)
        .end(function(err, res){
          expect(res.status).to.be.calledWith(200, {'Content-Type': 'text/html'})
        })
    )

    it('should return everything we expect', () =>
      request(app)
        .get("/raw/index.js/s4/raw/YYYY/MM/DD/zip_file_fixture.zip/filedir/filename")
        .expect(200)
        .end(function(err, res){
          expect(res.end).to.be.calledWithMatch('foobar')
        })
    )
  })

  describe('Browser Tests', () => {
    it('should display zip contents successfully', () =>
      request(app)
        .get('/raw/index.js/s4/raw/YYYY/MM/DD/zip_file_fixture.zip/filedir/filename')
        .expect(200)
        .then(response => {
            expect(response.text).to.have.string('foobar')
          })
    )
    it('should 404 on unknown path in zip', () =>
      request(app)
        .get('/raw/index.js/s4/raw/YYYY/MM/DD/zip_file_fixture.zip/filedir/nothere')
        .expect(404)
    )
    it('should 404 on unknown path to zip', () =>
      request(app)
        .get('/raw/index.js/s4/raw/YYYY/MM/DD/nothere.zip/filedir/filename')
        .expect(404)
    )
    it('should display zip contents successfully', () =>
      request(app)
        .get('/raw/guid/xxx')
        .expect(200)
        .then(response => {
            expect(response.text).to.have.string('foobar')
          })
    )
  })
})
