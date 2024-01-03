const conn = require('../mariadb');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto'); // 암호화
dotenv.config();
const { StatusCodes } = require('http-status-codes');
const join = (req, res) => {
  const { email, password } = req.body;

  // 비밀번호 암호화
  //회원가입 시 비번을 암호화해서 암호화된 비번과 salt 값응ㄹ 같이 저장
  const salt = crypto.randomBytes(10).toString('base64');
  const hashPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, 'sha512')
    .toString('base64');

  let sql = 'INSERT INTO users (email, password,salt) VALUES (?,?,?)';
  let values = [email, hashPassword, salt];
  conn.query(
    sql,
    values, //
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }
      return res.status(StatusCodes.CREATED).json(results);
    }
  );
};

const login = (req, res) => {
  const { email, password } = req.body;
  let sql = 'SELECT * FROM users WHERE email = ?';
  conn.query(sql, email, (err, results) => {
    if (err) {
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    var loginUser = results[0];

    // salt값 꺼내서 날 것으로 들어온 비번 암호화  해보고
    const hashPassword = crypto
      .pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512')
      .toString('base64');
    //->  디비 비번이랑 비교

    if (loginUser && loginUser.password == hashPassword) {
      const token = jwt.sign(
        {
          email: loginUser.email,
          password: loginUser.password,
        },
        process.env.PRIVATE_KEY,
        {
          expiresIn: '10m',
          issuer: 'songa',
        }
      );

      res.cookie('token', token, {
        httpOnly: true,
      });

      console.log('token', token);

      return res.status(StatusCodes.OK).json(results);
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).end();
    }
  });
};
const passwordRequestReset = (req, res) => {
  const { email } = req.body;
  let sql = 'SELECT * FROM users WHERE email = ?';
  conn.query(sql, email, (err, results) => {
    if (err) {
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    var user = results[0];
    if (user) {
      return res.status(StatusCodes.OK).json({
        email,
      });
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).end();
    }
  });
};
const passwordReset = (req, res) => {
  let { email, password } = req.body;

  const salt = crypto.randomBytes(10).toString('base64');
  const hashPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, 'sha512')
    .toString('base64');

  let values = [hashPassword, salt, email];
  let sql = 'UPDATE users SET password = ?, salt=? WHERE email = ?';
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    if (results.affectedRows == 0) {
      return res.status(StatusCodes.BAD_REQUEST).end();
    } else {
      return res.status(StatusCodes.OK).json(results);
    }
  });
};
module.exports = { join, login, passwordRequestReset, passwordReset };
