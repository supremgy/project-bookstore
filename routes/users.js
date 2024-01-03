const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  join,
  login,
  passwordRequestReset,
  passwordReset,
} = require('../controller/UserController');
const { StatusCodes } = require('http-status-codes');
const validate = (req, res, next) => {
  const err = validationResult(req);
  if (err.isEmpty()) {
    return next();
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json(err.array());
  }
};
router.use(express.json());
//회원가입
router.post('/join', [
  body('email').notEmpty().isEmail().withMessage('이메일을 입력해주세요.'),
  body('password').notEmpty().isString().withMessage('비밀번호를 입력하세요.'),
  validate,
  join,
]);
//로그인
router.post('/login', login);
// 비밀번호 초기화 요청
router.post('/reset', passwordRequestReset);
//비밀번호 초기화
router.put('/reset', passwordReset);

module.exports = router;
