const chai = require("chai");
const chaiHttp = require("chai-http");
const {createService} = require("../../src/quote-service");
const {getExpectedData} = require("../helpers/prepare");
const {getFailString} = require("../helpers/render");
const {validateResponse} = require("../helpers/validate");
const {expect} = chai;
chai.use(chaiHttp);

// create instance.
const app = createService();

describe("GET /authors?name=:name", () => {
  it("should return André Gide's biographical information", done => {
    const req = "/authors";
    const path = "./test/fixtures/authors_gide.json";
    const expectedData = getExpectedData(path);
    
    chai.request(app)
      .get(req)
      .query({name: "André Gide"})
      .end(async (err, res) => {
      try {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body, "response.body").to.be.a("object");
        expect(res.body.data, "response.body.data").to.be.a("array");
        
        const expected = await expectedData;
        
        expect(
          res.body.data.length, "response.body.data.length"
        ).to.equal(expected.data.length);
        
        if (!validateResponse(res.body.data, expected.data)) {
          expect.fail(null, null, getFailString(res.body, expected));
        }

        done();
      }
      catch (err) { done(err); }
    });
  });
  
  it("should return C.S. Lewis' biographical information", done => {
    const req = "/authors";
    const path = "./test/fixtures/authors_lewis.json";
    const expectedData = getExpectedData(path);
    
    chai.request(app)
      .get(req)
      .query({name: "C.S. Lewis"})
      .end(async (err, res) => {
      try {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body, "response.body").to.be.a("object");
        expect(res.body.data, "response.body.data").to.be.a("array");
        
        const expected = await expectedData;
        
        expect(
          res.body.data.length, "response.body.data.length"
        ).to.equal(expected.data.length);
        
        if (!validateResponse(res.body.data, expected.data)) {
          expect.fail(null, null, getFailString(res.body, expected));
        }

        done();
      }
      catch (err) { done(err); }
    });
  });
  
  it('should return an empty data array on no content query "foo"', async () => {
    const req = "/authors";
    const res = await chai.request(app).get(req).query({name: "foo"});
    expect(res).to.have.status(200);
    expect(res).to.be.json;
    expect(res.body, "response.body").to.be.a("object");
    expect(res.body.data, "response.body.data").to.be.a("array");
    expect(res.body.data.length, "response.body.data.length").to.equal(0);
  });
});

describe("GET /authors", () => {
  it("should return an array of biographical info for all authors", done => {
    const req = "/authors";
    const path = "./test/fixtures/authors.json";
    const expectedData = getExpectedData(path);
    
    chai.request(app).get(req).end(async (err, res) => {
      try {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body, "response.body").to.be.a("object");
        expect(res.body.data, "response.body.data").to.be.a("array");
        
        const expected = await expectedData;
        
        expect(
          res.body.data.length, "response.body.data.length"
        ).to.equal(expected.data.length);
        
        if (!validateResponse(res.body.data, expected.data)) {
          expect.fail(null, null, getFailString(res.body, expected));
        }

        done();
      }
      catch (err) { done(err); }
    });
  });
});

describe("GET /authors/alt", () => {
  before(function() {
    // HACK: skip the tests in staging environment until we find to provide db in it
    if(true || process.env.NODE_ENV === 'staging') {
      this.skip();
    }
  });
  
  it("should return an array of biographical info for all authors", done => {
    const req = "/authors/alt";
    const path = "./test/fixtures/authors.json";
    const expectedData = getExpectedData(path);
    
    chai.request(app).get(req).end(async (err, res) => {
      try {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body, "response.body").to.be.a("object");
        expect(res.body.data, "response.body.data").to.be.a("array");
        
        const expected = await expectedData;
        
        expect(
            res.body.data.length, "response.body.data.length"
        ).to.equal(expected.data.length);
        
        if (!validateResponse(res.body.data, expected.data)) {
          expect.fail(null, null, getFailString(res.body, expected));
        }
        
        done();
      }
      catch (err) { done(err); }
    });
  });
});
