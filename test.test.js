process.env.NODE_ENV = "test";
 
const request = require("supertest");
const app = require("./app");
const db = require("./db");
const Book = require("./models/book");


beforeEach(async () => {
    const result = await Book.create({
        "isbn": "0691161518555",
        "amazon_url": "http://a.co/tbody",
        "author": "liu cxing",
        "language": "manderen",
        "pages": 560,
        "publisher": "The people of earth",
        "title": "Remembrance of Earths Past",
        "year": 2016
    });
});



describe("GET /", function () {
    test('returns all books', async () => {
        const result = await request(app).get('/books')
        expect(result.status).toBe(200)
        expect(result.text).toEqual('{"books":[{"isbn":"0691161518555","amazon_url":"http://a.co/tbody","author":"liu cxing","language":"manderen","pages":560,"publisher":"The people of earth","title":"Remembrance of Earths Past","year":2016}]}')
    })
})



// delete all books from test db
afterEach(async function () {
    await db.query("DELETE from books;")
});

// stop server
afterAll(async function () {
    await db.end()
})
