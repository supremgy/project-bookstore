const express = require('express');
const router = express.Router();
router.use(express.json());

//결제
router.post('/', (req, res) => {
  res.json('결제');
});
//주문목록내역 조회
router.get('/', (req, res) => {
  res.json('주문목록내역 조회');
});
//주문상세 상품조회
router.get('/:id', (req, res) => {
  res.json('주문상세 상품조회');
});
module.exports = router;
