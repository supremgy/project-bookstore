const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');

//(카테고리별, 신간 여부 ) 전체 도서 목록 조회
const allBooks = (req, res) => {
  const { category_id, news, limit, currentPage } = req.query;
  //limit : page page 당 도 서 수
  // currentPage : 현재  몇 페이지
  //offset : limit * (currentPage-1)
  let offset = limit * (currentPage - 1);
  let sql = 'select * from books ';
  let values = [];
  if (category_id && news) {
    sql +=
      'WHERE category_id = ? AND pub_date between date_sub(now(), interval 1 month) and now()';
    values = [category_id];
  } else if (category_id) {
    sql += 'WHERE category_id = ?';
    values = [category_id];
  } else if (news) {
    sql += 'where pub_date between date_sub(now(), interval 1 month) and now()';
  }
  sql += ' LIMIT ? OFFSET ?';
  values.push(parseInt(limit), offset);
  //카테고리별 도서 조회
  console.log('sql', sql);
  console.log('values', values);
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    if (results.length) {
      return res.status(StatusCodes.OK).json(results);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

const bookDetail = (req, res) => {
  let { id } = req.params;
  id = parseInt(id);
  let sql =
    'select * from books left join category on books.category_id = category.id WHERE books.id = ?;';
  conn.query(sql, id, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    if (results[0]) {
      return res.status(StatusCodes.OK).json(results[0]);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

module.exports = {
  allBooks,
  bookDetail,
};
